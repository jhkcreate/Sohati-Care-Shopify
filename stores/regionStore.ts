import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, cacheExchange, fetchExchange } from 'urql';
import { configs, setActiveRegionConfig } from '../config/store';
import type { StoreConfig } from '../config/store';

const REGION_KEY = 'sohaticare_region';

function createClient(config: StoreConfig) {
  return new Client({
    url: `https://${config.storefrontDomain}/api/${config.apiVersion}/graphql.json`,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': config.storefrontToken,
      },
    },
  });
}

interface RegionState {
  region: 'jo' | 'eg';
  config: StoreConfig;
  client: Client;
  initialized: boolean;
  initialize: () => Promise<void>;
  setRegion: (region: 'jo' | 'eg') => Promise<void>;
}

const defaultRegion = 'jo';

export const useRegionStore = create<RegionState>((set) => ({
  region: defaultRegion,
  config: configs[defaultRegion],
  client: createClient(configs[defaultRegion]),
  initialized: false,

  initialize: async () => {
    const saved = await AsyncStorage.getItem(REGION_KEY);
    const region = (saved === 'jo' || saved === 'eg') ? saved : defaultRegion;
    const config = configs[region];
    setActiveRegionConfig(config);
    set({
      region,
      config,
      client: createClient(config),
      initialized: true,
    });
  },

  setRegion: async (region) => {
    const config = configs[region];
    await AsyncStorage.setItem(REGION_KEY, region);
    setActiveRegionConfig(config);
    set({
      region,
      config,
      client: createClient(config),
    });
  },
}));

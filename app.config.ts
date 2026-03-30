import { ExpoConfig, ConfigContext } from 'expo/config';

const region = (process.env.STORE_REGION ?? 'jo').toLowerCase();

const regionNames: Record<string, string> = {
  jo: 'SohatiCare Jordan',
  eg: 'SohatiCare Egypt',
};

const regionSlugs: Record<string, string> = {
  jo: 'sohaticare-jo',
  eg: 'sohaticare-eg',
};

const bundleIds: Record<string, string> = {
  jo: 'com.sohaticare.jo',
  eg: 'com.sohaticare.eg',
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: regionNames[region] ?? 'SohatiCare',
  slug: regionSlugs[region] ?? 'sohaticare',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  scheme: `sohaticare-${region}`,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#61b69f',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleIds[region] ?? 'com.sohaticare.jo',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#61b69f',
    },
    package: bundleIds[region] ?? 'com.sohaticare.jo',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#61b69f',
      },
    ],
  ],
  extra: {
    storeRegion: region,
  },
});

import { Client, cacheExchange, fetchExchange } from 'urql';
import { storeConfig } from '../config/store';

export const shopifyClient = new Client({
  url: `https://${storeConfig.storefrontDomain}/api/${storeConfig.apiVersion}/graphql.json`,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: {
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storeConfig.storefrontToken,
    },
  },
});

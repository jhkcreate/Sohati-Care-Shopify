import Constants from 'expo-constants';
import { joConfig } from './stores/jo';
import { egConfig } from './stores/eg';

export interface StoreConfig {
  region: 'jo' | 'eg';
  storefrontDomain: string;
  storefrontToken: string;
  apiVersion: string;
  currency: string;
  currencySymbol: string;
  currencyLocale: string;
  freeShippingThreshold: number;
  shippingFee: number;
  defaultCountry: string;
  defaultCity: string;
  whatsappNumber: string;
  appStoreId: string;
  playStoreId: string;
  pushTopic: string;
  bundleId: string;
}

export const configs: Record<string, StoreConfig> = {
  jo: joConfig,
  eg: egConfig,
};

const initialRegion = (
  Constants.expoConfig?.extra?.storeRegion ??
  process.env.EXPO_PUBLIC_STORE_REGION ??
  'jo'
).toLowerCase();

// Default static config — used as fallback
export const storeConfig: StoreConfig = configs[initialRegion] ?? joConfig;

// Runtime region accessor — reads from region store if available
function getActiveConfig(): StoreConfig {
  const g = globalThis as Record<string, unknown>;
  return (g.__sohaticare_config as StoreConfig) ?? storeConfig;
}

/** Call when region changes at runtime */
export function setActiveRegionConfig(config: StoreConfig) {
  (globalThis as Record<string, unknown>).__sohaticare_config = config;
}

export function formatPrice(amount: number | string, lang?: string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '';

  const config = getActiveConfig();
  const storedLang = typeof globalThis !== 'undefined' ? (globalThis as Record<string, unknown>).__sohaticare_lang as string | undefined : undefined;
  const currentLang = lang ?? storedLang ?? 'en';
  const localeMap: Record<string, Record<string, string>> = {
    en: { jo: 'en-JO', eg: 'en-EG' },
    ar: { jo: 'ar-JO', eg: 'ar-EG' },
  };
  const locale = localeMap[currentLang]?.[config.region] ?? `${currentLang}-${config.defaultCountry}`;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.currency === 'JOD' ? 3 : 2,
    maximumFractionDigits: config.currency === 'JOD' ? 3 : 2,
  }).format(value);
}

export function setFormatPriceLanguage(lang: string) {
  (globalThis as Record<string, unknown>).__sohaticare_lang = lang;
}

export function getDiscountPercent(price: string, compareAtPrice: string | undefined | null): number {
  if (!compareAtPrice) return 0;
  const p = parseFloat(price);
  const cp = parseFloat(compareAtPrice);
  if (cp <= p || cp === 0) return 0;
  return Math.round(((cp - p) / cp) * 100);
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { setFormatPriceLanguage } from '../config/store';

import en from './en.json';
import ar from './ar.json';

const LANGUAGE_KEY = 'sohaticare_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    const lang = savedLang ?? 'en';

    // Ensure RTL state matches the detected language on startup
    const shouldBeRTL = lang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }

    callback(lang);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Set initial language for price formatting
setFormatPriceLanguage('en');

i18n.on('languageChanged', (lng) => {
  setFormatPriceLanguage(lng);

  const isRTL = lng === 'ar';
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
});

export default i18n;

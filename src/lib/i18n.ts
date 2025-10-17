import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Simple cache for translations
const translationCache: { [key: string]: { [text: string]: string } } = {
  en: {},
  ar: {}
};

// Translation backend that uses a translation API
const translationBackend = {
  type: 'backend' as const,
  init: () => {},
  read: async (language: string, namespace: string, callback: any) => {
    // Return empty object - we'll translate on demand
    callback(null, {});
  },
  create: () => {}
};

// Function to translate text using LibreTranslate (free, open-source)
async function translateText(text: string, targetLang: string): Promise<string> {
  // Check cache first
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache[targetLang]?.[text]) {
    return translationCache[targetLang][text];
  }

  // If target is English, return as-is
  if (targetLang === 'en') {
    return text;
  }

  try {
    // Using MyMemory Translation API (free, no API key required)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;

      // Cache the translation
      if (!translationCache[targetLang]) {
        translationCache[targetLang] = {};
      }
      translationCache[targetLang][text] = translated;

      return translated;
    }
  } catch (error) {
    console.warn('Translation failed:', error);
  }

  // Fallback to original text
  return text;
}

i18n
  .use(translationBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
      cookieMinutes: 525600, // 1 year
    },

    react: {
      useSuspense: false
    }
  });

// Custom translation function that translates on the fly
const originalT = i18n.t.bind(i18n);
i18n.t = function(key: any, options?: any): any {
  const text = typeof key === 'string' ? key : key.toString();
  const currentLang = i18n.language;

  // If English or text is a key with dots (namespace), use default behavior
  if (currentLang === 'en' || text.includes('.')) {
    return originalT(key, options);
  }

  // For other languages, translate asynchronously
  // Return original text immediately, then update
  translateText(text, currentLang).then(translated => {
    // Update cache which will be used on re-render
  });

  // Return cached version if available, otherwise original
  return translationCache[currentLang]?.[text] || text;
} as any;

export { translateText };
export default i18n;

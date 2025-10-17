"use client";
import { useState, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

// Simple in-memory cache for translations
const translationCache: { [key: string]: { [text: string]: string } } = {
  en: {},
  ar: {}
};

// Track pending translations to avoid duplicate requests
const pendingTranslations: { [key: string]: Promise<string> } = {};

// Function to translate text
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;

  const cacheKey = text.toLowerCase().trim();
  const requestKey = `${targetLang}:${cacheKey}`;

  // Return cached translation if available
  if (translationCache[targetLang]?.[cacheKey]) {
    return translationCache[targetLang][cacheKey];
  }

  // If already translating, return existing promise
  if (pendingTranslations[requestKey]) {
    return pendingTranslations[requestKey];
  }

  // Create new translation request
  const translationPromise = (async () => {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText;

        if (!translationCache[targetLang]) {
          translationCache[targetLang] = {};
        }
        translationCache[targetLang][cacheKey] = translated;

        delete pendingTranslations[requestKey];
        return translated;
      }
    } catch (error) {
      console.warn('Translation failed for:', text, error);
    }

    delete pendingTranslations[requestKey];
    return text;
  })();

  pendingTranslations[requestKey] = translationPromise;
  return translationPromise;
}

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [forceUpdate, setForceUpdate] = useState(0);

  // Clear local translations when language changes
  useEffect(() => {
    setTranslations({});
    setForceUpdate(prev => prev + 1);
  }, [language]);

  const t = (text: string): string => {
    if (language === 'en') return text;

    const cacheKey = text.toLowerCase().trim();

    // Return cached translation if available
    if (translationCache[language]?.[cacheKey]) {
      return translationCache[language][cacheKey];
    }

    // Check local state for pending translations
    if (translations[text]) {
      return translations[text];
    }

    // Fetch translation in background
    translateText(text, language).then(translated => {
      setTranslations(prev => ({ ...prev, [text]: translated }));
    });

    return text;
  };

  return { t, language };
}

"use client";
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

// Simple in-memory cache for translations
const translationCache: { [key: string]: { [text: string]: string } } = {
  en: {},
  ar: {}
};

// Function to translate text using MyMemory API (free, no API key)
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'en') return text;

  const cacheKey = text.toLowerCase().trim();
  if (translationCache[targetLang]?.[cacheKey]) {
    return translationCache[targetLang][cacheKey];
  }

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

      return translated;
    }
  } catch (error) {
    console.warn('Translation failed for:', text);
  }

  return text;
}

interface TransProps {
  children: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function Trans({ children, className, as: Component = 'span' }: TransProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (language === 'en') {
      setTranslatedText(children);
      return;
    }

    const cacheKey = children.toLowerCase().trim();
    if (translationCache[language]?.[cacheKey]) {
      setTranslatedText(translationCache[language][cacheKey]);
      return;
    }

    translateText(children, language).then(setTranslatedText);
  }, [children, language]);

  const ComponentElement = Component as React.ElementType;
  return <ComponentElement className={className}>{translatedText}</ComponentElement>;
}

"use client";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';

// Global translation cache
const translationCache: { [key: string]: { [text: string]: string } } = {
  en: {},
  ar: {}
};

// Track what's being translated to avoid duplicates
const translating = new Set<string>();

// Batch translation queue
let translationQueue: string[] = [];
let translationTimeout: NodeJS.Timeout | null = null;

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests (much faster with Google)
let pendingBatches: Array<{ texts: string[], targetLang: string }> = [];
let isProcessingBatch = false;
let requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    const task = requestQueue.shift();
    if (task) {
      await task();
      lastRequestTime = Date.now();
    }
  }

  isProcessingQueue = false;
}

async function translateSingle(text: string, targetLang: string): Promise<void> {
  const cacheKey = text.toLowerCase().trim();

  if (translationCache[targetLang]?.[cacheKey]) {
    return;
  }

  try {
    // Use Google Translate unofficial API through translate.googleapis.com
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();

    // Google Translate returns an array: [[[translated_text, original_text, ...]]]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translated = data[0].map((item: any) => item[0]).join('');

      if (!translationCache[targetLang]) {
        translationCache[targetLang] = {};
      }
      translationCache[targetLang][cacheKey] = translated;

      // Update this specific text immediately
      updateTextNode(text, translated, targetLang);
    }

    translating.delete(`${targetLang}:${cacheKey}`);
  } catch (error) {
    console.warn('Translation failed for:', text);
    translating.delete(`${targetLang}:${cacheKey}`);
  }
}

function updateTextNode(originalText: string, translatedText: string, targetLang: string) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while (node = walker.nextNode()) {
    if (node.textContent?.trim() === originalText) {
      node.textContent = translatedText;
    }
  }
}

function queueTranslation(text: string, targetLang: string) {
  const cacheKey = text.toLowerCase().trim();
  const requestKey = `${targetLang}:${cacheKey}`;

  if (translating.has(requestKey) || translationCache[targetLang]?.[cacheKey]) {
    return;
  }

  translating.add(requestKey);

  // Add to request queue
  requestQueue.push(() => translateSingle(text, targetLang));

  // Start processing queue
  processQueue();
}

function updateAllTextNodes(targetLang: string) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while (node = walker.nextNode()) {
    if (node.textContent && node.textContent.trim()) {
      const text = node.textContent.trim();
      const cacheKey = text.toLowerCase().trim();

      if (translationCache[targetLang]?.[cacheKey]) {
        node.textContent = translationCache[targetLang][cacheKey];
      }
    }
  }
}

function translateAllText(targetLang: string) {
  if (targetLang === 'en') {
    // Reload page to reset to English
    window.location.reload();
    return;
  }

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textsToTranslate: string[] = [];
  let node;

  while (node = walker.nextNode()) {
    const parentElement = node.parentElement;

    // Skip script, style, certain elements, and elements with translate-check class
    if (parentElement &&
        !['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE'].includes(parentElement.tagName) &&
        !parentElement.closest('.translate-check')) {

      const text = node.textContent?.trim();
      if (text && text.length > 0 && text.length < 500 && !/^[0-9$£€¥₹₽\s\-\.,:;!?()[\]{}]+$/.test(text)) {
        const cacheKey = text.toLowerCase().trim();

        if (translationCache[targetLang]?.[cacheKey]) {
          // Use cached translation immediately
          node.textContent = translationCache[targetLang][cacheKey];
        } else {
          // Queue for translation
          textsToTranslate.push(text);
        }
      }
    }
  }

  // Queue translations one by one
  textsToTranslate.forEach(text => {
    queueTranslation(text, targetLang);
  });
}

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (language === 'en') {
      setIsTranslating(false);
      setProgress(0);
      return;
    }

    // Show loader
    setIsTranslating(true);
    setProgress(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 200);

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      translateAllText(language);

      // Set up mutation observer to translate new content
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent?.trim();
              if (text && text.length > 0 && text.length < 500) {
                const cacheKey = text.toLowerCase().trim();
                if (translationCache[language]?.[cacheKey]) {
                  node.textContent = translationCache[language][cacheKey];
                } else {
                  queueTranslation(text, language);
                }
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              setTimeout(() => translateAllText(language), 200);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Hide loader after translations start
      const hideLoaderTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsTranslating(false);
          setProgress(0);
        }, 300);
        clearInterval(progressInterval);
      }, 60000); // Show loader for 1 minute

      return () => {
        clearInterval(progressInterval);
        clearTimeout(hideLoaderTimer);
        observer.disconnect();
      };
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [language]);

  return (
    <>
      {isTranslating && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[99999] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Animated spinner */}
              <div className="relative mx-auto mb-6 w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-blue-300 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                جاري الترجمة...
              </h3>
              <p className="text-gray-600 mb-6">Translating to Arabic</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium text-blue">{progress}%</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

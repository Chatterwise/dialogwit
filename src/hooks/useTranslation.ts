import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<TranslationDictionary>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Dynamically import the JSON file for the current language
        const module = await import(`../i18n/${currentLanguage}.json`);
        setTranslations(module.default);
      } catch (err) {
        console.error(`Failed to load translations for ${currentLanguage}:`, err);
        setError('Failed to load translations.');
        setTranslations({}); // Clear translations on error
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // The translation function 't'
  const t = useCallback((key: string): string => {
    if (isLoading || error) {
      return key; // Return the key itself if translations are not loaded or there's an error
    }

    // Basic lookup for nested keys (e.g., 'auth.login.title')
    const keys = key.split('.');
    let current: string | TranslationDictionary = translations;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (typeof current === 'object' && current !== null && k in current) {
        current = (current as TranslationDictionary)[k];
      } else {
        return key; // Key not found
      }
    }

    return typeof current === 'string' ? current : key; // Return the string or the key if it's not a string
  }, [translations, isLoading, error]);

  return { t, isLoading, error };
};

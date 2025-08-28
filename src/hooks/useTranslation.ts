import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type Primitive = string | number | boolean | null | undefined;

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

type InterpValues = Record<string, Primitive>;

/**
 * Tell TS what Vite’s glob returns for these files.
 * This avoids `any` and keeps everything typed.
 */
const translationModules = import.meta.glob<{
  default: TranslationDictionary;
}>("/i18n/*.json");

/** Safely access a nested path from an object (dot notation). */
function getNestedString(
  dict: TranslationDictionary,
  key: string
): string | undefined {
  // Try direct flat key first
  const flat = dict[key];
  if (typeof flat === "string") return flat;

  // Then try nested path
  const parts = key.split(".");
  let current: string | TranslationDictionary | undefined = dict;
  for (const p of parts) {
    if (current && typeof current === "object" && p in current) {
      const next = current[p as keyof typeof current];
      current = next as string | TranslationDictionary | undefined;
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

/** Interpolate {{var}} placeholders with provided values (supports nested values like a.b). */
function interpolate(template: string, values?: InterpValues): string {
  if (!values) return template;
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_m, varName: string) => {
    const path = varName.split(".");
    let v: unknown = values;
    for (const seg of path) {
      if (v && typeof v === "object" && seg in (v as Record<string, unknown>)) {
        v = (v as Record<string, unknown>)[seg];
      } else {
        v = undefined;
        break;
      }
    }
    return v == null ? "" : String(v);
  });
}

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState<TranslationDictionary>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: load a JSON module by path if it exists
  const loadModuleIfExists = useCallback(async (path: string) => {
    const loader = translationModules[path];
    if (!loader) return null;
    const mod = await loader();
    return mod?.default ?? null;
  }, []);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const primaryPath = `/i18n/${currentLanguage}.json`;
        let dict = await loadModuleIfExists(primaryPath);

        // Fallback to English if primary not found
        if (!dict && currentLanguage !== "en") {
          dict = await loadModuleIfExists("/i18n/en.json");
        }

        if (!dict) {
          throw new Error(
            `No translation file found for ${currentLanguage} (and no en fallback).`
          );
        }

        setTranslations(dict);
      } catch (err) {
        console.error(
          `Failed to load translations for ${currentLanguage}:`,
          err
        );
        setError("Failed to load translations.");
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage, loadModuleIfExists]);

  /**
   * t() overloads:
   * - t("key")
   * - t("key", "Default text")
   * - t("key", { name: "Mike" })
   * - t("key", "Default {{name}}", { name: "Mike" })
   */
  const t = useCallback(
    (
      key: string,
      defaultOrValues?: string | InterpValues,
      maybeValues?: InterpValues
    ): string => {
      if (isLoading || error) return key;

      let defaultValue: string | undefined;
      let values: InterpValues | undefined;

      if (typeof defaultOrValues === "string") {
        defaultValue = defaultOrValues;
        values = maybeValues;
      } else {
        values = defaultOrValues;
      }

      const resolved = getNestedString(translations, key);
      const base = resolved ?? defaultValue ?? key;
      return interpolate(base, values);
    },
    [isLoading, error, translations]
  );

  return { t, isLoading, error, language: currentLanguage };
};

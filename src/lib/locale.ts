import { languages, DEFAULT_LANGUAGE } from "./languages";

const SUPPORTED = new Set(languages.map((l) => l.code));
const STORAGE_KEY = "preferredLanguage";
const COOKIE_NAME = "preferredLanguage";

function setCookie(name: string, value: string, days = 365) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

function getCookie(name: string): string | null {
  try {
    const nameEQ = `${name}=`;
    const parts = document.cookie.split("; ");
    for (const p of parts) {
      if (p.startsWith(nameEQ)) return decodeURIComponent(p.substring(nameEQ.length));
    }
    return null;
  } catch {
    return null;
  }
}

function deleteCookie(name: string) {
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function isSupportedLanguage(code: string | undefined | null): code is string {
  return !!code && SUPPORTED.has(code);
}

export function toSupportedLanguageOrNull(code?: string | null): string | null {
  if (!code) return null;
  const base = code.toLowerCase();
  // exact match first
  if (SUPPORTED.has(base)) return base;
  // try to match language part from locales like en-US -> en
  const primary = base.split("-")[0];
  return SUPPORTED.has(primary) ? primary : null;
}

export function getStoredPreferredLanguage(): string | null {
  try {
    const rawStorage = localStorage.getItem(STORAGE_KEY);
    const fromStorage = toSupportedLanguageOrNull(rawStorage);
    if (fromStorage) return fromStorage;
  } catch {
    // ignore
  }
  // cookie fallback
  try {
    const rawCookie = getCookie(COOKIE_NAME);
    return toSupportedLanguageOrNull(rawCookie);
  } catch {
    return null;
  }
}

export function setStoredPreferredLanguage(code: string): void {
  try {
    if (isSupportedLanguage(code)) {
      localStorage.setItem(STORAGE_KEY, code);
      setCookie(COOKIE_NAME, code);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearStoredPreferredLanguage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  deleteCookie(COOKIE_NAME);
}

export function detectBrowserLanguage(): string | null {
  try {
    const nav = window.navigator as Navigator & { languages?: readonly string[] };
    const list: string[] = [];
    if (Array.isArray(nav.languages) && nav.languages.length) {
      list.push(...nav.languages);
    }
    if (nav.language) list.push(nav.language);
    for (const l of list) {
      const supported = toSupportedLanguageOrNull(l);
      if (supported) return supported;
    }
    return null;
  } catch {
    return null;
  }
}

export function getBestLanguage(): string {
  return (
    getStoredPreferredLanguage() ||
    detectBrowserLanguage() ||
    DEFAULT_LANGUAGE
  );
}

// Simple IP-based geolocation suggestion using a public API.
// Returns a supported language code or null if unknown.
export async function getGeoLanguageSuggestion(): Promise<string | null> {
  try {
    // ipwho.is is a free, no-auth endpoint. You may swap as needed.
    const res = await fetch("https://ipwho.is/?fields=country_code,languages");
    if (!res.ok) return null;
    type IpWhoResponse = {
      country_code?: string;
      languages?: { code?: string } | Array<{ code?: string }>;
    };
    const data: IpWhoResponse = await res.json();
    // Prefer language list if provided, else infer from country.
    const langs: string | undefined = Array.isArray(data?.languages)
      ? data.languages[0]?.code
      : (data?.languages as { code?: string } | undefined)?.code;
    if (langs) {
      const supported = toSupportedLanguageOrNull(String(langs));
      if (supported) return supported;
    }
    const cc: string | undefined = data?.country_code;
    if (cc) {
      const mapByCountry: Record<string, string> = {
        US: "en",
        GB: "en",
        AU: "en",
        CA: "en",
        IE: "en",
        NZ: "en",
        IN: "en",
        ES: "es",
        MX: "es",
        AR: "es",
        CO: "es",
        CL: "es",
        PE: "es",
        VE: "es",
        UY: "es",
        PY: "es",
        BO: "es",
        EC: "es",
        CR: "es", // Costa Rica
        CU: "es", // Cuba
        DO: "es", // Dominican Republic
        GT: "es", // Guatemala
        HN: "es", // Honduras
        NI: "es", // Nicaragua
        PA: "es", // Panama
        PR: "es", // Puerto Rico
        SV: "es", // El Salvador
        GQ: "es", // Equatorial Guinea
        DE: "de",
        AT: "de",
        CH: "de",
        HU: "hu",
      };
      const guess = mapByCountry[cc.toUpperCase()];
      if (isSupportedLanguage(guess)) return guess;
    }
    return null;
  } catch {
    return null;
  }
}

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { languages } from "../lib/languages";
import { clearStoredPreferredLanguage } from "../lib/locale";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { ChevronDown } from "lucide-react";

// lang -> country code for the flag asset
const COUNTRY_BY_LANG: Record<string, string> = {
  en: "us",
  es: "es",
  hu: "hu",
  de: "de",
};

const FlagImg = ({ code }: { code: string }) => {
  const cc = COUNTRY_BY_LANG[code] ?? "un"; // fallback
  // 24x18 looks crisp; add srcSet for retina
  return (
    <img
      src={`https://flagcdn.com/24x18/${cc}.png`}
      srcSet={`https://flagcdn.com/48x36/${cc}.png 2x, https://flagcdn.com/72x54/${cc}.png 3x`}
      alt={`${code} flag`}
      width={18}
      height={14}
      className="inline-block rounded-[2px] shadow-sm"
      loading="lazy"
    />
  );
};

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { lang: urlLang } = useParams<{ lang?: string }>();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const navigateWithLang = (newLang: string) => {
    const segs = window.location.pathname.split("/").filter(Boolean);
    if (segs.length === 0) {
      navigate(`/${newLang}`);
      return;
    }
    segs[0] = newLang; // lang is first segment per your routes
    navigate(`/${segs.join("/")}`);
  };

  const onSelect = (code: string) => {
    setLanguage(code);
    if (urlLang) navigateWithLang(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.select", "Select language")}
        className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <FlagImg code={currentLanguage} />
        <span className="uppercase">{currentLanguage}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("language.list", "Languages")}
          className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden"
        >
          {languages.map((lang) => {
            const selected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selected
                    ? "text-primary-700 dark:text-primary-300 bg-primary-50/60 dark:bg-primary-900/10"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <FlagImg code={lang.code} />
                <span className="uppercase">{lang.code}</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 truncate">
                  {lang.name}
                </span>
              </button>
            );
          })}
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={() => {
              clearStoredPreferredLanguage();
              // Close the menu; do not navigate automatically.
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Reset language preference
          </button>
        </div>
      )}
    </div>
  );
};

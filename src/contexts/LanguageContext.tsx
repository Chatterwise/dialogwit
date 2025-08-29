import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { languages, DEFAULT_LANGUAGE } from "../lib/languages";
import GeoLanguageModal from "../components/GeoLanguageModal";
import { Helmet } from "react-helmet-async";
import SeoLangLinks from "../components/SeoLangLinks";
import {
  detectBrowserLanguage,
  getStoredPreferredLanguage,
  isSupportedLanguage,
  setStoredPreferredLanguage,
} from "../lib/locale";

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { lang } = useParams<{ lang: string }>(); // 'lang' will always be defined here
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize currentLanguage from URL param, or fallback to default if param is invalid
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (lang && languages.some((l) => l.code === lang)) {
      return lang;
    }
    // This case should ideally not be hit if App.tsx redirects correctly
    // but provides a fallback if somehow an invalid lang makes it here.
    return DEFAULT_LANGUAGE;
  });

  // Keep currentLanguage state in sync with URL param
  useEffect(() => {
    if (
      lang &&
      languages.some((l) => l.code === lang) &&
      lang !== currentLanguage
    ) {
      setCurrentLanguage(lang);
      // keep preference in localStorage in sync with URL
      setStoredPreferredLanguage(lang);
    }
  }, [lang, currentLanguage]);

  // If the URL param is invalid, redirect to best supported language
  useEffect(() => {
    if (!lang || !languages.some((l) => l.code === lang)) {
      const stored = getStoredPreferredLanguage();
      const detected = detectBrowserLanguage();
      const target = stored || detected || DEFAULT_LANGUAGE;
      if (target !== lang) {
        navigate(`/${target}`, { replace: true });
      }
    }
  }, [lang, navigate]);

  const setLanguage = (newLang: string) => {
    if (isSupportedLanguage(newLang) && newLang !== currentLanguage) {
      // persist preference
      setStoredPreferredLanguage(newLang);
      // Update the URL to reflect the new language
      const pathSegments = location.pathname.split("/").filter(Boolean);
      // pathSegments[0] is guaranteed to be the current language code due to App.tsx routing
      pathSegments[0] = newLang;
      navigate(`/${pathSegments.join("/")}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      <Helmet htmlAttributes={{ lang: currentLanguage }} />
      <SeoLangLinks />
      {children}
      {/* Offer IP-based suggestion when appropriate */}
      <GeoLanguageModal currentLanguage={currentLanguage} setLanguage={setLanguage} />
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { languages, DEFAULT_LANGUAGE } from "../lib/languages";

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
    }
  }, [lang, currentLanguage]);

  const setLanguage = (newLang: string) => {
    if (
      languages.some((l) => l.code === newLang) &&
      newLang !== currentLanguage
    ) {
      // Update the URL to reflect the new language
      const pathSegments = location.pathname.split("/").filter(Boolean);
      // pathSegments[0] is guaranteed to be the current language code due to App.tsx routing
      pathSegments[0] = newLang;
      navigate(`/${pathSegments.join("/")}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
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

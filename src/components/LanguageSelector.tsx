import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { languages } from "../lib/languages";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation"; // Import useTranslation

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { lang: urlLang } = useParams<{ lang?: string }>();
  const { t } = useTranslation(); // Use the translation hook

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    if (urlLang) {
      // If there's a language in the URL, update it directly
      const pathSegments = window.location.pathname.split("/").filter(Boolean);
      pathSegments[0] = newLang; // Assuming lang is always the first segment
      navigate(`/${pathSegments.join("/")}`);
    } else {
      // If no language in URL, set it and let LanguageProvider handle redirect
      setLanguage(newLang);
    }
  };

  return (
    <select
      value={currentLanguage}
      onChange={handleChange}
      className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {t(`language.${lang.code}`)} {/* Translate language names */}
        </option>
      ))}
    </select>
  );
};

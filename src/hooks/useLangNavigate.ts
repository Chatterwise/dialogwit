// hooks/useLangNavigate.ts
import { useCallback } from "react";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

function prefixLang(to: To, lang: string): To {
  if (typeof to === "string") {
    // Absolute path? prefix. Relative? leave it.
    return to.startsWith("/") ? `/${lang}${to}` : to;
  }
  // Object form
  const pathname = to.pathname
    ? (to.pathname.startsWith("/") ? `/${lang}${to.pathname}` : to.pathname)
    : to.pathname;
  return { ...to, pathname };
}

export function useLangNavigate() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === "number") return navigate(to);
      return navigate(prefixLang(to, currentLanguage), options);
    },
    [navigate, currentLanguage]
  );
}

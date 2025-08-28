import { Navigate } from "react-router-dom";
import { getBestLanguage } from "../lib/locale";

// Redirects from "/" to the best language route.
export default function LanguageRedirect() {
  const lang = getBestLanguage();
  return <Navigate to={`/${lang}`} replace />;
}


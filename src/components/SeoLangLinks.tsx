import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { languages } from "../lib/languages";

export default function SeoLangLinks() {
  const { pathname } = useLocation();
  // Expect path like /:lang/...
  const parts = pathname.split("/").filter(Boolean);
  const currentLang = parts[0] || "en";
  const rest = parts.length > 1 ? `/${parts.slice(1).join("/")}` : "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const links = languages.map((l) => ({
    lang: l.code,
    href: `${origin}/${l.code}${rest}`,
  }));
  const canonical = `${origin}/${currentLang}${rest}`;

  return (
    <Helmet>
      <link rel="canonical" href={canonical} />
      {links.map((x) => (
        <link key={x.lang} rel="alternate" hrefLang={x.lang} href={x.href} />
      ))}
      {/* x-default to English */}
      <link rel="alternate" hrefLang="x-default" href={`${origin}/en${rest}`} />
    </Helmet>
  );
}


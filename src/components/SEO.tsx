import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile" | "book";
  twitterCard?: "summary" | "summary_large_image";
  schemaType?:
    | "WebPage"
    | "Organization"
    | "Product"
    | "Article"
    | "FAQPage"
    | "BreadcrumbList";
  schemaData?: Record<string, any>;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = "https://bpzfivbuhgjpkngcjpzc.supabase.co/storage/v1/object/public/public-assets//chatterwise_page.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  schemaType = "WebPage",
  schemaData = {},
  keywords,
}) => {
  const siteUrl = "https://chatterwise.io";
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  // Base schema for the organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ChatterWise",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/chatterwise",
      "https://github.com/chatterwise",
      "https://linkedin.com/company/chatterwise",
    ],
  };

  // Schema for the current page
  let pageSchema: Record<string, any> = {};

  switch (schemaType) {
    case "WebPage":
      pageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: description,
        url: fullUrl,
        ...schemaData,
      };
      break;
    case "Product":
      pageSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        description: description,
        ...schemaData,
      };
      break;
    case "Article":
      pageSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description,
        image: ogImage,
        ...schemaData,
      };
      break;
    case "FAQPage":
      pageSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: schemaData.questions || [],
      };
      break;
    case "BreadcrumbList":
      pageSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: schemaData.itemListElement || [],
      };
      break;
    default:
      pageSchema = {
        "@context": "https://schema.org",
        "@type": schemaType,
        name: title,
        description: description,
        ...schemaData,
      };
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={fullUrl} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="ChatterWise" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
    </Helmet>
  );
};

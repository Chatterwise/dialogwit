import { useTranslation } from "../hooks/useTranslation";

export default function CookiePolicyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 bg-white text-neutral-800">
      <h1 className="text-3xl font-bold mb-6">{t("legal.cookies.title", "Cookie Policy")}</h1>
      <p className="text-sm text-gray-600">
        {t(
          "legal.last_updated",
          "Last updated: {{date}}",
          { date: new Date().toISOString().slice(0, 10) }
        )}
      </p>
      <section className="max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.cookies.essential", "Essential cookies")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.cookies.essential_text",
            "These are necessary to provide the service and cannot be switched off. They are usually set in response to actions you take, such as logging in or filling in forms."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.cookies.analytics", "Analytics cookies")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.cookies.analytics_text",
            "We use analytics to improve performance and user experience. These run only with your consent. You can change your choice at any time."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.cookies.manage", "How to manage cookies")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.cookies.manage_text",
            "Use the banner to accept or reject analytics cookies. You can also control cookies through your browser settings."
          )}
        </p>
      </section>
    </div>
  );
}



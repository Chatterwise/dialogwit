import { useTranslation } from "../hooks/useTranslation";

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 bg-white text-neutral-800">
      <h1 className="text-3xl font-bold mb-6">{t("legal.terms.title", "Terms of Service")}</h1>
      <p className="text-sm text-gray-600">
        {t(
          "legal.last_updated",
          "Last updated: {{date}}",
          { date: new Date().toISOString().slice(0, 10) }
        )}
      </p>
      <section className="max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.terms.use", "Use of the Service")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.terms.use_text",
            "You must use the service in compliance with applicable laws and these Terms. We may suspend accounts for misuse or security risks."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.terms.accounts", "Accounts")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.terms.accounts_text",
            "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.terms.fees", "Fees & billing")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.terms.fees_text",
            "If applicable, fees are charged as described at checkout. Taxes may apply. Subscriptions renew unless cancelled as per plan terms."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.terms.liability", "Liability")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.terms.liability_text",
            "To the extent permitted by law, we exclude indirect and consequential losses. Nothing limits liability for fraud or death/personal injury caused by negligence."
          )}
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-3">{t("legal.terms.law", "Governing law")}</h2>
        <p className="text-base leading-7">
          {t(
            "legal.terms.law_text",
            "These Terms are governed by the laws of England and Wales, and disputes are subject to the exclusive jurisdiction of its courts."
          )}
        </p>
      </section>
    </div>
  );
}



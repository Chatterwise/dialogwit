import { useTranslation } from "../hooks/useTranslation";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10 bg-white text-neutral-800">
      <h1 className="text-3xl font-bold mb-6">
        {t("legal.privacy.title", "Privacy Policy")}
      </h1>
      <p className="text-sm text-gray-600">
        {t(
          "legal.last_updated",
          "Last updated: {{date}}",
          { date: new Date().toISOString().slice(0, 10) }
        )}
      </p>
      <section className="max-w-none">
        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.controller.title", "Who we are")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.controller.text",
            "We are the data controller for the purposes of UK GDPR and PECR. This policy explains how we process personal data when you use our services."
          )}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.purposes.title", "What data we process and why")}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base leading-7">
            {t(
              "legal.purposes.service",
              "Service delivery: account, authentication, communications, and security (necessary for contract or legitimate interests)."
            )}
          </li>
          <li className="text-base leading-7">
            {t(
              "legal.purposes.analytics",
              "Analytics: improve performance and features (only with your consent; disabled until accepted)."
            )}
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.lawful_basis.title", "Lawful bases")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.lawful_basis.text",
            "We rely on contract (to provide the service), legitimate interests (security and fraud prevention), and consent (analytics cookies)."
          )}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.transfers.title", "International transfers")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.transfers.text",
            "Where data is transferred outside the UK, we implement appropriate safeguards such as standard contractual clauses and regional hosting when available."
          )}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.retention.title", "Retention")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.retention.text",
            "We keep personal data only as long as necessary for the purposes described or to comply with legal obligations."
          )}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.rights.title", "Your rights")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.rights.text",
            "You have rights under UK GDPR including access, rectification, erasure, restriction, objection, portability, and the right to withdraw consent."
          )}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">
          {t("legal.contact.title", "Contact")}
        </h2>
        <p className="text-base leading-7">
          {t(
            "legal.contact.text",
            "To exercise your rights or ask questions, contact us at privacy@yourdomain.example."
          )}
        </p>
      </section>
    </div>
  );
}



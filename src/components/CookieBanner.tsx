import { useEffect, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { getConsent, setConsent } from "../lib/consent";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const current = getConsent();
    setVisible(current === null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-neutral-800 dark:text-neutral-100">
              {t("cookies.banner_message", "We use essential cookies and, with your consent, analytics cookies to improve our service. You can change your choice at any time in our Cookie Policy.")}
              {" "}
              <Link to="cookies" className="underline">
                {t("cookies.banner_link", "Cookie Policy")}
              </Link>
              .
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium rounded-md border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                onClick={() => {
                  setConsent("rejected");
                  setVisible(false);
                }}
              >
                {t("cookies.reject", "Reject analytics")}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setConsent("accepted");
                  setVisible(false);
                }}
              >
                {t("cookies.accept", "Accept analytics")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



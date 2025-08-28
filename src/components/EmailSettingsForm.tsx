import React, { useState, useEffect } from "react";
import { Mail, Save, AlertTriangle, CheckCircle, Loader } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useEmail, EmailSettings } from "../hooks/useEmail";
import { useEmailUsage } from "../hooks/useEmailUsage";
import { useTranslation } from "../hooks/useTranslation";

export const EmailSettingsForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getEmailSettings, updateEmailSettings, isLoadingSettings } =
    useEmail();
  const { checkEmailAllowed } = useEmailUsage();

  const [settings, setSettings] = useState<EmailSettings>({
    enable_notifications: true,
    daily_digest: false,
    weekly_report: true,
    chatbot_alerts: true,
    marketing_emails: false,
  });

  const [emailsAllowed, setEmailsAllowed] = useState<boolean | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check email allowance
  useEffect(() => {
    const checkEmails = async () => {
      if (!user) return;
      try {
        const allowed = await checkEmailAllowed();
        setEmailsAllowed(allowed);
      } catch (err) {
        console.error("Error checking email limits:", err);
      }
    };
    checkEmails();
  }, [user]);

  // Update local state when settings are loaded
  useEffect(() => {
    if (getEmailSettings) {
      setSettings(getEmailSettings);
    }
  }, [getEmailSettings]);

  const handleSave = async () => {
    if (!user) return;

    setSaveSuccess(false);
    setError(null);

    try {
      await updateEmailSettings.mutateAsync(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving email settings:", err);
      setError(
        t(
          "emailSettings.saveError",
          "Failed to save email settings. Please try again."
        )
      );
    }
  };

  if (isLoadingSettings) {
    return (
      <div
        className="flex items-center justify-center h-32"
        role="status"
        aria-live="polite"
      >
        <Loader className="h-6 w-6 animate-spin text-primary-600" />
        <span className="sr-only">
          {t("emailSettings.loading", "Loading…")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Mail className="h-6 w-6 text-primary-600 mr-3" />
          <h3 className="text-lg font-bold text-gray-900">
            {t("emailSettings.title", "Email Settings")}
          </h3>
        </div>
        {/* <EmailUsageDisplay showDetails={false} /> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-green-700">
                {t(
                  "emailSettings.saveSuccess",
                  "Email settings saved successfully!"
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {emailsAllowed === false && !error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                {t("emailSettings.limitTitle", "Email Limit Reached")}
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {t(
                  "emailSettings.limitBody",
                  "You've reached your email limit for this month. Upgrade your plan to send more emails."
                )}
              </p>
              <a
                href="/pricing"
                className="mt-2 inline-flex items-center text-sm font-medium text-red-800 hover:text-red-900"
              >
                {t("emailSettings.viewUpgrade", "View upgrade options →")}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Enable notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {t("emailSettings.enableTitle", "Enable Email Notifications")}
              </h4>
              <p className="text-sm text-gray-500">
                {t(
                  "emailSettings.enableDesc",
                  "Receive important updates and notifications via email"
                )}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_notifications}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    enable_notifications: e.target.checked,
                  }))
                }
                className="sr-only peer"
                disabled={emailsAllowed === false}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Sub-options */}
          <div className="pl-6 space-y-4 border-l-2 border-gray-100">
            {/* Daily Digest */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {t("emailSettings.dailyTitle", "Daily Digest")}
                </h4>
                <p className="text-sm text-gray-500">
                  {t(
                    "emailSettings.dailyDesc",
                    "Receive a summary of your chatbot activity each day"
                  )}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.daily_digest}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      daily_digest: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                  disabled={
                    !settings.enable_notifications || emailsAllowed === false
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            {/* Weekly Report */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {t("emailSettings.weeklyTitle", "Weekly Report")}
                </h4>
                <p className="text-sm text-gray-500">
                  {t(
                    "emailSettings.weeklyDesc",
                    "Receive a weekly summary of your chatbot performance"
                  )}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weekly_report}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      weekly_report: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                  disabled={
                    !settings.enable_notifications || emailsAllowed === false
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            {/* Chatbot Alerts */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {t("emailSettings.alertsTitle", "Chatbot Alerts")}
                </h4>
                <p className="text-sm text-gray-500">
                  {t(
                    "emailSettings.alertsDesc",
                    "Get notified when your chatbots need attention"
                  )}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.chatbot_alerts}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      chatbot_alerts: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                  disabled={
                    !settings.enable_notifications || emailsAllowed === false
                  }
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>

          {/* Marketing Emails */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {t("emailSettings.marketingTitle", "Marketing Emails")}
              </h4>
              <p className="text-sm text-gray-500">
                {t(
                  "emailSettings.marketingDesc",
                  "Receive updates about new features and promotions"
                )}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.marketing_emails}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    marketing_emails: e.target.checked,
                  }))
                }
                className="sr-only peer"
                disabled={emailsAllowed === false}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={updateEmailSettings.isPending || emailsAllowed === false}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateEmailSettings.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {t("emailSettings.saving", "Saving...")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("emailSettings.save", "Save Settings")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

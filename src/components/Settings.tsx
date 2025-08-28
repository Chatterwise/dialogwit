import { useState } from "react";
import { User, Bell, Trash2, Save } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { EmailSettings } from "./EmailSettings";
import { ProfileSettings } from "./ProfileSettings";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { ActionModal } from "./ActionModal";
import { useBilling } from "../hooks/useBilling";
import { useTranslation } from "../hooks/useTranslation";

export const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const deleteAccountMutation = useDeleteAccount();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { usage } = useBilling();

  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "security" | "danger" | "email"
  >("profile");

  // const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
    chatbotAlerts: true,
    marketingEmails: false,
    apiKey: "sk-1234567890abcdef...",
    twoFactorEnabled: false,
    chatNotifications: true,
  });

  const availableTokens = usage?.available_tokens ?? null;

  const tabs = [
    { id: "profile", name: t("settings.tabs.profile", "Profile"), icon: User },
    {
      id: "notifications",
      name: t("settings.tabs.notifications", "Notifications"),
      icon: Bell,
    },
    // { id: "email", name: t("settings.tabs.email", "Email Settings"), icon: Mail },
    // { id: "security", name: t("settings.tabs.security", "Security"), icon: Shield },
    {
      id: "danger",
      name: t("settings.tabs.danger", "Danger Zone"),
      icon: Trash2,
    },
  ];

  const handleSave = () => {
    // Save settings logic here
    console.log(t("settings.save.logPrefix", "Saving settings:"), settings);
  };

  const handleDeleteConfirmed = async () => {
    setDeleteError(null);
    try {
      await deleteAccountMutation.mutateAsync(user.id);
      // Success is handled by the mutation's onSuccess (optional)
    } catch (error: any) {
      console.error(
        t("settings.delete.error.console", "Failed to delete account:"),
        error
      );
      if (error.message?.includes("active subscription")) {
        setDeleteError(
          t(
            "settings.delete.error.activeSubscription",
            "You cannot delete your account while you have an active subscription. Please cancel your subscription first."
          )
        );
      } else {
        setDeleteError(
          t("settings.delete.error.generic", "Failed to delete account: ") +
            (error.message || "")
        );
      }
      setShowDeleteModal(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const tokenCountItem =
    availableTokens !== null
      ? `${t(
          "settings.deleteModal.affected.hasTokensPrefix",
          "You currently have"
        )} ${availableTokens.toLocaleString()} ${t(
          "settings.deleteModal.affected.hasTokensSuffix",
          "unused tokens"
        )}`
      : null;

  return (
    <div className="space-y-8 dark:bg-gray-900 min-h-screen p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
          {t("settings.header.title", "Settings")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t(
            "settings.header.subtitle",
            "Manage your account settings and preferences."
          )}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-72">
          <nav
            className="space-y-1"
            aria-label={t("settings.sidebar.aria", "Settings sections")}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === (tab.id as typeof activeTab);
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "profile"
                        | "notifications"
                        // | "security"
                        | "danger"
                        | "email"
                    )
                  }
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-600 dark:border-primary-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.name}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {activeTab === "profile" && (
              <div className="p-8">
                <ProfileSettings />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
                  {t(
                    "settings.notifications.title",
                    "Notification Preferences"
                  )}
                </h3>

                <div className="space-y-8">
                  {/* Email notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(
                          "settings.notifications.email.title",
                          "Email Notifications"
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          "settings.notifications.email.desc",
                          "Receive email updates about your chatbots"
                        )}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        aria-label={t(
                          "settings.notifications.email.aria",
                          "Toggle email notifications"
                        )}
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Chat notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(
                          "settings.notifications.chat.title",
                          "Chat Notifications"
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          "settings.notifications.chat.desc",
                          "Get notified when someone chats with your bot"
                        )}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        aria-label={t(
                          "settings.notifications.chat.aria",
                          "Toggle chat notifications"
                        )}
                        checked={settings.chatNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            chatNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Weekly reports */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t(
                          "settings.notifications.weekly.title",
                          "Weekly Reports"
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          "settings.notifications.weekly.desc",
                          "Receive weekly analytics reports"
                        )}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        aria-label={t(
                          "settings.notifications.weekly.aria",
                          "Toggle weekly reports"
                        )}
                        checked={settings.weeklyReport}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            weeklyReport: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 transition-colors duration-200"
                      aria-label={t(
                        "settings.notifications.save.aria",
                        "Save notification preferences"
                      )}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {t("settings.notifications.save", "Save Preferences")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="p-8">
                <EmailSettings />
              </div>
            )}

            {activeTab === "danger" && (
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
                  {t("settings.danger.title", "Danger Zone")}
                </h3>

                <div className="space-y-6">
                  {/* Delete account */}
                  <div className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-900/20">
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-3">
                      {t("settings.danger.delete.title", "Delete Account")}
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-6">
                      {t(
                        "settings.danger.delete.desc",
                        "Once you delete your account, there is no going back. Please be certain."
                      )}
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-5 py-2.5 bg-red-600 dark:bg-red-700 text-white text-sm font-semibold rounded-xl hover:bg-red-700 dark:hover:bg-red-800 transition-colors duration-200"
                      aria-label={t(
                        "settings.danger.delete.aria",
                        "Delete account"
                      )}
                    >
                      {t("settings.danger.delete.button", "Delete Account")}
                    </button>
                    {deleteError && (
                      <p
                        className="mt-3 text-sm text-red-700 dark:text-red-300"
                        role="alert"
                      >
                        {deleteError}
                      </p>
                    )}
                  </div>

                  {/* Export data */}
                  <div className="border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 bg-yellow-50 dark:bg-yellow-900/20">
                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-3">
                      {t("settings.danger.export.title", "Export Data")}
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-6">
                      {t(
                        "settings.danger.export.desc",
                        "Download all your data including chatbots, Bot Knowledge, and chat logs."
                      )}
                    </p>
                    <button
                      className="px-5 py-2.5 bg-yellow-600 dark:bg-yellow-700 text-white text-sm font-semibold rounded-xl hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors duration-200"
                      aria-label={t(
                        "settings.danger.export.aria",
                        "Export your data"
                      )}
                    >
                      {t("settings.danger.export.button", "Export Data")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        action={{
          title: t("settings.deleteModal.title", "Delete Account"),
          description: t(
            "settings.deleteModal.description",
            "This action cannot be undone. All associated data will be permanently deleted."
          ),
          affectedItems: [
            t(
              "settings.deleteModal.affected.account",
              "Your account and profile information"
            ),
            t(
              "settings.deleteModal.affected.chatbots",
              "All chatbots and their data"
            ),
            t(
              "settings.deleteModal.affected.history",
              "Chat history and analytics"
            ),
            t(
              "settings.deleteModal.affected.knowledge",
              "Connected Bot Knowledge content"
            ),
            t(
              "settings.deleteModal.affected.integrations",
              "Integration configurations"
            ),
            ...(tokenCountItem ? [tokenCountItem] : []),
          ],
          onConfirm: handleDeleteConfirmed,
          actionLabel: t("settings.deleteModal.confirm", "Delete Account"),
          actionColor: "red",
          requireType: true,
          confirmationWord: t(
            "settings.deleteModal.confirmationWord",
            "DELETE"
          ),
          actionIcon: <Trash2 className="h-4 w-4 mr-2" />,
        }}
      />
    </div>
  );
};

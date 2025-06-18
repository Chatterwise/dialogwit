import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Mail,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { EmailSettings } from "./EmailSettings";
import { ProfileSettings } from "./ProfileSettings";

export const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "security" | "danger" | "email"
  >("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
    chatbotAlerts: true,
    marketingEmails: false,
    apiKey: "sk-1234567890abcdef...",
    twoFactorEnabled: false,
  });

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "email", name: "Email Settings", icon: Mail },
    { id: "security", name: "Security", icon: Shield },
    { id: "danger", name: "Danger Zone", icon: Trash2 },
  ];

  const handleSave = () => {
    // Save settings logic here
    console.log("Saving settings:", settings);
  };

  const handleDeleteAccount = () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // Delete account logic here
      console.log("Deleting account...");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-72">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "profile"
                        | "notifications"
                        | "security"
                        | "danger"
                        | "email"
                    )
                  }
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                      : "text-gray-600 hover:bg-primary-50 hover:text-gray-900"
                  }`}
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
          <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {activeTab === "profile" && (
              <div className="p-8">
                <ProfileSettings />
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">
                  Notification Preferences
                </h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your chatbots
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            emailNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Chat Notifications
                      </h4>
                      <p className="text-sm text-gray-500">
                        Get notified when someone chats with your bot
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.chatNotifications}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            chatNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Weekly Reports
                      </h4>
                      <p className="text-sm text-gray-500">
                        Receive weekly analytics reports
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReport}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            weeklyReport: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
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

            {activeTab === "security" && (
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">
                  Security Settings
                </h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      API Key
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Use this key to integrate with our API
                    </p>
                    <div className="flex items-center space-x-3">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={settings.apiKey}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 font-mono text-sm"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          twoFactorEnabled: !settings.twoFactorEnabled,
                        })
                      }
                      className={`px-5 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                        settings.twoFactorEnabled
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {settings.twoFactorEnabled ? "Enabled" : "Enable"}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Change Password
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                      />
                    </div>
                    <button className="mt-4 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">
                  Danger Zone
                </h3>
                <div className="space-y-6">
                  <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <h4 className="text-sm font-medium text-red-900 mb-3">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700 mb-6">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>

                  <div className="border border-yellow-200 rounded-xl p-6 bg-yellow-50">
                    <h4 className="text-sm font-medium text-yellow-900 mb-3">
                      Export Data
                    </h4>
                    <p className="text-sm text-yellow-700 mb-6">
                      Download all your data including chatbots, Bot Knowledge,
                      and chat logs.
                    </p>
                    <button className="px-5 py-2.5 bg-yellow-600 text-white text-sm font-semibold rounded-xl hover:bg-yellow-700 transition-colors duration-200">
                      Export Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

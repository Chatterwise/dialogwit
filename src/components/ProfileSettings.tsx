import React, { useState, useEffect } from "react";
import { Save, Loader, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile, useUpdateUserProfile } from "../hooks/useUserProfile";
import { saveAvatar } from "../lib/saveAvatar";
import { useTranslation } from "../hooks/useTranslation";

export const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useUserProfile(user?.id || "");
  const updateProfile = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
    company: "",
    timezone: "UTC-8",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setError] = useState<string | null>(null);

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        company: profile.company || "",
        timezone: profile.timezone || "UTC-8",
      });
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setError(
          t(
            "profile.validation.avatarTooLarge",
            "Avatar image must be less than 1MB"
          )
        );
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setError(null);

    if (!user) return;

    try {
      // First upload avatar if there's a new one
      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        avatarUrl = await saveAvatar(avatarFile);
      }

      // Then update profile
      await updateProfile.mutateAsync({
        id: user.id,
        updates: {
          ...formData,
          avatar_url: avatarUrl,
        },
      });

      setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setAvatarPreview(null);
      await refetchProfile?.();

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError(
        t(
          "profile.alerts.updateError",
          "Failed to update profile. Please try again."
        )
      );
    }
  };

  if (profileLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        role="status"
        aria-live="polite"
      >
        <Loader className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
        <span className="sr-only">
          {t("profile.loader.loading", "Loading...")}
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
        {t("profile.header.title", "Profile Information")}
      </h3>

      {saveSuccess && (
        <div
          className="mb-6 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <p className="text-sm text-green-700 dark:text-green-300">
              {t(
                "profile.alerts.updateSuccess",
                "Profile updated successfully!"
              )}
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {saveError}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-600">
            {avatarPreview || formData.avatar_url ? (
              <img
                src={avatarPreview || formData.avatar_url}
                alt={t("profile.avatar.alt", "Avatar")}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="text-3xl font-medium text-gray-400 dark:text-gray-300"
                aria-label={t("profile.avatar.initialsLabel", "User initials")}
                title={t("profile.avatar.initialsTitle", "User initials")}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <label
              className="relative cursor-pointer"
              aria-label={t("profile.avatar.change", "Change Avatar")}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
                aria-label={t("profile.avatar.inputAria", "Upload avatar")}
                title={t("profile.avatar.inputTitle", "Upload avatar")}
              />
              <div className="inline-flex items-center px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                {t("profile.avatar.change", "Change Avatar")}
              </div>
            </label>
            <p
              id="avatar-hint"
              className="text-xs text-gray-500 dark:text-gray-400 mt-2"
            >
              {t("profile.avatar.hint", "JPG, GIF or PNG. 1MB max.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("profile.labels.email", "Email Address")}
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              aria-disabled="true"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t("profile.labels.fullName", "Full Name")}
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder={t(
                "profile.placeholders.fullName",
                "Enter your full name"
              )}
              autoComplete="name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t("profile.labels.company", "Company")}
            </label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder={t(
                "profile.placeholders.company",
                "Your company name"
              )}
              autoComplete="organization"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t("profile.labels.timezone", "Time Zone")}
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              aria-describedby="timezone-hint"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="UTC-8">
                {t("profile.timezones.utcMinus8", "UTC-8 (Pacific Time)")}
              </option>
              <option value="UTC-5">
                {t("profile.timezones.utcMinus5", "UTC-5 (Eastern Time)")}
              </option>
              <option value="UTC+0">
                {t("profile.timezones.utcPlus0", "UTC+0 (GMT)")}
              </option>
              <option value="UTC+1">
                {t(
                  "profile.timezones.utcPlus1",
                  "UTC+1 (Central European Time)"
                )}
              </option>
              <option value="UTC+8">
                {t("profile.timezones.utcPlus8", "UTC+8 (China Standard Time)")}
              </option>
              <option value="UTC+9">
                {t("profile.timezones.utcPlus9", "UTC+9 (Japan Standard Time)")}
              </option>
            </select>
            <p
              id="timezone-hint"
              className="text-xs text-gray-500 dark:text-gray-400 mt-2"
            >
              {t(
                "profile.timezones.hint",
                "Choose the time zone used for notifications and scheduling."
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            aria-busy={updateProfile.isPending}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {updateProfile.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {t("profile.buttons.saving", "Saving...")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("profile.buttons.save", "Save Changes")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { Save, Loader, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile, useUpdateUserProfile } from "../hooks/useUserProfile";
import { supabase } from "../lib/supabase"; // Make sure this is imported

export const ProfileSettings = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(
    user?.id || ""
  );
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
        setError("Avatar image must be less than 1MB");
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
        const { data, error } = await uploadAvatar(avatarFile, user.id);
        if (error) throw new Error(error.message);
        if (data) avatarUrl = data.publicUrl;
      }

      // Then update profile
      await updateProfile.mutateAsync({
        id: user.id,
        updates: {
          ...formData,
          avatar_url: avatarUrl,
        },
      });

      setSaveSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const uploadAvatar = async (file: File, userId: string) => {
    const fileName = `avatar-${userId}-${Date.now()}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from("user-content")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) return { data: null, error };

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("user-content")
      .getPublicUrl(filePath);

    return { data: publicUrlData, error: null };
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-8">
        Profile Information
      </h3>

      {saveSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {saveError}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {avatarPreview || formData.avatar_url ? (
              <img
                src={avatarPreview || formData.avatar_url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-medium text-gray-400 dark:text-gray-300">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
              <div className="inline-flex items-center px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                Change Avatar
              </div>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Your company name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Zone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-primary-400 dark:focus:border-primary-500 transition bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="UTC-8">UTC-8 (Pacific Time)</option>
              <option value="UTC-5">UTC-5 (Eastern Time)</option>
              <option value="UTC+0">UTC+0 (GMT)</option>
              <option value="UTC+1">UTC+1 (Central European Time)</option>
              <option value="UTC+8">UTC+8 (China Standard Time)</option>
              <option value="UTC+9">UTC+9 (Japan Standard Time)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {updateProfile.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

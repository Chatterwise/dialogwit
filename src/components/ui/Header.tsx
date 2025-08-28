import { useState, useRef, useEffect } from "react";
import { Sun, Moon, LogOut, Menu, Plus, ChevronDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { motion } from "framer-motion";
import { useUserProfile } from "../../hooks/useUserProfile";
import { LanguageSelector } from "../LanguageSelector";
import { useTranslation } from "../../hooks/useTranslation";

export const Header = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { data: profile } = useUserProfile(user?.id || "");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const APP_VERSION: string = __APP_VERSION__;

  const avatarUrl =
    profile?.avatar_url ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

  useEffect(() => {
    const handleOutside = (e: PointerEvent) => {
      const target = e.target as Node;

      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (showCreateMenu && createMenuRef.current && !createMenuRef.current.contains(target)) {
        setShowCreateMenu(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setShowCreateMenu(false);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showUserMenu, showCreateMenu]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isDark = theme === "dark";

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label={t("header_mobile_menu_toggle", "Toggle mobile menu")}
          title={t("header_mobile_menu_toggle", "Toggle mobile menu")}
        >
          {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div></div>

        {/* Actions: Create, Language, Theme, Avatar */}
        <div className="flex items-center space-x-3">
          <LanguageSelector />

          {/* Create */}
          <div className="relative" ref={createMenuRef}>
            <motion.button
              onClick={() => {
                setShowCreateMenu((s) => !s);
                setShowUserMenu(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              aria-haspopup="menu"
              aria-expanded={showCreateMenu}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{t("header_create", "Create")}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </motion.button>

            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-30">
                <div className="py-1">
                  <Link
                    to="chatbots/new"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowUserMenu(false);
                    }}
                  >
                    {t("nav_new_chatbot", "New Chatbot")}
                  </Link>
                  <Link
                    to="bot-knowledge"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowUserMenu(false);
                    }}
                  >
                    {t("nav_add_knowledge", "Add Knowledge")}
                  </Link>
                  <Link
                    to="integrations"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setShowCreateMenu(false);
                      setShowUserMenu(false);
                    }}
                  >
                    {t("nav_new_integration", "New Integration")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            title={t("header_toggle_theme", "Toggle dark/light mode")}
            aria-label={t("header_toggle_theme", "Toggle dark/light mode")}
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </motion.button>

          {/* Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              onClick={() => {
                setShowUserMenu((s) => !s);
                setShowCreateMenu(false);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner bg-white dark:bg-gray-800"
              aria-label={t("header_user_menu", "User menu")}
              aria-haspopup="menu"
              aria-expanded={showUserMenu}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.email ?? t("header_user_avatar_alt", "User avatar")}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-base font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase() || t("header_user_initial_fallback", "U")}
                  </span>
                </div>
              )}
            </motion.button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 z-30 py-2 transition-all"
                tabIndex={-1}
              >
                {/* Email */}
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                  <span className="block font-semibold text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    to="settings"
                    className="block px-5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowCreateMenu(false);
                    }}
                  >
                    {t("nav_settings", "Settings")}
                  </Link>
                  <Link
                    to="billing"
                    className="block px-5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    {t("nav_billing", "Billing")}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-5 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all group"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                    <span className="group-hover:text-red-600">{t("header_sign_out", "Sign out")}</span>
                  </button>
                </div>

                {/* Version */}
                <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {t("header_version_prefix", "Version:")} {APP_VERSION}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="dashboard"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_home", "Home")}
            </Link>
            <Link
              to="chatbots/new"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_new_chatbot", "New Chatbot")}
            </Link>
            <Link
              to="bot-knowledge"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_add_knowledge", "Add Knowledge")}
            </Link>
            <Link
              to="integrations"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_new_integration", "New Integration")}
            </Link>
            <Link
              to="settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_settings", "Settings")}
            </Link>
            <Link
              to="billing"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowMobileMenu(false)}
            >
              {t("nav_billing", "Billing")}
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all group"
              aria-label={t("header_sign_out", "Sign out")}
              title={t("header_sign_out", "Sign out")}
            >
              <LogOut className="inline mr-2 h-4 w-4 text-gray-500 group-hover:text-red-600 transition-colors" />
              <span className="group-hover:text-red-600">{t("header_sign_out", "Sign out")}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

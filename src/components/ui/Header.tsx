import { useState } from "react";
import {
  Sun,
  Moon,
  LogOut,
  Bell,
  Menu,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { motion } from "framer-motion";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <Menu className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search chatbots, knowledge base..."
            />
          </div>
        </div>

        {/* Actions: Create, Notification, Theme Toggle, Avatar */}
        <div className="flex items-center space-x-3">
          {/* Create Button */}
          <div className="relative">
            <motion.button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Create</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </motion.button>

            {/* Create dropdown menu */}
            {showCreateMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-30">
                <div className="py-1">
                  <Link
                    to="/chatbots/new"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    New Chatbot
                  </Link>
                  <Link
                    to="/bot-knowledge"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    Add Knowledge
                  </Link>
                  <Link
                    to="/integrations"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowCreateMenu(false)}
                  >
                    New Integration
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
            title="Toggle dark/light mode"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>

          {/* Avatar & Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-inner flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </motion.button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-30">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {user?.email}
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/billing"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Billing
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="mr-2 h-4 w-4 inline" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

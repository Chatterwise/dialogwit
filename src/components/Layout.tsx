import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Puzzle,
  Palette,
  Zap,
  Settings,
  X,
  BarChart3,
  Code,
  Shield,
  TestTube,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { Header } from "./ui/Header";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./ui/Logo";
import { useTranslation } from "../hooks/useTranslation";

// Navigation config (labels are translated at render time)
const mainNavigation = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "chatbots", href: "/chatbots", icon: Bot },
  // { key: "botKnowledge", href: "/bot-knowledge", icon: BookOpen },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "templates", href: "/templates", icon: Palette },
  { key: "integrations", href: "/integrations", icon: Puzzle },
  { key: "wizard", href: "/wizard", icon: Zap },
  { key: "billing", href: "/billing", icon: CreditCard },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

const devNavigation = [
  { key: "api", href: "/api", icon: Code },
  { key: "security", href: "/security", icon: Shield },
  { key: "testing", href: "/testing", icon: TestTube },
] as const;

// Default English labels for i18n fallbacks
const MAIN_NAV_LABELS: Record<(typeof mainNavigation)[number]["key"], string> =
  {
    dashboard: "Dashboard",
    chatbots: "Chatbots",
    // botKnowledge: "Bot Knowledge",
    analytics: "Analytics",
    templates: "Templates",
    integrations: "Integrations",
    wizard: "Setup Wizard",
    billing: "Billing",
    settings: "Settings",
  };

const DEV_NAV_LABELS: Record<(typeof devNavigation)[number]["key"], string> = {
  api: "API",
  security: "Security",
  testing: "Testing Tools",
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { lang } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  // locale-aware path helper
  const withLang = (to: string) => {
    const cleaned = to.startsWith("/") ? to : `/${to}`;
    const current = lang ?? "en";
    // If already prefixed with current lang, return as-is
    if (cleaned === `/${current}` || cleaned.startsWith(`/${current}/`))
      return cleaned;
    return `/${current}${cleaned}`;
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isDevActive = devNavigation.some((item) =>
    location.pathname.startsWith(withLang(item.href))
  );

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: "auto" as const },
    closed: { opacity: 0, pointerEvents: "none" as const },
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 font-sans dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-800/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("layout.mobile.overlay", "Close menu overlay")}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("layout.mobile.sidebar", "Navigation")}
          >
            <div className="h-full flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl rounded-r-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <Bot className="h-8 w-8 text-primary-500 dark:text-primary-400" />
                  <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight font-display">
                    ChatterWise
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label={t("layout.actions.closeSidebar", "Close menu")}
                  title={t("layout.actions.closeSidebar", "Close menu")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={t("layout.search.placeholder", "Search...")}
                    aria-label={t("layout.search.placeholder", "Search...")}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3">
                <nav className="space-y-1">
                  {mainNavigation.map((item) => {
                    const Icon = item.icon;
                    const to = withLang(item.href);
                    const isActive = location.pathname.startsWith(to);
                    const label = t(
                      `layout.nav.${item.key}`,
                      MAIN_NAV_LABELS[item.key]
                    );
                    return (
                      <Link
                        key={item.key}
                        to={to}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                            : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                          } transition-colors`}
                        />
                        {label}
                      </Link>
                    );
                  })}

                  {/* Developer Section */}
                  <div>
                    <button
                      className={`group flex items-center w-full px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 mt-2 ${
                        isDevActive
                          ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                          : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                      }`}
                      onClick={() => setDevOpen(!devOpen)}
                      aria-expanded={devOpen}
                      aria-controls="dev-subnav-mobile"
                    >
                      {devOpen ? (
                        <ChevronDown className="mr-3 h-5 w-5" />
                      ) : (
                        <ChevronRight className="mr-3 h-5 w-5" />
                      )}
                      {t("layout.nav.developer", "Developer")}
                    </button>
                    <AnimatePresence>
                      {devOpen && (
                        <motion.div
                          id="dev-subnav-mobile"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {devNavigation.map((item) => {
                            const Icon = item.icon;
                            const to = withLang(item.href);
                            const isActive = location.pathname.startsWith(to);
                            const label = t(
                              `layout.nav.dev.${item.key}`,
                              DEV_NAV_LABELS[item.key]
                            );
                            return (
                              <Link
                                key={item.key}
                                to={to}
                                className={`ml-8 group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                              >
                                <Icon className="mr-3 h-5 w-5" />
                                {label}
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>
              </div>

              {/* Mobile quick actions */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={withLang("/chatbots/new")}
                  className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("layout.actions.newChatbot", "New Chatbot")}
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl rounded-r-2xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-8">
                <Logo />
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {mainNavigation.map((item) => {
                  const Icon = item.icon;
                  const to = withLang(item.href);
                  const isActive = location.pathname.startsWith(to);
                  const label = t(
                    `layout.nav.${item.key}`,
                    MAIN_NAV_LABELS[item.key]
                  );
                  return (
                    <motion.div
                      key={item.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={to}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                            : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                          } transition-colors`}
                        />
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Developer Section */}
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center w-full px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 mt-2 ${
                      isDevActive
                        ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                    }`}
                    onClick={() => setDevOpen(!devOpen)}
                    aria-expanded={devOpen}
                    aria-controls="dev-subnav-desktop"
                  >
                    {devOpen ? (
                      <ChevronDown className="mr-3 h-5 w-5" />
                    ) : (
                      <ChevronRight className="mr-3 h-5 w-5" />
                    )}
                    {t("layout.nav.developer", "Developer")}
                  </motion.button>
                  <AnimatePresence>
                    {devOpen && (
                      <motion.div
                        id="dev-subnav-desktop"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {devNavigation.map((item) => {
                          const Icon = item.icon;
                          const to = withLang(item.href);
                          const isActive = location.pathname.startsWith(to);
                          const label = t(
                            `layout.nav.dev.${item.key}`,
                            DEV_NAV_LABELS[item.key]
                          );
                          return (
                            <motion.div
                              key={item.key}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                to={to}
                                className={`ml-8 group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                                }`}
                                aria-current={isActive ? "page" : undefined}
                              >
                                <Icon className="mr-3 h-5 w-5" />
                                {label}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>
            </div>

            {/* Quick action button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={withLang("/chatbots/new")}
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {t("layout.actions.newChatbot", "New Chatbot")}
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-white via-primary-50/30 to-accent-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

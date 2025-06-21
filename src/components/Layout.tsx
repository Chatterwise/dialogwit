import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
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

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chatbots", href: "/chatbots", icon: Bot },
  { name: "Bot Knowledge", href: "/bot-knowledge", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: Palette },
  { name: "Integrations", href: "/integrations", icon: Puzzle },
  { name: "Setup Wizard", href: "/wizard", icon: Zap },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

const devNavigation = [
  { name: "API", href: "/api", icon: Code },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Testing Tools", href: "/testing", icon: TestTube },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  // const { theme } = useTheme();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isDevActive = devNavigation.some((item) =>
    location.pathname.startsWith(item.href)
  );

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: "auto" as "auto" },
    closed: { opacity: 0, pointerEvents: "none" as "none" },
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
                    placeholder="Search..."
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3">
                <nav className="space-y-1">
                  {mainNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                            : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                          } transition-colors`}
                        />
                        {item.name}
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
                    >
                      {devOpen ? (
                        <ChevronDown className="mr-3 h-5 w-5" />
                      ) : (
                        <ChevronRight className="mr-3 h-5 w-5" />
                      )}
                      Developer
                    </button>
                    <AnimatePresence>
                      {devOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {devNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                className={`ml-8 group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                                }`}
                              >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.name}
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
                  to="/chatbots/new"
                  className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chatbot
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
                {/* Place your logo here */}
                <img
                  src="/logo.svg"
                  alt="ChatterWise"
                  className="h-9 w-9 drop-shadow"
                />{" "}
                <span className="ml-2 text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight font-display">
                  ChatterWise
                </span>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                {mainNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                            : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            isActive
                              ? "text-primary-600 dark:text-primary-400"
                              : "text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                          } transition-colors`}
                        />
                        {item.name}
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
                  >
                    {devOpen ? (
                      <ChevronDown className="mr-3 h-5 w-5" />
                    ) : (
                      <ChevronRight className="mr-3 h-5 w-5" />
                    )}
                    Developer
                  </motion.button>
                  <AnimatePresence>
                    {devOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {devNavigation.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;
                          return (
                            <motion.div
                              key={item.name}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                to={item.href}
                                className={`ml-8 group flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-all duration-200 ${
                                  isActive
                                    ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                                }`}
                              >
                                <Icon className="mr-3 h-5 w-5" />
                                {item.name}
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
                  to="/chatbots/new"
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-medium">New Chatbot</span>
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

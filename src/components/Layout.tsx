import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Bot, // <-- Use your SVG logo here if possible
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
} from "lucide-react";
import { TrialNotifications } from "./TrialNotifications";
import { Header } from "./ui/Header";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  const isDevActive = devNavigation.some((item) =>
    location.pathname.startsWith(item.href)
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 font-sans dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          sidebarOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Sidebar */}
        <aside
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-2xl border-r border-gray-200 dark:border-gray-800 rounded-r-2xl transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-primary-500" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center px-4">
              {/* Place your logo here */}
              <img
                src="/logo.svg"
                alt="ChatterWise"
                className="h-8 w-8 drop-shadow"
              />
              {/* Or use the Bot icon as placeholder */}
              {/* <Bot className="h-8 w-8 text-primary-500 drop-shadow" /> */}
              <span className="ml-2 text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-display">
                ChatterWise
              </span>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-4 h-6 w-6 ${
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
              <button
                className={`group flex items-center w-full px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 mt-2 ${
                  isDevActive
                    ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                }`}
                onClick={() => setDevOpen((open) => !open)}
              >
                <ChevronDown
                  className={`mr-4 h-5 w-5 transition-transform ${
                    devOpen ? "rotate-0" : "-rotate-90"
                  }`}
                />
                Developer
              </button>
              {devOpen &&
                devNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`ml-8 group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                          : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-4 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
            </nav>
          </div>
        </aside>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl rounded-r-2xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-8">
                {/* Place your logo here */}
                <img
                  src="/logo.svg"
                  alt="ChatterWise"
                  className="h-9 w-9 drop-shadow"
                />
                {/* Or use the Bot icon as placeholder */}
                {/* <Bot className="h-9 w-9 text-primary-500 drop-shadow" /> */}
                <span className="ml-2 text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-display">
                  ChatterWise
                </span>
              </div>
              <nav className="flex-1 px-2 space-y-2">
                {mainNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                          : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-6 w-6 ${
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
                    className={`group flex items-center w-full px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 mt-2 ${
                      isDevActive
                        ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                    }`}
                    onClick={() => setDevOpen((open) => !open)}
                  >
                    {devOpen ? (
                      <ChevronDown className="mr-3 h-5 w-5" />
                    ) : (
                      <ChevronRight className="mr-3 h-5 w-5" />
                    )}
                    Developer
                  </button>
                  {devOpen &&
                    devNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`ml-8 group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 shadow dark:from-gray-800 dark:to-gray-900 dark:text-primary-400"
                              : "text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-400"
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-white via-primary-50 to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <TrialNotifications />
              {children}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

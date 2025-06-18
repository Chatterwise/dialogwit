import { useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Puzzle,
  Palette,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Code,
  Shield,
  TestTube,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { TrialNotifications } from "./TrialNotifications";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chatbots", href: "/chatbots", icon: Bot },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: Palette },
  { name: "Integrations", href: "/integrations", icon: Puzzle },
  { name: "API", href: "/api", icon: Code },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Testing", href: "/testing", icon: TestTube },
  { name: "Setup Wizard", href: "/wizard", icon: Zap },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Even if signOut fails, we still want to redirect to auth page
      console.error("Sign out error:", error);
    } finally {
      // Always navigate to auth page regardless of signOut success/failure
      navigate("/auth");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 font-sans">
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
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white/80 backdrop-blur-lg shadow-2xl border-r border-gray-200 rounded-r-2xl transition-transform duration-300 ${
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
              <Bot className="h-8 w-8 text-primary-500 drop-shadow" />
              <span className="ml-2 text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                ChatterWise
              </span>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 shadow-sm"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-4 h-6 w-6 ${
                        isActive
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-primary-500"
                      } transition-colors`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-100 p-4 bg-white/60 backdrop-blur-lg rounded-b-2xl">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center shadow-inner">
                <span className="text-base font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.email}
                </p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-primary-600 flex items-center mt-1 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-100 bg-white/90 backdrop-blur-lg shadow-xl rounded-r-2xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-8">
                <Bot className="h-9 w-9 text-primary-500 drop-shadow" />
                <span className="ml-2 text-2xl font-extrabold text-gray-900 tracking-tight font-display">
                  ChatterWise
                </span>
              </div>
              <nav className="flex-1 px-2 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-2 text-base font-semibold rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 shadow"
                          : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-6 w-6 ${
                          isActive
                            ? "text-primary-600"
                            : "text-gray-400 group-hover:text-primary-500"
                        } transition-colors`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-100 p-4 bg-white/70 backdrop-blur-lg rounded-b-2xl">
              <div className="flex items-center w-full">
                <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center shadow-inner">
                  <span className="text-base font-bold text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.email}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-primary-600 flex items-center mt-1 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between bg-white/80 px-4 py-2 border-b border-gray-100 shadow-sm backdrop-blur-lg">
            <button
              type="button"
              className="text-gray-500 hover:text-primary-600 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Bot className="h-7 w-7 text-primary-500 drop-shadow" />
              <span className="ml-2 text-lg font-extrabold text-gray-900 font-display tracking-tight">
                ChatterWise
              </span>
            </div>
            <div className="w-6" />
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gradient-to-br from-white via-primary-50 to-accent-50">
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

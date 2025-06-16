import {
  Bot,
  Plus,
  MessageCircle,
  BookOpen,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { AnalyticsChart } from "./AnalyticsChart";

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || "");

  const activeBots = chatbots.filter((bot) => bot.status === "ready").length;
  const processingBots = chatbots.filter(
    (bot) => bot.status === "processing"
  ).length;

  // Mock analytics data for demo
  const mockChartData = [
    { date: "Mon", messages: 12 },
    { date: "Tue", messages: 19 },
    { date: "Wed", messages: 8 },
    { date: "Thu", messages: 25 },
    { date: "Fri", messages: 22 },
    { date: "Sat", messages: 15 },
    { date: "Sun", messages: 18 },
  ];

  const stats = [
    {
      name: "Total Chatbots",
      value: chatbots.length,
      icon: Bot,
      color: "text-primary-600 bg-primary-100",
      change: "+2 this week",
    },
    {
      name: "Active Chatbots",
      value: activeBots,
      icon: Zap,
      color: "text-green-600 bg-green-100",
      change: `${processingBots} processing`,
    },
    {
      name: "Total Messages",
      value: "2.4k",
      icon: MessageCircle,
      color: "text-purple-600 bg-purple-100",
      change: "+12% from last week",
    },
    {
      name: "Knowledge Base Items",
      value: "47",
      icon: BookOpen,
      color: "text-accent-600 bg-accent-100",
      change: "+5 this week",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back! Here’s what’s happening with your chatbots.
          </p>
        </div>
        <Link
          to="/chatbots/new"
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chatbot
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between"
            >
              <div className="flex items-center">
                <div className={`rounded-xl p-3 ${stat.color} shadow-inner`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">{stat.change}</div>
            </div>
          );
        })}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        <AnalyticsChart data={mockChartData} title="Messages This Week" />

        {/* Recent Activity */}
        <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Customer Support Bot created
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  25 new messages received
                </p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-accent-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Knowledge base updated
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Weekly report generated
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Chatbots */}
      <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Recent Chatbots</h3>
          <Link
            to="/chatbots"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No chatbots yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first chatbot.
              </p>
              <div className="mt-6">
                <Link
                  to="/chatbots/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-primary-500 hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chatbot
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatbots.slice(0, 3).map((chatbot) => (
                <div
                  key={chatbot.id}
                  className="flex items-center justify-between p-4 bg-primary-50 rounded-xl"
                >
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-primary-600" />
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {chatbot.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {chatbot.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        chatbot.status === "ready"
                          ? "bg-green-100 text-green-800"
                          : chatbot.status === "processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {chatbot.status}
                    </span>
                    <Link
                      to={`/chatbots/${chatbot.id}`}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/chatbots/new"
            className="p-4 border border-gray-100 rounded-xl hover:bg-primary-50 transition-colors duration-200 group"
          >
            <div className="flex items-center">
              <Plus className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
              <span className="ml-3 text-sm font-medium text-gray-900">
                Create New Chatbot
              </span>
            </div>
          </Link>
          <Link
            to="/knowledge-base"
            className="p-4 border border-gray-100 rounded-xl hover:bg-primary-50 transition-colors duration-200 group"
          >
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-accent-600 group-hover:text-accent-700" />
              <span className="ml-3 text-sm font-medium text-gray-900">
                Manage Knowledge Base
              </span>
            </div>
          </Link>
          <Link
            to="/integrations"
            className="p-4 border border-gray-100 rounded-xl hover:bg-primary-50 transition-colors duration-200 group"
          >
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
              <span className="ml-3 text-sm font-medium text-gray-900">
                View Integrations
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

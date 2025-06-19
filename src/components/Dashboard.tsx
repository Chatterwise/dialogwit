import { useState, useEffect } from "react";
import {
  Plus,
  MessageCircle,
  BookOpen,
  Zap,
  CreditCard,
  Loader,
  BarChart3,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { useSubscriptionStatus } from "../hooks/useStripe";
import { useChatAnalytics } from "../hooks/useChatAnalytics";
import { AnalyticsChart } from "./AnalyticsChart";
import { SubscriptionStatus } from "./SubscriptionStatus";
import { supabase } from "../lib/supabase";
import { useUserSubscription } from "../hooks/useBilling";
import TokenUsageWidget from "./TokenUsageWidget";
import { useUsageLimitCheck } from "../hooks/useUsageLimitCheck";

type RecentActivity = {
  id: string;
  type: string;
  content: string;
  chatbot: string;
  timestamp: string;
};

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || "");
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { checkLimit } = useUsageLimitCheck();
  const [canCreateChatbot, setCanCreateChatbot] = useState(true);
  const [checkingLimits, setCheckingLimits] = useState(false);
  const { data: subscriptionData } = useUserSubscription(user?.id || "");
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Check if user can create more chatbots
  useEffect(() => {
    const checkChatbotLimit = async () => {
      if (!user || authLoading) return;

      try {
        setCheckingLimits(true);
        const allowed = await checkLimit("chatbots");
        setCanCreateChatbot(allowed);
      } catch (error) {
        console.error("Failed to check chatbot limit:", error);
        // Allow by default on error to prevent blocking
        setCanCreateChatbot(true);
      } finally {
        setCheckingLimits(false);
      }
    };

    if (!authLoading) {
      checkChatbotLimit();
    }
  }, [user, authLoading, checkLimit]);

  const activeBots = chatbots.filter((bot) => bot.status === "ready").length;
  const processingBots = chatbots.filter(
    (bot) => bot.status === "processing"
  ).length;

  // Get analytics data for all chatbots
  const { data: analyticsData, isLoading: analyticsLoading } =
    useChatAnalytics("all");

  // Get Bot Knowledge count
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [loadingKnowledgeBase, setLoadingKnowledgeBase] = useState(false);

  useEffect(() => {
    const fetchKnowledgeBaseCount = async () => {
      if (!user || authLoading) return;

      try {
        setLoadingKnowledgeBase(true);

        // Only query if we have chatbot IDs
        if (chatbots.length === 0) {
          setKnowledgeBaseCount(0);
          return;
        }

        const chatbotIds = chatbots.map((bot) => bot.id);
        const query = chatbotIds.map((id) => `chatbot_id.eq.${id}`).join(",");

        const { count, error } = await supabase
          .from("knowledge_base")
          .select("id", { count: "exact", head: true })
          .or(query);

        if (error) {
          console.error("Failed to fetch Bot Knowledge count:", error);
          setKnowledgeBaseCount(0);
        } else {
          setKnowledgeBaseCount(count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch Bot Knowledge count:", error);
        setKnowledgeBaseCount(0);
      } finally {
        setLoadingKnowledgeBase(false);
      }
    };

    if (!authLoading && chatbots.length > 0) {
      fetchKnowledgeBaseCount();
    } else if (!authLoading) {
      setKnowledgeBaseCount(0);
    }
  }, [user, authLoading, chatbots]);

  // Fetch recent activity
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user || authLoading) return;

      try {
        setLoadingActivity(true);

        // Get recent chat messages
        const { data: messages, error } = await supabase
          .from("chat_messages")
          .select(
            `
            id, 
            message, 
            created_at,
            chatbots(name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Failed to fetch recent activity:", error);
          return;
        }

        const formattedActivity = messages.map((msg) => ({
          id: msg.id,
          type: "message",
          content:
            msg.message.substring(0, 50) +
            (msg.message.length > 50 ? "..." : ""),
          chatbot:
            Array.isArray(msg.chatbots) && msg.chatbots.length > 0
              ? msg.chatbots[0].name
              : "Unknown",
          timestamp: new Date(msg.created_at).toLocaleString(),
        }));

        setRecentActivity(formattedActivity);
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setLoadingActivity(false);
      }
    };

    if (!authLoading) {
      fetchRecentActivity();
    }
  }, [user, authLoading]);

  // Get token usage from subscription data
  const getTokenUsage = () => {
    if (!subscriptionData) return 0;

    const tokenUsage = subscriptionData.usage.find(
      (item) => item.metric_name === "tokens_per_month"
    );

    return tokenUsage?.metric_value || 0;
  };

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
      name: "Total Tokens Used",
      value: getTokenUsage().toLocaleString(),
      icon: MessageCircle,
      color: "text-purple-600 bg-purple-100",
      change: `${analyticsData?.todayMessages || 0} today`,
    },
    {
      name: "Bot Knowledge Items",
      value: knowledgeBaseCount,
      icon: BookOpen,
      color: "text-accent-600 bg-accent-100",
      change: "Across all chatbots",
    },
  ];

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
        <div className="flex items-center space-x-4">
          {/* Use your SVG logo here if available, otherwise use Bot icon */}
          {/* <img src={logo} alt="ChatterWise" className="h-8 w-8" /> */}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-display tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back! Here's what's happening with your chatbots.
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {!hasActiveSubscription && (
            <Link
              to="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade Now
            </Link>
          )}
          <Link
            to="/chatbots/new"
            className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors duration-200 ${
              !canCreateChatbot
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            onClick={(e) => {
              if (!canCreateChatbot) {
                e.preventDefault();
                alert(
                  "You've reached your chatbot limit. Please upgrade your plan to create more chatbots."
                );
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chatbot
          </Link>
        </div>
      </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          return (
            <div
              key={stat.name}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between"
            >
              <div className="flex items-center">
                <div className={`rounded-xl p-3 ${stat.color} shadow-inner`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    {loadingKnowledgeBase &&
                    stat.name === "Bot Knowledge Items" ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="h-8 w-8 text-primary-600 animate-spin" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Loading...
                        </p>
                      </div>
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Token esage widget */}
      <TokenUsageWidget className="col-span-1" showDetails={true} />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Chart */}
        {analyticsLoading ? (
          // <AnalyticsChart data={[]} title="Messages This Week" loading={true} />
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-center py-8">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          </div>
        ) : analyticsData ? (
          <AnalyticsChart
            data={analyticsData.chartData}
            title="Messages This Week"
          />
        ) : (
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No analytics data available
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {isLoading || loadingActivity ? (
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 text-primary-600 animate-spin" />
                </div>
              </div>
            ) : (
              <>
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          Message in {activity.chatbot}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activity.content}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Chatbots */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Recent Chatbots
          </h3>
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
                  className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-primary-500 hover:bg-primary-600 ${
                    !canCreateChatbot
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : ""
                  }`}
                  onClick={(e) => {
                    if (!canCreateChatbot) {
                      e.preventDefault();
                      alert(
                        "You've reached your chatbot limit. Please upgrade your plan to create more chatbots."
                      );
                    }
                  }}
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
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Quick Actions
          </h3>
        </div>
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/chatbots/new"
            className={`p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors duration-200 group ${
              !canCreateChatbot
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : ""
            }`}
            onClick={(e) => {
              if (!canCreateChatbot) {
                e.preventDefault();
                alert(
                  "You've reached your chatbot limit. Please upgrade your plan to create more chatbots."
                );
              }
            }}
          >
            <div className="flex items-center">
              <Plus className="h-6 w-6 text-primary-600 group-hover:text-primary-700" />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                Create New Chatbot
              </span>
            </div>
          </Link>
          <Link
            to="/bot-knowledge"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors duration-200 group"
          >
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-accent-600 group-hover:text-accent-700" />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                Manage Bot Knowledge
              </span>
            </div>
          </Link>
          <Link
            to="/integrations"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 group"
          >
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                View Integrations
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

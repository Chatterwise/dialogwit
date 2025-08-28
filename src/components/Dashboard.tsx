// Dashboard.tsx
import {
  Bot,
  BookOpen,
  Zap,
  MessageCircle,
  Loader,
  Plus,
  ArrowRight,
  Users,
  Smile,
  Sparkles,
  Puzzle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { useChatAnalytics } from "../hooks/useChatMessages";
import { supabase } from "../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { AnalyticsChart } from "./AnalyticsChart";
import { useBilling } from "../hooks/useBilling";
import { EnterpriseChat } from "./ChatTemplates/EnterpriseChat";
import { useTheme } from "../hooks/useTheme";
import { FloatingChatButton } from "./ChatTemplates/FloatingChatButton";
import { useTranslation } from "../hooks/useTranslation";

// ---- Locale-aware link helper --------------------------------------------
// Ensures all internal links keep the "/:locale" segment (e.g., "/en")
// Example: localePath('/chatbots') => "/en/chatbots" when on "/en/*"
function useLocalePath() {
  const { pathname } = useLocation();
  // Grab the first segment after "/" if it looks like a locale (en, fr, es-ES, etc.)
  const match = pathname.match(/^\/([A-Za-z-]{2,5})(?=\/|$)/);
  const locale = match?.[1] ?? "en";

  return (to: string) => {
    const normalized = to.startsWith("/") ? to : `/${to}`;
    // Avoid double-prefixing if already locale-scoped
    if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
      return normalized;
    }
    return `/${locale}${normalized}`;
  };
}

// Animated card component
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedCard = ({ children, delay = 0 }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-300"
  >
    {children}
  </motion.div>
);

// Stat card component
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  color: string;
  note: string;
  delay?: number;
}

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
  note,
  delay = 0,
}: StatCardProps) => (
  <AnimatedCard delay={delay}>
    <div className="p-6">
      <div className="flex items-center">
        <div className={`rounded-xl p-3 ${color} shadow-inner`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{note}</p>
    </div>
  </AnimatedCard>
);

// Activity item component
interface ActivityItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  timestamp: string;
  delay?: number;
}

const ActivityItem = ({
  icon: Icon,
  title,
  description,
  timestamp,
  delay = 0,
}: ActivityItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="flex items-start space-x-3"
  >
    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
      <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {description}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{timestamp}</p>
    </div>
  </motion.div>
);

// Quick action card component
const QuickActionCard = ({
  icon: Icon,
  title,
  description,
  to,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  to: string;
  delay?: number;
}) => {
  const localePath = useLocalePath();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        to={localePath(to)}
        className="block p-5 bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center mb-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
            <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </Link>
    </motion.div>
  );
};

// Feature highlight component
const FeatureHighlight = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="flex items-start space-x-4 p-4 bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-100 dark:border-gray-800 shadow-md"
  >
    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
      <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
        {title}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {description}
      </p>
    </div>
  </motion.div>
);

export function Dashboard() {
  const { t } = useTranslation();
  const localePath = useLocalePath();

  const { user, loading: authLoading } = useAuth();
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || "");
  const { data: analyticsData, isLoading: analyticsLoading } =
    useChatAnalytics("all");
  const { usage } = useBilling();
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<
    {
      id: string;
      type: string;
      content: string;
      chatbot: string;
      timestamp: string;
    }[]
  >([]);
  const { theme } = useTheme();

  // chatbot test
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!user || authLoading || chatbots.length === 0) return;
    (async () => {
      const chatbotIds = chatbots.map((bot) => bot.id);
      const query = chatbotIds.map((id) => `chatbot_id.eq.${id}`).join(",");
      const { count } = await supabase
        .from("knowledge_base")
        .select("id", { count: "exact", head: true })
        .or(query);
      setKnowledgeBaseCount(count || 0);
    })();
  }, [user, authLoading, chatbots]);

  useEffect(() => {
    if (!user || authLoading) return;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, message, created_at, chatbots(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      const formatted =
        data?.map((msg) => ({
          id: msg.id,
          type: "message",
          content:
            msg.message.slice(0, 50) + (msg.message.length > 50 ? "..." : ""),
          chatbot: msg.chatbots?.name || t("dashboard.unknown_bot", "Unknown"),
          timestamp: new Date(msg.created_at).toLocaleString(),
        })) || [];
      setRecentActivity(formatted);
    })();
  }, [user, authLoading, t]);

  const stats = [
    {
      title: t("dashboard.stats.total_chatbots", "Total Chatbots"),
      value: chatbots.length,
      icon: Bot,
      color:
        "text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30",
      note: t("dashboard.stats.note_total_chatbots", "+2 this week"),
    },
    {
      title: t("dashboard.stats.active_chatbots", "Active Chatbots"),
      value: chatbots.filter((b) => b.status === "ready").length,
      icon: Zap,
      color:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
      note: t(
        "dashboard.stats.note_active_chatbots_processing",
        "{{count}} processing",
        { count: chatbots.filter((b) => b.status === "processing").length }
      ),
    },
    {
      title: t("dashboard.stats.total_tokens_used", "Total Tokens Used"),
      value: usage?.tokens_used?.toLocaleString() || 0,
      icon: MessageCircle,
      color:
        "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
      note: t("dashboard.stats.note_tokens_today", "{{count}} today", {
        count: analyticsData?.todayMessages || 0,
      }),
    },
    {
      title: t("dashboard.stats.knowledge_items", "Knowledge Items"),
      value: knowledgeBaseCount,
      icon: BookOpen,
      color:
        "text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/30",
      note: t("dashboard.stats.note_knowledge_across", "Across all chatbots"),
    },
  ];

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-800 dark:to-primary-700 rounded-2xl shadow-xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t("dashboard.welcome", "Welcome back, {{name}}!", {
                name:
                  user?.user_metadata?.full_name || t("dashboard.user", "User"),
              })}
            </h1>
            <p className="text-primary-100">
              {t(
                "dashboard.hero_subtitle",
                "Build and deploy AI chatbots in minutes, not months."
              )}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 md:mt-0"
          >
            <Link
              to={localePath("/chatbots/new")}
              className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.cta_create", "Create New Chatbot")}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            note={stat.note}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={0.3}>
          {analyticsLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <AnalyticsChart
              data={analyticsData?.chartData || []}
              title={t(
                "dashboard.chart.messages_this_week",
                "Messages This Week"
              )}
            />
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("dashboard.recent_activity.title", "Recent Activity")}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  icon={MessageCircle}
                  title={t(
                    "dashboard.recent_activity.item_title",
                    "Message in {{name}}",
                    {
                      name: activity.chatbot,
                    }
                  )}
                  description={activity.content}
                  timestamp={activity.timestamp}
                  delay={0.1 * index}
                />
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 dark:text-gray-400 text-center"
              >
                {t("dashboard.recent_activity.empty", "No recent activity")}
              </motion.p>
            )}
          </div>
        </AnimatedCard>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.quick_actions.title", "Quick Actions")}
          </h2>
          <Link
            to={localePath("/wizard")}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
          >
            {t("dashboard.quick_actions.wizard", "Setup Wizard")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Bot}
            title={t(
              "dashboard.quick_actions.create_bot.title",
              "Create Chatbot"
            )}
            description={t(
              "dashboard.quick_actions.create_bot.desc",
              "Build a new AI chatbot in minutes"
            )}
            to="/chatbots/new"
            delay={0.6}
          />
          <QuickActionCard
            icon={BookOpen}
            title={t(
              "dashboard.quick_actions.add_knowledge.title",
              "Add Knowledge"
            )}
            description={t(
              "dashboard.quick_actions.add_knowledge.desc",
              "Upload documents or add text content"
            )}
            to="/bot-knowledge"
            delay={0.7}
          />
          <QuickActionCard
            icon={Puzzle}
            title={t(
              "dashboard.quick_actions.integrations.title",
              "Integrations"
            )}
            description={t(
              "dashboard.quick_actions.integrations.desc",
              "Connect with your favorite platforms"
            )}
            to="/integrations"
            delay={0.8}
          />
        </div>
      </div>

      {/* Recent Chatbots */}
      <AnimatedCard delay={0.9}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("dashboard.recent_chatbots.title", "Recent Chatbots")}
          </h3>
          <Link
            to={localePath("/chatbots")}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
          >
            {t("dashboard.recent_chatbots.view_all", "View all")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t("dashboard.recent_chatbots.empty_title", "No chatbots yet")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t(
                  "dashboard.recent_chatbots.empty_desc",
                  "Create your first AI-powered chatbot to get started"
                )}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={localePath("/chatbots/new")}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t(
                    "dashboard.recent_chatbots.create_first",
                    "Create First Chatbot"
                  )}
                </Link>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatbots.slice(0, 3).map((chatbot, index) => (
                <motion.div
                  key={chatbot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-primary-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {chatbot.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {chatbot.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chatbot.status === "ready"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : chatbot.status === "processing"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {t(`common.status.${chatbot.status}`, chatbot.status)}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Link
                          to={localePath(`/chatbots/${chatbot.id}`)}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                          {t("dashboard.recent_chatbots.view", "View")}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Features Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-primary-100 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t("dashboard.features.title", "ChatterWise Features")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureHighlight
            icon={Zap}
            title={t("dashboard.features.fast_deploy.title", "Fast Deployment")}
            description={t(
              "dashboard.features.fast_deploy.desc",
              "Create and deploy chatbots in minutes, not months"
            )}
            delay={1.1}
          />
          <FeatureHighlight
            icon={Sparkles}
            title={t("dashboard.features.ai_powered.title", "AI-Powered")}
            description={t(
              "dashboard.features.ai_powered.desc",
              "Leverages advanced GPT models for natural conversations"
            )}
            delay={1.2}
          />
          <FeatureHighlight
            icon={Users}
            title={t("dashboard.features.multichannel.title", "Multi-Channel")}
            description={t(
              "dashboard.features.multichannel.desc",
              "Deploy to website, Slack, Discord and more"
            )}
            delay={1.3}
          />
          <FeatureHighlight
            icon={Smile}
            title={t("dashboard.features.user_friendly.title", "User-Friendly")}
            description={t(
              "dashboard.features.user_friendly.desc",
              "No coding required - easy to use interface"
            )}
            delay={1.4}
          />
        </div>
        <AnimatePresence>
          {!isChatOpen && (
            <FloatingChatButton
              key="chat-btn"
              onClick={() => setIsChatOpen(true)}
            />
          )}
          {isChatOpen && (
            <motion.div
              key="chat-modal"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 18 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed bottom-6 right-6 z-50"
              style={{ minWidth: 350, maxWidth: 400 }}
            >
              <EnterpriseChat
                botId="6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                apiUrl="https://bpzfivbuhgjpkngcjpzc.supabase.co/functions/v1"
                apiKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwemZpdmJ1aGdqcGtuZ2NqcHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTI3MzIsImV4cCI6MjA2NTY2ODczMn0.fBkQQJiLLfSwW3yH3rJ1HOLj-fs27tEfBJtOBpWtdx4"
                isOpen={isChatOpen}
                onToggle={setIsChatOpen}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

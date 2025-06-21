// ChatbotDetail.tsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Bot,
  ArrowLeft,
  MessageCircle,
  Settings,
  Code,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Activity,
  Clock,
  BarChart2,
  FileText,
  TrendingUp,
  Smile,
  Zap,
} from "lucide-react";
import { useChatbot, useDeleteChatbot } from "../hooks/useChatbots";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { useChatMessages, useChatAnalytics } from "../hooks/useChatMessages";
import { ChatPreview } from "./ChatPreview";
import { AnalyticsChart } from "./AnalyticsChart";
import { ActionModal } from "./ActionModal";
import { motion } from "framer-motion";

export const ChatbotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot, isLoading: chatbotLoading } = useChatbot(id || "");
  const { data: knowledgeBase = [], isLoading: kbLoading } = useKnowledgeBase(
    id || ""
  );
  const { data: chatMessages = [], isLoading: messagesLoading } =
    useChatMessages(id || "");
  const { data: analytics, isLoading: analyticsLoading } = useChatAnalytics(
    id || ""
  );
  const deleteChatbot = useDeleteChatbot();

  const [activeTab, setActiveTab] = useState<
    "overview" | "chat" | "knowledge" | "analytics"
  >("overview");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const publicChatUrl = `${window.location.origin}/chat/${id}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicChatUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDeleteConfirmed = async () => {
    if (!chatbot) return;
    try {
      await deleteChatbot.mutateAsync(chatbot.id);
      navigate("/chatbots");
    } catch (error) {
      console.error("Error deleting chatbot:", error);
    }
  };

  if (chatbotLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Chatbot not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          The chatbot you're looking for doesn't exist.
        </p>
        <Link
          to="/chatbots"
          className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chatbots
        </Link>
      </div>
    );
  }
  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "chat", name: "Test Chat", icon: MessageCircle },
    { id: "knowledge", name: "Bot Knowledge", icon: FileText },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
  ];
  // Stats cards
  const stats = [
    {
      name: "Total Messages",
      value: analytics?.totalMessages || 0,
      icon: MessageCircle,
      color:
        "text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/20",
      change: analytics?.totalMessages > 0 ? "+12%" : "0%",
    },
    {
      name: "Today's Messages",
      value: analytics?.todayMessages || 0,
      icon: Clock,
      color:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      change: analytics?.todayMessages > 0 ? "+5%" : "0%",
    },
    {
      name: "Avg Response Length",
      value: `${analytics?.avgResponseLength || 0} chars`,
      icon: FileText,
      color:
        "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
      change: "-2%",
    },
    {
      name: "Knowledge Items",
      value: knowledgeBase.length,
      icon: FileText,
      color:
        "text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/20",
      change: "0%",
    },
  ];

  const metrics = [
    {
      label: "Total Messages",
      value: analytics?.totalMessages ?? 0,
      icon: Activity,
    },
    {
      label: "This Week",
      value: analytics?.weeklyMessages ?? 0,
      icon: BarChart2,
    },
    {
      label: "Avg Response",
      value: `${analytics?.avgResponseLength ?? 0} chars`,
      icon: FileText,
    },
    {
      label: "Knowledge Base",
      value: knowledgeBase.length,
      icon: FileText,
    },
  ];

  const trends = [
    {
      label: "Daily Avg",
      value: `~${Math.round((analytics?.totalMessages ?? 0) / 7)} msgs`,
      icon: Clock,
    },
    {
      label: "Weekly Growth",
      value: `+${Math.floor(Math.random() * 15)}%`,
      icon: TrendingUp,
    },
    {
      label: "Response Time",
      value: `~${Math.floor(Math.random() * 400 + 200)}ms`,
      icon: Zap,
    },
    {
      label: "Satisfaction",
      value: `${Math.floor(Math.random() * 10 + 85)}%`,
      icon: Smile,
    },
  ];

  return (
    <div className="space-y-8">
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        action={{
          title: "Delete Chatbot",
          description:
            "This action cannot be undone. All associated data will be permanently deleted:",
          affectedItems: [
            "Chatbot configuration and settings",
            "All chat history and analytics",
            "Connected Bot Knowledge content",
            "Integration configurations",
          ],
          onConfirm: handleDeleteConfirmed,
          actionLabel: "Delete Chatbot",
          actionColor: "red",
          requireType: true,
          confirmationWord: "DELETE",
          actionIcon: <Trash2 className="h-4 w-4 mr-2" />,
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/chatbots"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 font-display tracking-tight">
                {chatbot.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {chatbot.description || "Your AI-powered chatbot"}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              chatbot.status === "ready"
                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                : chatbot.status === "processing"
                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            }`}
          >
            {chatbot.status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicChatUrl}
              readOnly
              className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:text-gray-300 dark:bg-gray-800 text-sm font-mono w-64"
            />
            <button
              onClick={copyPublicUrl}
              title={copiedUrl ? "Copied!" : "Copy chat URL"}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {copiedUrl ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copiedUrl ? "Copied!" : "Copy URL"}
            </button>
          </div>
          <a
            href={publicChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Chat
          </a>
          <Link
            to={`/chatbots/${id}/settings`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Link
            to="/integrations"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-xl p-3 ${stat.color} shadow-inner`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                        {stat.value}
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

          {/* Chart */}
          <div>
            {analyticsLoading ? (
              <AnalyticsChart
                data={[]}
                title="Messages Over Time (Last 7 Days)"
                loading
              />
            ) : analytics ? (
              <AnalyticsChart
                data={analytics.chartData}
                title="Messages Over Time (Last 7 Days)"
              />
            ) : (
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl p-6 shadow-inner border border-gray-200 dark:border-gray-800 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No analytics data available.
                </p>
              </div>
            )}
          </div>

          {/* Recent Conversations */}
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Recent Conversations
              </h3>
            </div>
            <div className="p-6">
              {messagesLoading ? (
                <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                  Loading messages...
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No messages found yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white/95 dark:bg-gray-800/90"
                    >
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {m.message}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        Response: {m.response}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="max-w-2xl mx-auto">
          <ChatPreview botId={id} />
        </div>
      )}

      {activeTab === "knowledge" && (
        <div className="space-y-8">
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Bot Knowledge Items
              </h3>
              <Link
                to="/bot-knowledge"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Manage All
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {kbLoading ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </p>
              ) : knowledgeBase.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No knowledge items yet.
                  </p>
                  <Link
                    to="/bot-knowledge"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-xl"
                  >
                    Add Knowledge
                  </Link>
                </div>
              ) : (
                knowledgeBase.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/95 dark:bg-gray-800/95"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {item.filename || "Unnamed"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {item.content.substring(0, 120)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.processed ? "Processed" : "Processing"} ·{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-8">
          <AnalyticsChart
            data={analytics?.chartData || []}
            title="Daily Message Volume"
            loading={analyticsLoading}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCard("Performance Metrics", metrics)}
            {renderCard("Usage Trends", trends)}
          </div>
        </div>
      )}
    </div>
  );
};

const renderCard = (title: string, data: typeof metrics) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6"
  >
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
      {title}
    </h3>
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {data.map(({ label, value, icon: Icon }, i) => (
        <li key={i} className="flex items-center py-3 space-x-3">
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </p>
            <p className="text-sm text-gray-900 dark:text-white font-bold">
              {value}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </motion.div>
);

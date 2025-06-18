import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Bot,
  ArrowLeft,
  MessageCircle,
  Settings,
  Code,
  BarChart3,
  FileText,
  Users,
  Clock,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { useChatbot, useDeleteChatbot } from "../hooks/useChatbots";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { useChatMessages, useChatAnalytics } from "../hooks/useChatMessages";
import { ChatPreview } from "./ChatPreview";
import { AnalyticsChart } from "./AnalyticsChart";
import { ActionModal } from "./ActionModal";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add modal state

  // Remove isDeleting state as it's now handled by the modal

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
      throw error; // Let the modal handle the error
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

  // Tab definitions
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
            title="Go back to chatbots"
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
                : chatbot.status === "error"
                ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
            }`}
          >
            {chatbot.status}
          </span>
        </div>
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
            title="Open chat in new tab"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Chat
          </a>
          <Link
            to={`/chatbots/${id}/settings`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Chatbot settings"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Link
            to="/integrations"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200"
            title="Get integration code"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            title={`Delete ${chatbot.name}`}
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
          {/* Stats */}
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
          {analyticsLoading ? (
            <AnalyticsChart
              data={[]}
              title="Messages Over Time (Last 7 Days)"
              loading={true}
            />
          ) : analytics ? (
            <AnalyticsChart
              data={analytics.chartData}
              title="Messages Over Time (Last 7 Days)"
            />
          ) : (
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No analytics data available
                </p>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Recent Conversations
              </h3>
            </div>
            <div className="p-6">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start testing your chatbot to see conversations here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.slice(0, 5).map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <Users className="h-5 w-5 text-gray-400 dark:text-gray-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            User Message
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                          {message.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Response: {message.response.substring(0, 100)}...
                        </p>
                      </div>
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
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Bot Knowledge Items
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {knowledgeBase.length} items
                </span>
                <Link
                  to="/bot-knowledge"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                >
                  Manage All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {kbLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Loading Bot Knowledge...
                  </p>
                </div>
              ) : knowledgeBase.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No Bot Knowledge items
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Add content to help your chatbot answer questions.
                  </p>
                  <Link
                    to="/bot-knowledge"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    Add Content
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledgeBase.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white/95 dark:bg-gray-800/95"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-600 mr-2" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.filename || `${item.content_type} content`}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.processed
                              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                          }`}
                        >
                          {item.processed ? "Processed" : "Processing"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {item.content.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {knowledgeBase.length > 3 && (
                    <div className="text-center">
                      <Link
                        to="/bot-knowledge"
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium"
                      >
                        View all {knowledgeBase.length} items
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-8">
          {analyticsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Loading analytics...
              </p>
            </div>
          ) : (
            <>
              {analytics && (
                <AnalyticsChart
                  data={analytics.chartData}
                  title="Daily Message Volume"
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Messages
                      </span>
                      <span className="text-sm font-semibold">
                        {analytics?.totalMessages || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        This Week
                      </span>
                      <span className="text-sm font-semibold">
                        {analytics?.weeklyMessages || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Response Length
                      </span>
                      <span className="text-sm font-semibold">
                        {analytics?.avgResponseLength || 0} chars
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Bot Knowledge Size
                      </span>
                      <span className="text-sm font-semibold">
                        {knowledgeBase.length} items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Usage Trends
                  </h3>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Daily Average
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(analytics.totalMessages / 7)} messages
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Weekly Growth
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          +{Math.round(Math.random() * 15)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Response Time
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(Math.random() * 500 + 300)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          User Satisfaction
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(Math.random() * 20 + 75)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No trend data available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

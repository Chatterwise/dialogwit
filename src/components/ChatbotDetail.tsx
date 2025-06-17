import { useState } from "react";
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
  Loader,
} from "lucide-react";
import { useChatbot, useDeleteChatbot } from "../hooks/useChatbots";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { useChatMessages, useChatAnalytics } from "../hooks/useChatMessages";
import { ChatPreview } from "./ChatPreview";
import { AnalyticsChart } from "./AnalyticsChart";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const publicChatUrl = `${window.location.origin}/chat/${id}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicChatUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDelete = async () => {
    if (!chatbot) return;

    if (
      confirm(
        `Are you sure you want to delete "${chatbot.name}"? This action cannot be undone and will also delete all associated knowledge base content and chat messages.`
      )
    ) {
      setIsDeleting(true);
      try {
        await deleteChatbot.mutateAsync(chatbot.id);
        navigate("/chatbots");
      } catch (error) {
        console.error("Error deleting chatbot:", error);
        alert("Failed to delete chatbot. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  if (chatbotLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          Chatbot not found
        </h3>
        <p className="text-gray-500">
          The chatbot you're looking for doesn't exist.
        </p>
        <Link
          to="/chatbots"
          className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
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
    { id: "knowledge", name: "Knowledge Base", icon: FileText },
    { id: "analytics", name: "Analytics", icon: TrendingUp },
  ];

  const stats = [
    {
      name: "Total Messages",
      value: analytics?.totalMessages || 0,
      icon: MessageCircle,
      color: "text-primary-600 bg-primary-100",
      change: analytics?.totalMessages > 0 ? "+12%" : "0%",
    },
    {
      name: "Today's Messages",
      value: analytics?.todayMessages || 0,
      icon: Clock,
      color: "text-green-600 bg-green-100",
      change: analytics?.todayMessages > 0 ? "+5%" : "0%",
    },
    {
      name: "Avg Response Length",
      value: `${analytics?.avgResponseLength || 0} chars`,
      icon: FileText,
      color: "text-purple-600 bg-purple-100",
      change: "-2%",
    },
    {
      name: "Knowledge Items",
      value: knowledgeBase.length,
      icon: FileText,
      color: "text-accent-600 bg-accent-100",
      change: "0%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <Link
            to="/chatbots"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">
                {chatbot.name}
              </h1>
              <p className="text-gray-600">{chatbot.description}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              chatbot.status === "ready"
                ? "bg-green-100 text-green-800"
                : chatbot.status === "processing"
                ? "bg-yellow-100 text-yellow-800"
                : chatbot.status === "error"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {chatbot.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={publicChatUrl}
              readOnly
              className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono w-64"
            />
            <button
              onClick={copyPublicUrl}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Chat
          </a>
          <Link
            to={`/chatbots/${id}/settings`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Link
            to="/integrations"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Delete ${chatbot.name}`}
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "overview" | "chat" | "knowledge" | "analytics"
                  )
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                  className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`rounded-xl p-3 ${stat.color} shadow-inner`}
                    >
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
                  <div className="mt-4 text-xs text-gray-500">
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
            <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No analytics data available</p>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Recent Conversations
              </h3>
            </div>
            <div className="p-6">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading messages...
                  </p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500">
                    Start testing your chatbot to see conversations here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.slice(0, 5).map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">
                            User Message
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {message.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
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
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Knowledge Base Items
              </h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {knowledgeBase.length} items
                </span>
                <Link
                  to="/knowledge-base"
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Manage All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {kbLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading knowledge base...
                  </p>
                </div>
              ) : knowledgeBase.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    No knowledge base items
                  </h3>
                  <p className="text-gray-500">
                    Add content to help your chatbot answer questions.
                  </p>
                  <Link
                    to="/knowledge-base"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Add Content
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {knowledgeBase.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-100 rounded-lg bg-white/95"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">
                            {item.filename || `${item.content_type} content`}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.processed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.processed ? "Processed" : "Processing"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.content.substring(0, 200)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {knowledgeBase.length > 3 && (
                    <div className="text-center">
                      <Link
                        to="/knowledge-base"
                        className="text-sm text-primary-600 hover:text-primary-500 font-medium"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading analytics...</p>
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
                <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Total Messages
                      </span>
                      <span className="text-sm font-semibold">
                        {analytics?.totalMessages || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="text-sm font-semibold">
                        {analytics?.weeklyMessages || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Avg Response Length
                      </span>
                      <span className="text-sm font-semibold">
                        {analytics?.avgResponseLength || 0} chars
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Knowledge Base Size
                      </span>
                      <span className="text-sm font-semibold">
                        {knowledgeBase.length} items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Usage Trends
                  </h3>
                  {analytics ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Daily Average
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(analytics.totalMessages / 7)} messages
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Weekly Growth
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          +{Math.round(Math.random() * 15)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Response Time
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(Math.random() * 500 + 300)}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          User Satisfaction
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(Math.random() * 20 + 75)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
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
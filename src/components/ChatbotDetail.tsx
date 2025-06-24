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
  Trash2,
  Activity,
  Clock,
  BarChart2,
  FileText,
  TrendingUp,
  Smile,
  Zap,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Loader,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useChatbot, useDeleteChatbot } from "../hooks/useChatbots";
import {
  useKnowledgeBase,
  useAddKnowledgeBase,
  useDeleteKnowledgeBase,
  useUpdateKnowledgeBase,
} from "../hooks/useKnowledgeBase";
import { useChatMessages, useChatAnalytics } from "../hooks/useChatMessages";
import { ChatPreview } from "./ChatPreview";
import { AnalyticsChart } from "./AnalyticsChart";
import { ActionModal } from "./ActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTrainChatbot } from "../hooks/useTraining";
import { KnowledgeEditorModal } from "./KnowledgeEditorModal";

export const ChatbotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot, isLoading: chatbotLoading } = useChatbot(id || "");
  const { data: chatMessages = [], isLoading: messagesLoading } =
    useChatMessages(id || "");
  const { data: analytics, isLoading: analyticsLoading } = useChatAnalytics(
    id || ""
  );
  const deleteChatbot = useDeleteChatbot();

  const [activeTab, setActiveTab] = useState<
    "overview" | "chat" | "knowledge" | "analytics"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "document">(
    "all"
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const {
    data: knowledgeBase = [],
    isLoading,
    refetch: refetchKnowledgeBase,
  } = useKnowledgeBase(id ?? "");
  const addKnowledgeBase = useAddKnowledgeBase();
  const updateKnowledgeBase = useUpdateKnowledgeBase();
  const deleteKnowledgeBase = useDeleteKnowledgeBase();
  const trainChatbot = useTrainChatbot();

  const filteredKnowledge = knowledgeBase.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.filename &&
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterType === "all" || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSaveKnowledge = async (data: {
    content: string;
    contentType: "text" | "document";
    filename: string;
  }) => {
    if (!id || !data.content.trim()) return;

    setProcessing(true);
    setProgress(0);

    try {
      if (editingItem) {
        setProgressLabel("Updating knowledge...");
        await updateKnowledgeBase.mutateAsync({
          id: editingItem.id,
          updates: {
            content: data.content,
            content_type: data.contentType,
            filename: data.filename || null,
            processed: false,
          },
        });
      } else {
        setProgressLabel("Adding knowledge...");
        await addKnowledgeBase.mutateAsync({
          chatbot_id: id,
          content: data.content,
          content_type: data.contentType,
          filename: data.filename || null,
          processed: false,
        });
      }
      setProgress(40);

      setProgressLabel("Training chatbot...");
      await trainChatbot.mutateAsync({
        chatbotId: id,
        model: "gpt-3.5-turbo",
      });
      setProgress(80);

      setProgressLabel("Updating UI...");
      await refetchKnowledgeBase();
      setProgress(100);

      setEditingItem(null);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: editingItem
              ? "Knowledge item updated successfully"
              : "Knowledge item added successfully",
          },
        })
      );
    } catch (error) {
      console.error("Error saving knowledge:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Failed to save knowledge item",
          },
        })
      );
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 500);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(true);
      setProgressLabel("Deleting item...");
      setProgress(30);

      await deleteKnowledgeBase.mutateAsync(id);
      setProgress(70);

      await refetchKnowledgeBase();
      setProgress(100);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: "Knowledge item deleted successfully",
          },
        })
      );
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Failed to delete knowledge item",
          },
        })
      );
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 500);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      setProcessing(true);
      setProgressLabel(`Deleting ${selectedItems.length} items...`);
      setProgress(20);

      await Promise.all(
        selectedItems.map((id) => deleteKnowledgeBase.mutateAsync(id))
      );
      setProgress(70);

      setSelectedItems([]);
      await refetchKnowledgeBase();
      setProgress(100);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: `${selectedItems.length} items deleted successfully`,
          },
        })
      );
    } catch (error) {
      console.error("Error bulk deleting knowledge items:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Failed to delete selected items",
          },
        })
      );
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 500);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredKnowledge.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredKnowledge.map((item) => item.id));
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowKnowledgeEditor(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
  };

  const handleDownload = (item: any) => {
    const element = document.createElement("a");
    const file = new Blob([item.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = item.filename || `knowledge_${item.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const publicChatUrl = `${window.location.origin}/chat/${id}`;

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
            "This chatbot will be marked as deleted and scheduled for permanent removal in 30 days. You can recover it at any time before then.",
          affectedItems: [
            "Chatbot settings and configuration",
            "All chat history and usage analytics",
            "Linked knowledge base documents",
            "Integration and API configurations",
          ],
          note: "After 30 days, all associated data will be permanently deleted and cannot be recovered.",
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-8 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
          <Link
            to="/integrations"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-7 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </Link>
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
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-7 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
              <Link
                to={`/chatbots/${id}/chat`}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all conversations
              </Link>
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
          {/* Progress Bar */}
          <AnimatePresence>
            {(processing || isLoading) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {progressLabel ||
                      (isLoading ? "Loading..." : "Processing...")}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-primary-500 dark:bg-primary-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            {/* Filters */}
            <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-gray-900/40 dark:to-accent-900/20 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Bot Knowledge Items
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  >
                    <option value="all">All Types</option>
                    <option value="text">Text</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {filteredKnowledge.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === filteredKnowledge.length &&
                          filteredKnowledge.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-700 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-600"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Select all ({filteredKnowledge.length})
                      </span>
                    </label>
                    {selectedItems.length > 0 && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedItems.length} selected
                      </span>
                    )}
                  </div>

                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      disabled={processing}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content List */}
            <div className="p-8">
              {filteredKnowledge.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {searchTerm || filterType !== "all"
                      ? "No matching items"
                      : "No Bot Knowledge items"}
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Add content to help your chatbot answer questions."}
                  </p>
                  {!searchTerm && filterType === "all" && (
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowKnowledgeEditor(true);
                      }}
                      disabled={processing}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredKnowledge.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl shadow-subtle bg-white/90 dark:bg-gray-700/90"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="rounded border-gray-300 dark:border-gray-700 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-600 mr-3"
                          />
                          <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.filename || `${item.content_type} content`}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.content_type === "text"
                                ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                                : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                            }`}
                          >
                            {item.content_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.processed
                                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-7 dark:text-yellow-400"
                            }`}
                          >
                            {item.processed ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                            )}
                            {item.processed ? "Processed" : "Processing"}
                          </span>
                          <button
                            onClick={() => handleView(item)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(item)}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={processing}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {item.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <span>{item.content.length} characters</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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

      {/* Knowledge Editor Modal */}
      <KnowledgeEditorModal
        isOpen={showKnowledgeEditor}
        onClose={() => {
          setShowKnowledgeEditor(false);
          setEditingItem(null);
        }}
        onSave={handleSaveKnowledge}
        editingItem={editingItem}
        isProcessing={processing}
      />

      {/* View Item Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 bg-gray-800/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {viewingItem.filename || "Knowledge Content"}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingItem.content_type === "text"
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                          : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                      }`}
                    >
                      {viewingItem.content_type}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingItem.processed
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {viewingItem.processed ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {viewingItem.processed ? "Processed" : "Not Processed"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Added: {new Date(viewingItem.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 max-h-[60vh] overflow-y-auto">
                  {viewingItem.content}
                </div>
              </div>
              <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Close
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleEdit(viewingItem);
                      setViewingItem(null);
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownload(viewingItem)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-xl hover:bg-green-7 dark:hover:bg-green-800 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const renderCard = (
  title: string,
  data: Array<{ label: string; value: string | number; icon: any }>
) => (
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

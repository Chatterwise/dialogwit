import { useEffect, useState } from "react";
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
  CheckCircle,
  Download,
  Edit,
  Eye,
  Plus,
  X,
  XCircle,
  Clock,
  FileText,
  Activity,
  BarChart2,
  Smile,
  TrendingUp,
  Zap,
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
import { supabase } from "../lib/supabase";
import BotKnowledgeContent from "./BotKnowledgeContent";
import { useProcessLargeDocument } from "../hooks/useProcessLargeDocument";
import { tabs } from "./utils/ChatbotDetailUtils";
import { KnowledgeItem } from "./utils/types";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
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
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const publicChatUrl = `${window.location.origin}/chat/${id}`;

  const {
    data: knowledgeBase = [],
    isLoading: isKnowledgeLoading,
    refetch: refetchKnowledgeBase,
  } = useKnowledgeBase(id ?? "");
  const addKnowledgeBase = useAddKnowledgeBase();
  const updateKnowledgeBase = useUpdateKnowledgeBase();
  const deleteKnowledgeBase = useDeleteKnowledgeBase();
  const { mutate } = useProcessLargeDocument(id ?? "");

  const trainChatbot = useTrainChatbot();

  const stats = [
    {
      name: "Total Messages",
      value: analytics?.totalMessages || 0,
      icon: MessageCircle,
      color:
        "text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/20",
      change: analytics?.totalMessages || 0 > 0 ? "+12%" : "0%",
    },
    {
      name: "Today's Messages",
      value: analytics?.todayMessages || 0,
      icon: Clock,
      color:
        "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      change: analytics?.todayMessages || 0 > 0 ? "+5%" : "0%",
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

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel("knowledge-base-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_base",
          filter: `chatbot_id=eq.${id}`,
        },
        () => {
          refetchKnowledgeBase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchKnowledgeBase]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (
      tabParam &&
      ["overview", "chat", "knowledge", "analytics"].includes(tabParam)
    ) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [location.search]);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    params.set("tab", tabId);
    navigate({ search: params.toString() }, { replace: true });
  };

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

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setShowKnowledgeEditor(true);
  };

  const handleView = (item: KnowledgeItem) => {
    setViewingItem(item);
  };

  const handleDownload = (item: KnowledgeItem) => {
    const element = document.createElement("a");
    const file = new Blob([item.content ?? ""], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = item.filename || `knowledge_${item.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
                onClick={() =>
                  handleTabChange(
                    tab.id as "overview" | "chat" | "knowledge" | "analytics"
                  )
                }
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
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString()
                          : "Unknown date"}
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
          {/* Add Knowledge Button (always visible) */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowKnowledgeEditor(true);
              }}
              disabled={processing}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </button>
          </div>

          {/* Progress Bar */}
          <AnimatePresence>
            {(processing || isKnowledgeLoading) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {progressLabel ||
                      (isKnowledgeLoading ? "Loading..." : "Processing...")}
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

          {/* Bot Knowledge Content */}
          <BotKnowledgeContent
            knowledgeBase={knowledgeBase}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            handleDelete={handleDelete}
            handleBulkDelete={handleBulkDelete}
            handleEdit={handleEdit}
            handleView={handleView}
            handleDownload={handleDownload}
            processing={processing}
            handleProcess={(item) => mutate(item.id)}
            update={refetchKnowledgeBase}
          />
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
          refetchKnowledgeBase();
        }}
        onSave={handleSaveKnowledge}
        editingItem={editingItem}
        isProcessing={processing}
        chatbotId={chatbot.id}
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
                <div className="flex items-center justify-between mb=4">
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
                        <CheckCircle className="h-3 w=3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w=3 mr-1" />
                      )}
                      {viewingItem.processed ? "Processed" : "Not Processed"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Added:{" "}
                    {viewingItem.created_at
                      ? new Date(viewingItem.created_at).toLocaleString()
                      : "Unknown date"}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray=700 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 max-h-[60vh] overflow-y-auto">
                  {viewingItem.content}
                </div>
              </div>
              <div className="px-8 py-5 border-t border-gray-100 dark:border-gray=700 flex justify-between">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration=200"
                >
                  Close
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleEdit(viewingItem);
                      setViewingItem(null);
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration=200"
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownload(viewingItem)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration=200"
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
  data: Array<{
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
  }>
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
          <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/20 text-primary-6 dark:text-primary-400">
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

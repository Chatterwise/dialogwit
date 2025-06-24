import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useChatbot,
  useUpdateChatbot,
  useDeleteChatbot,
} from "../hooks/useChatbots";
import { useRAGSettings, useUpdateRAGSettings } from "../hooks/useRAGSettings";
import {
  Bot,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
  Bookmark,
  Maximize2,
  Sliders,
  Minus,
  Type,
} from "lucide-react";
import { ActionModal } from "./ActionModal";
import { motion } from "framer-motion";

export function ChatbotSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot, isLoading } = useChatbot(id || "");
  const { data: ragSettings } = useRAGSettings(id || "");
  const updateChatbot = useUpdateChatbot();
  const updateRagSettings = useUpdateRAGSettings();
  const deleteChatbot = useDeleteChatbot();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    welcome_message: "",
    placeholder: "",
  });

  const [ragData, setRagData] = useState({
    temperature: 0.7,
    max_tokens: 500,
    similarity_threshold: 0.7,
    max_retrieved_chunks: 3,
    enable_citations: false,
    chunk_char_limit: 200,
    min_word_count: 5,
    stopwords: "hi,hello,ok,hmm,yes,no",
  });

  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusChangeStatus, setStatusChangeStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");

  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name || "",
        description: chatbot.description || "",
        welcome_message: chatbot.welcome_message || "",
        placeholder: chatbot.placeholder || "",
      });
    }
    if (ragSettings) {
      setRagData({
        temperature: ragSettings.temperature ?? 0.7,
        max_tokens: ragSettings.max_tokens ?? 500,
        similarity_threshold: ragSettings.similarity_threshold ?? 0.7,
        max_retrieved_chunks: ragSettings.max_retrieved_chunks ?? 3,
        enable_citations: ragSettings.enable_citations ?? false,
        chunk_char_limit: ragSettings.chunk_char_limit ?? 200,
        min_word_count: ragSettings.min_word_count ?? 5,
        stopwords: ragSettings.stopwords?.join(",") ?? "hi,hello,ok,hmm,yes,no",
      });
    }
  }, [chatbot, ragSettings]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRAGChange = (field: string, value: string | number | boolean) => {
    setRagData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaveStatus("loading");
    try {
      await updateChatbot.mutateAsync({ id, updates: formData });
      await updateRagSettings.mutateAsync({
        chatbot_id: id,
        updates: {
          ...ragData,
          stopwords: ragData.stopwords
            .split(",")
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean),
        },
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteChatbot.mutateAsync(id);
      navigate("/chatbots");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const toggleBotStatus = async () => {
    if (!chatbot || !id) return;
    setStatusChangeStatus("loading");
    try {
      await updateChatbot.mutateAsync({
        id,
        updates: {
          status: chatbot.status === "inactive" ? "ready" : "inactive",
        },
      });
      setStatusChangeStatus("idle");
    } catch {
      setStatusChangeStatus("error");
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !chatbot) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <ActionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        action={{
          title: "Delete Chatbot",
          description:
            "This will permanently delete this bot and all related data.",
          affectedItems: ["Chatbot", "Messages", "Knowledge Base"],
          onConfirm: handleDelete,
          actionLabel: "Delete Chatbot",
          actionColor: "red",
          actionIcon: <Trash2 className="h-4 w-4 mr-2" />,
          confirmationWord: "DELETE",
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/chatbots/${id}`}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <Bot className="h-7 w-7 text-primary-600 dark:text-primary-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings for {chatbot.name}
        </h1>
      </div>

      {/* General Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          General Info
        </h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-2"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-2"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Welcome Message
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-2"
              value={formData.welcome_message}
              onChange={(e) => handleChange("welcome_message", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input Placeholder
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-2"
              value={formData.placeholder}
              onChange={(e) => handleChange("placeholder", e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>

      {/* Visibility & Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Visibility & Utilities
        </h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={toggleBotStatus}
            className="w-fit px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {chatbot.status === "inactive" ? "Activate Bot" : "Deactivate Bot"}
          </button>
          <div className="flex items-center gap-3">
            <input
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
              value={`${window.location.origin}/chat/${id}`}
            />
            <button
              onClick={copyUrl}
              className="px-3 py-2 rounded-lg border text-sm font-medium border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-fit px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
          >
            Delete Chatbot
          </button>
        </div>
      </div>

      {/* Advanced RAG Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Sliders className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Advanced RAG Settings
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Maximize2 className="h-4 w-4" />
                Retrieval Settings
              </label>
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Max Retrieved Chunks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ragData.max_retrieved_chunks}
                    onChange={(e) =>
                      handleRAGChange(
                        "max_retrieved_chunks",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Similarity Threshold
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={ragData.similarity_threshold}
                    onChange={(e) =>
                      handleRAGChange(
                        "similarity_threshold",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Chunk Character Limit
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    value={ragData.chunk_char_limit}
                    onChange={(e) =>
                      handleRAGChange(
                        "chunk_char_limit",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Min Word Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={ragData.min_word_count}
                    onChange={(e) =>
                      handleRAGChange(
                        "min_word_count",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Column 2 */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Type className="h-4 w-4" />
                Generation Settings
              </label>
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={ragData.temperature}
                    onChange={(e) =>
                      handleRAGChange("temperature", parseFloat(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={ragData.max_tokens}
                    onChange={(e) =>
                      handleRAGChange("max_tokens", parseInt(e.target.value))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <input
                    type="checkbox"
                    checked={ragData.enable_citations}
                    onChange={(e) =>
                      handleRAGChange("enable_citations", e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800"
                    id="citations-toggle"
                  />
                  <label
                    htmlFor="citations-toggle"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    Enable Citations
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Minus className="h-4 w-4" />
                Text Processing
              </label>
              <div className="pl-6">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Stopwords (comma-separated)
                </label>
                <textarea
                  value={ragData.stopwords}
                  onChange={(e) => handleRAGChange("stopwords", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 h-24"
                  placeholder="hi,hello,ok,hmm,yes,no"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Words to ignore during text processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2">
          {saveStatus === "loading" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {saveStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 dark:text-green-400 text-sm"
            >
              Changes saved!
            </motion.div>
          )}
          {saveStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-6 dark:text-red-4 text-sm flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" />
              Save failed. Try again.
            </motion.div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saveStatus === "loading"}
          className="px-5 py-2.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {saveStatus === "loading" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useChatbot,
  useUpdateChatbot,
  useDeleteChatbot,
} from "../hooks/useChatbots";
import {
  Bot,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ActionModal } from "./ActionModal";
import { motion } from "framer-motion";

export function ChatbotSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot, isLoading } = useChatbot(id || "");
  const updateChatbot = useUpdateChatbot();
  const deleteChatbot = useDeleteChatbot();

  // Form state that updates when chatbot loads
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    welcome_message: "",
    placeholder: "",
  });
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [statusChangeStatus, setStatusChangeStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");

  // Sync form data with loaded chatbot
  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name || "",
        description: chatbot.description || "",
        welcome_message: chatbot.welcome_message || "",
        placeholder: chatbot.placeholder || "",
      });
    }
  }, [chatbot]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaveStatus("loading");
    try {
      await updateChatbot.mutateAsync({ id, updates: formData });
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
        status: chatbot.status === "inactive" ? "ready" : "inactive",
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
          confirmationWord: "DELETE",
          actionIcon: <Trash2 className="h-4 w-4 mr-2" />,
        }}
      />

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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          General Info
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Welcome Message
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.welcome_message}
              onChange={(e) => handleChange("welcome_message", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Input Placeholder
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={formData.placeholder}
              onChange={(e) => handleChange("placeholder", e.target.value)}
            />
          </div>
        </div>
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
                className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1"
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

      {/* Visibility & Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bot Status & Utilities
        </h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bot Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chatbot.status === "inactive" ? "Inactive" : "Active"}
              </p>
            </div>
            <button
              onClick={toggleBotStatus}
              disabled={statusChangeStatus === "loading"}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                chatbot.status === "inactive"
                  ? "bg-gray-200 dark:bg-gray-700"
                  : "bg-primary-600"
              }`}
            >
              <span
                className={`${
                  chatbot.status === "inactive"
                    ? "translate-x-1"
                    : "translate-x-6"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chatbot URL
            </h3>
            <div className="flex items-center gap-2">
              <input
                readOnly
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={`${window.location.origin}/chat/${id}`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyUrl}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </motion.button>
            </div>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-xs text-green-600 dark:text-green-400"
              >
                URL copied to clipboard!
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {/* Advanced Configuration */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Advanced Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Response Temperature
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="w-full"
              disabled
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Controls how creative or deterministic responses should be (not
              yet supported).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Tokens per Response
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              disabled
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm p-3"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Limits response length. Coming soon.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4 border border-red-200 dark:border-red-900/50">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
          Danger Zone
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            Deleting this chatbot will permanently remove all data, including
            messages and knowledge base content.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Chatbot
          </button>
        </div>
      </div>
    </div>
  );
}

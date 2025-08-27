import { useState } from "react";
import {
  Bot,
  Plus,
  MessageCircle,
  Settings,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useChatbots,
  useDeleteChatbot,
  useRestoreChatbot,
} from "../hooks/useChatbots";
import { ActionModal } from "./ActionModal";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

export const ChatbotList = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: chatbots = [], isLoading, isFetching } = useChatbots(userId);
  const deleteChatbot = useDeleteChatbot();
  const { mutate: restoreChatbot } = useRestoreChatbot();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [canCreateChatbot] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (chatbotId: string, chatbotName: string) => {
    setChatbotToDelete({ id: chatbotId, name: chatbotName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!chatbotToDelete) return;
    setDeletingId(chatbotToDelete.id);
    try {
      await deleteChatbot.mutateAsync(chatbotToDelete.id);
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      alert("Failed to delete chatbot. Please try again.");
    } finally {
      setDeletingId(null);
      setChatbotToDelete(null);
      setShowDeleteModal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">
            Chatbots
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and create your AI-powered chatbots.
          </p>
        </div>
        <Link
          to="/chatbots/new"
          className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 ${
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

      {/* Chatbots Grid */}
      {!userId || isLoading || isFetching ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading chatbots...
          </p>
        </div>
      ) : chatbots.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Bot className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No chatbots yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Get started by creating your first AI-powered chatbot.
          </p>
          <div className="mt-6">
            <Link
              to="/chatbots/new"
              className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 ${
                !canCreateChatbot
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Chatbot
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {chatbots.map((chatbot) => (
            <motion.div
              layout
              key={chatbot.id}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center">
                    {(() => {
                      const iconName =
                        chatbot?.bot_role_templates?.icon_name || "Bot";
                      const Icon = LucideIcons[iconName] || Bot;
                      return (
                        <Icon className="h-9 w-9 text-primary-600 dark:text-primary-400 drop-shadow" />
                      );
                    })()}{" "}
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {chatbot.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chatbot.status === "ready"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                            : chatbot.status === "processing"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                            : chatbot.status === "deleted"
                            ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {chatbot.status === "deleted"
                          ? "Scheduled for Deletion"
                          : chatbot.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2">
                  {chatbot.description}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Role Template:{" "}
                  <span className="font-medium">
                    {chatbot?.bot_role_templates?.name ?? "None assigned"}
                  </span>
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-5">
                  <span>
                    Created {new Date(chatbot.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />0 messages
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/chatbots/${chatbot.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/chatbots/${chatbot.id}/settings`}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  {chatbot.status === "deleted" ? (
                    <button
                      onClick={() => restoreChatbot(chatbot.id)}
                      className="flex items-center justify-center px-3 py-2 border border-green-300 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      title={`Restore ${chatbot.name}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                          ? alert("This chatbot cannot be deleted.")
                          : handleDeleteClick(chatbot.id, chatbot.name)
                      }
                      disabled={
                        deletingId === chatbot.id ||
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                      }
                      className="flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                      title={
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                          ? "This chatbot cannot be deleted"
                          : `Delete ${chatbot.name}`
                      }
                    >
                      {deletingId === chatbot.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
    </motion.div>
  );
};

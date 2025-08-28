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
import { useTranslation } from "../hooks/useTranslation";
import { useLanguage } from "../contexts/LanguageContext";

export const ChatbotList = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

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
      alert(
        t(
          "chatbotlist_delete_failed",
          "Failed to delete chatbot. Please try again."
        )
      );
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
            {t("chatbotlist_title", "Chatbots")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t(
              "chatbotlist_subtitle",
              "Manage and create your AI-powered chatbots."
            )}
          </p>
        </div>
        <Link
          to={`/${currentLanguage}/chatbots/new`}
          className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 ${
            !canCreateChatbot
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : ""
          }`}
          onClick={(e) => {
            if (!canCreateChatbot) {
              e.preventDefault();
              alert(
                t(
                  "chatbotlist_limit_reached",
                  "You've reached your chatbot limit. Please upgrade your plan to create more chatbots."
                )
              );
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("chatbotlist_new_chatbot", "New Chatbot")}
        </Link>
      </div>

      {/* Chatbots Grid */}
      {!userId || isLoading || isFetching ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("chatbotlist_loading", "Loading chatbots...")}
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
            {t("chatbotlist_empty_title", "No chatbots yet")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t(
              "chatbotlist_empty_sub",
              "Get started by creating your first AI-powered chatbot."
            )}
          </p>
          <div className="mt-6">
            <Link
              to={`/${currentLanguage}/chatbots/new`}
              className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 ${
                !canCreateChatbot
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("chatbotlist_create_chatbot", "Create Chatbot")}
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
                      const Icon = (LucideIcons as any)[iconName] || Bot;
                      return (
                        <Icon className="h-9 w-9 text-primary-600 dark:text-primary-400 drop-shadow" />
                      );
                    })()}
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
                          ? t(
                              "chatbotlist_status_scheduled",
                              "Scheduled for Deletion"
                            )
                          : t(
                              `chatbotlist_status_${chatbot.status}`,
                              chatbot.status
                            )}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2">
                  {chatbot.description}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  {t("chatbotlist_role_template", "Role Template:")}{" "}
                  <span className="font-medium">
                    {chatbot?.bot_role_templates?.name ??
                      t("chatbotlist_role_none", "None assigned")}
                  </span>
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-5">
                  <span>
                    {t("chatbotlist_created", "Created")}{" "}
                    {new Date(chatbot.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {t("chatbotlist_messages_count", "{{count}} messages", {
                      count: 0,
                    })}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/${currentLanguage}/chatbots/${chatbot.id}`}
                    className="flex-1 text-center py-2 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    {t("chatbotlist_view", "View")}
                  </Link>
                  <Link
                    to={`/${currentLanguage}/chatbots/${chatbot.id}/settings`}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    title={t("chatbotlist_settings", "Settings")}
                    aria-label={t("chatbotlist_settings", "Settings")}
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  {chatbot.status === "deleted" ? (
                    <button
                      onClick={() => restoreChatbot(chatbot.id)}
                      className="flex items-center justify-center px-3 py-2 border border-green-300 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                      title={t(
                        "chatbotlist_restore_title",
                        "Restore {{name}}",
                        { name: chatbot.name }
                      )}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                          ? alert(
                              t(
                                "chatbotlist_demo_cannot_delete",
                                "This chatbot cannot be deleted."
                              )
                            )
                          : handleDeleteClick(chatbot.id, chatbot.name)
                      }
                      disabled={
                        deletingId === chatbot.id ||
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                      }
                      className="flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50"
                      title={
                        chatbot.id === "6db4c04f-0ed7-4f7d-b622-bd003e22bac5"
                          ? t(
                              "chatbotlist_demo_cannot_delete_title",
                              "This chatbot cannot be deleted"
                            )
                          : t("chatbotlist_delete_title", "Delete {{name}}", {
                              name: chatbot.name,
                            })
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
          title: t("chatbotlist_modal_delete_title", "Delete Chatbot"),
          description: t(
            "chatbotlist_modal_delete_desc",
            "This chatbot will be marked as deleted and scheduled for permanent removal in 30 days. You can recover it at any time before then."
          ),
          affectedItems: [
            t(
              "chatbotlist_modal_affect_settings",
              "Chatbot settings and configuration"
            ),
            t(
              "chatbotlist_modal_affect_history",
              "All chat history and usage analytics"
            ),
            t("chatbotlist_modal_affect_kb", "Linked knowledge base documents"),
            t(
              "chatbotlist_modal_affect_integrations",
              "Integration and API configurations"
            ),
          ],
          note: t(
            "chatbotlist_modal_delete_note",
            "After 30 days, all associated data will be permanently deleted and cannot be recovered."
          ),
          onConfirm: handleDeleteConfirmed,
          actionLabel: t("chatbotlist_modal_delete_action", "Delete Chatbot"),
          actionColor: "red",
          requireType: true,
          confirmationWord: "DELETE",
          actionIcon: <Trash2 className="h-4 w-4 mr-2" />,
        }}
      />
    </motion.div>
  );
};

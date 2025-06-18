import { useState } from "react";
import { Bot, Plus, MessageCircle, Settings, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useChatbots, useDeleteChatbot } from "../hooks/useChatbots";
import { useSubscriptionStatus } from "../hooks/useStripe";
import { useUsageLimitCheck } from "./ChatbotLimitGuard";
import { ActionModal } from "./ActionModal";

export const ChatbotList = () => {
  const { user } = useAuth();
  const { data: chatbots = [], isLoading } = useChatbots(user?.id || "");
  const deleteChatbot = useDeleteChatbot();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { hasActiveSubscription } = useSubscriptionStatus();
  const { checkLimit } = useUsageLimitCheck();
  const [canCreateChatbot, setCanCreateChatbot] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatbotToDelete, setChatbotToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Check if user can create more chatbots
  useState(() => {
    const checkChatbotLimit = async () => {
      if (!user) return;
      try {
        const allowed = await checkLimit("chatbots");
        setCanCreateChatbot(allowed);
      } catch (error) {
        console.error("Failed to check chatbot limit:", error);
      }
    };

    checkChatbotLimit();
  });

  const handleDeleteClick = (chatbotId: string, chatbotName: string) => {
    setChatbotToDelete({ id: chatbotId, name: chatbotName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!chatbotToDelete) return;
    setDeletingId(chatbotToDelete.id);
    try {
      await deleteChatbot.mutateAsync(chatbotToDelete.id);
      // After successful deletion, check if user can create more chatbots
      const allowed = await checkLimit("chatbots");
      setCanCreateChatbot(allowed);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 font-display tracking-tight mb-1">
            Chatbots
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and create your AI-powered chatbots.
          </p>
        </div>
        <Link
          to="/chatbots/new"
          className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors duration-200 ${
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

      {/* Plan Limit Warning */}
      {!canCreateChatbot && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <Bot className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Chatbot Limit Reached
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You've reached the maximum number of chatbots allowed on your
                current plan.
                {!hasActiveSubscription &&
                  " Consider upgrading to create more chatbots."}
              </p>
              {!hasActiveSubscription && (
                <Link
                  to="/pricing"
                  className="mt-2 inline-flex items-center text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  View upgrade options →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbots Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading chatbots...
          </p>
        </div>
      ) : chatbots.length === 0 ? (
        <div className="text-center py-16">
          <Bot className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No chatbots yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Get started by creating your first AI-powered chatbot.
          </p>
          <div className="mt-6">
            <Link
              to="/chatbots/new"
              className={`inline-flex items-center px-5 py-2.5 border border-transparent shadow-card text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors duration-200 ${
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
              Create Chatbot
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((chatbot) => (
            <div
              key={chatbot.id}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center">
                    <Bot className="h-9 w-9 text-primary-600 dark:text-primary-400 drop-shadow" />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {chatbot.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2">
                  {chatbot.description}
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
                    className="flex-1 text-center py-2 px-4 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                  >
                    View
                  </Link>
                  <Link
                    to={`/chatbots/${chatbot.id}/settings`}
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(chatbot.id, chatbot.name)}
                    disabled={deletingId === chatbot.id}
                    className="flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Delete ${chatbot.name}`}
                  >
                    {deletingId === chatbot.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Delete Confirmation Modal */}
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
    </div>
  );
};

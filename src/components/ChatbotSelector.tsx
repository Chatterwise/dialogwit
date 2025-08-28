import { FileText, Bot } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "../hooks/useTranslation";

type Chatbot = {
  id: string;
  name: string;
  bot_avatar?: string | null;
  created_at: string | Date;
  status: string;
  knowledge_base_processed: boolean;
  bot_role_templates?: {
    name: string;
  };
};

interface ChatbotSelectorProps {
  chatbots: Chatbot[];
  selectedChatbot: string;
  setSelectedChatbot: (id: string) => void;
}

export function ChatbotSelector({
  chatbots,
  selectedChatbot,
  setSelectedChatbot,
}: ChatbotSelectorProps) {
  const { t } = useTranslation();

  const statusLabel = (status: string) => {
    // Map common statuses to translatable labels; fall back to raw value
    switch (status) {
      case "ready":
        return t("selector_status_ready", "ready");
      case "processing":
        return t("selector_status_processing", "processing");
      case "deleted":
        return t("selector_status_deleted", "deleted");
      default:
        return status;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
        {t("selector_title", "Select Chatbot")}
      </h3>

      {chatbots.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("selector_empty_title", "No chatbots found")}
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            {t(
              "selector_empty_desc",
              "Create a chatbot first to manage its Bot Knowledge."
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chatbots.map((chatbot) => (
            <button
              key={chatbot.id}
              onClick={() => setSelectedChatbot(chatbot.id)}
              className={`p-5 border rounded-xl text-left transition-all duration-200 shadow-subtle space-y-3 ${
                selectedChatbot === chatbot.id
                  ? "border-primary-500 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-900/30"
                  : "border-gray-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/10"
              }`}
              aria-pressed={selectedChatbot === chatbot.id}
              aria-label={t("selector_card_aria", "Select {{name}}", {
                name: chatbot.name,
              })}
            >
              <div className="flex items-center gap-3">
                {chatbot.bot_avatar ? (
                  <img
                    src={chatbot.bot_avatar}
                    alt={t("selector_bot_avatar_alt", "Bot Avatar")}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Bot className="w-10 h-10 text-primary-500 dark:text-primary-400" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {chatbot.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
                  {t("selector_created_prefix", "Created")}:{" "}
                  {format(new Date(chatbot.created_at), "MMM d, yyyy")}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full ${
                    chatbot.status === "ready"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : chatbot.status === "processing"
                      ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                  }`}
                >
                  {t("selector_status_prefix", "Status")}:{" "}
                  {statusLabel(chatbot.status)}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-full ${
                    chatbot.knowledge_base_processed
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                  }`}
                >
                  {t("selector_kb_prefix", "KB")}:{" "}
                  {chatbot.knowledge_base_processed
                    ? t("selector_kb_processed", "Processed")
                    : t("selector_kb_unprocessed", "Unprocessed")}
                </span>

                {chatbot.bot_role_templates?.name && (
                  <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full px-2 py-0.5">
                    {t("selector_role_prefix", "Role")}:{" "}
                    {chatbot.bot_role_templates.name}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

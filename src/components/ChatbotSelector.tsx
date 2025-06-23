import { FileText, Bot } from "lucide-react";
import { format } from "date-fns";

type Chatbot = {
  id: string;
  name: string;
  bot_avatar?: string;
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
  return (
    <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-100 p-8">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Select Chatbot</h3>

      {chatbots.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No chatbots found</h3>
          <p className="text-gray-400">
            Create a chatbot first to manage its Bot Knowledge.
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
                  ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                  : "border-gray-100 hover:bg-primary-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {chatbot.bot_avatar ? (
                  <img
                    src={chatbot.bot_avatar}
                    alt="Bot Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Bot className="w-10 h-10 text-primary-500" />
                )}
                <div>
                  <p className="font-semibold text-gray-900">{chatbot.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="bg-gray-100 rounded-full px-2 py-0.5">
                  Created: {format(new Date(chatbot.created_at), "MMM d, yyyy")}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    chatbot.status === "ready"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Status: {chatbot.status}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    chatbot.knowledge_base_processed
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  KB:{" "}
                  {chatbot.knowledge_base_processed
                    ? "Processed"
                    : "Unprocessed"}
                </span>
                {chatbot.bot_role_templates?.name && (
                  <span className="bg-purple-100 text-purple-700 rounded-full px-2 py-0.5">
                    Role: {chatbot.bot_role_templates.name}
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

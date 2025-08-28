import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatMessages } from "../hooks/useChatMessages";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  ArrowLeft,
  User as UserIcon,
  Bot as BotIcon,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

export const BotChatsPage = () => {
  const { t } = useTranslation();
  const { id: botId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: chatMessages = [],
    isLoading,
    isError,
  } = useChatMessages(botId || "");
  const [filterText, setFilterText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterDate, setFilterDate] = useState<string>("");

  // Filter and sort messages
  const filteredMessages = useMemo(() => {
    return chatMessages
      .filter((msg) => {
        const q = filterText.toLowerCase();
        const matchesText =
          msg.message.toLowerCase().includes(q) ||
          (msg.response && msg.response.toLowerCase().includes(q));
        const matchesDate =
          !filterDate ||
          new Date(msg.created_at).toDateString() ===
            new Date(filterDate).toDateString();
        return matchesText && matchesDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [chatMessages, filterText, filterDate, sortOrder]);

  const handleExport = (format: "json" | "csv") => {
    if (!filteredMessages.length) return;

    let content: string;
    let filename: string;

    if (format === "json") {
      content = JSON.stringify(filteredMessages, null, 2);
      filename = `${t("botchats_export_basename", "chats")}_${botId}.json`;
    } else {
      const headers = [
        t("botchats_col_time", "Time"),
        t("botchats_col_sender", "Sender"),
        t("botchats_col_message", "Message"),
        t("botchats_col_response", "Response"),
      ];
      const rows = filteredMessages.map((msg) => [
        new Date(msg.created_at).toISOString(),
        msg.sender,
        msg.message,
        msg.response || "",
      ]);
      content = [headers, ...rows].map((row) => row.join(",")).join("\n");
      filename = `${t("botchats_export_basename", "chats")}_${botId}.csv`;
    }

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"
          aria-label={t("botchats_loading", "Loading...")}
          title={t("botchats_loading", "Loading...")}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <BotIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("botchats_error_title", "Error loading chat messages")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t(
            "botchats_error_desc",
            "Could not load chat messages for this bot."
          )}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          {t("botchats_go_back", "Go Back")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 md:p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t("botchats_go_back", "Go Back")}
          title={t("botchats_go_back", "Go Back")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("botchats_go_back", "Go Back")}
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport("json")}
            className="flex items-center px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            disabled={!filteredMessages.length}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {t("botchats_export_json", "Export JSON")}
            </span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center px-4 py-2 rounded-xl bg-accent-600 text-white hover:bg-accent-700 transition-colors disabled:opacity-50"
            disabled={!filteredMessages.length}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {t("botchats_export_csv", "Export CSV")}
            </span>
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t("botchats_title", "All Chat Messages")}
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t("botchats_search_placeholder", "Search messages...")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 transition w-full"
            aria-label={t("botchats_search_label", "Search messages")}
          />
        </div>
        <input
          type="date"
          placeholder={t(
            "botchats_filter_date_placeholder",
            "Filter by date..."
          )}
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 transition w-full"
          aria-label={t("botchats_filter_date_label", "Filter by date")}
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full"
          aria-label={t("botchats_sort_toggle", "Toggle sort order")}
        >
          {sortOrder === "asc" ? (
            <ChevronUp className="h-4 w-4 mr-2" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-2" />
          )}
          {sortOrder === "asc"
            ? t("botchats_sort_oldest", "Oldest First")
            : t("botchats_sort_newest", "Newest First")}
        </button>
      </div>

      {/* Table-like list */}
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div className="col-span-2 sm:col-span-2">
              {t("botchats_col_time", "Time")}
            </div>
            <div className="col-span-2 sm:col-span-1">
              {t("botchats_col_sender", "Sender")}
            </div>
            <div className="col-span-4 sm:col-span-4">
              {t("botchats_col_message", "Message")}
            </div>
            <div className="col-span-4 sm:col-span-5">
              {t("botchats_col_response", "Response")}
            </div>
          </div>
          {filteredMessages.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {t(
                  "botchats_empty",
                  "No messages found matching your filters."
                )}
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="grid grid-cols-12 gap-2 sm:gap-4 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition"
              >
                <div className="col-span-2 sm:col-span-2 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(msg.created_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center">
                  {msg.sender === "bot" ? (
                    <BotIcon className="h-4 w-4 text-primary-600 dark:text-primary-400 mr-2" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  )}
                  <span className="text-sm sm:hidden text-gray-900 dark:text-gray-100">
                    {msg.sender === "bot"
                      ? t("botchats_sender_bot", "Bot")
                      : t("botchats_sender_user", "User")}
                  </span>
                  <span className="text-sm hidden sm:inline text-gray-900 dark:text-gray-100">
                    {msg.sender === "bot"
                      ? t("botchats_sender_bot", "Bot")
                      : t("botchats_sender_user", "User")}
                  </span>
                </div>
                <div className="col-span-4 sm:col-span-4 text-sm text-gray-900 dark:text-gray-100 break-words">
                  {msg.message}
                </div>
                <div className="col-span-4 sm:col-span-5 text-sm text-gray-600 dark:text-gray-300 break-words">
                  {msg.response}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

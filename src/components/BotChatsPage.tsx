import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatMessages } from "../hooks/useChatMessages";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Calendar,
  Download,
  ArrowLeft,
  User as UserIcon,
  Bot as BotIcon,
} from "lucide-react";

export const BotChatsPage = () => {
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
        const matchesText =
          msg.message.toLowerCase().includes(filterText.toLowerCase()) ||
          (msg.response &&
            msg.response.toLowerCase().includes(filterText.toLowerCase()));
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
      filename = `chats_${botId}.json`;
    } else {
      const headers = ["Time", "Sender", "Message", "Response"];
      const rows = filteredMessages.map((msg) => [
        new Date(msg.created_at).toISOString(),
        msg.sender,
        msg.message,
        msg.response || "",
      ]);
      content = [headers, ...rows].map((row) => row.join(",")).join("\n");
      filename = `chats_${botId}.csv`;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <BotIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Error loading chat messages
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Could not load chat messages for this bot.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          Go Back
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
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport("json")}
            className="flex items-center px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            disabled={!filteredMessages.length}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center px-4 py-2 rounded-xl bg-accent-600 text-white hover:bg-accent-700 transition-colors"
            disabled={!filteredMessages.length}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        All Chat Messages
      </h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search messages..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 transition w-full"
          />
        </div>
        <input
          type="date"
          placeholder="Filter by date..."
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 transition w-full"
        />
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full"
        >
          {sortOrder === "asc" ? (
            <ChevronUp className="h-4 w-4 mr-2" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-2" />
          )}
          {sortOrder === "asc" ? "Oldest First" : "Newest First"}
        </button>
      </div>

      {/* Table-like list */}
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300">
            <div className="col-span-2 sm:col-span-2">Time</div>
            <div className="col-span-2 sm:col-span-1">Sender</div>
            <div className="col-span-4 sm:col-span-4">Message</div>
            <div className="col-span-4 sm:col-span-5">Response</div>
          </div>
          {filteredMessages.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No messages found matching your filters.
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
                    {msg.sender === "bot" ? "Bot" : "User"}
                  </span>
                  <span className="text-sm hidden sm:inline text-gray-900 dark:text-gray-100">
                    {msg.sender === "bot" ? "Bot" : "User"}
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

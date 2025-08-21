import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader } from "lucide-react";
import { useSendMessage } from "../hooks/useChatMessages";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

type ChatbotSettings = {
  name?: string | null;
  welcome_message?: string | null;
  placeholder?: string | null;
  bot_avatar?: string | null;
};

export const ChatPreview = ({ botId }: { botId?: string }) => {
  const [botSettings, setBotSettings] = useState<ChatbotSettings | null>(null);

  // Default initial message while we fetch settings (fast fallback)
  const DEFAULT_WELCOME =
    "Hello! I'm your AI assistant. How can I help you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      text: DEFAULT_WELCOME,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chatbot settings (welcome_message, placeholder, name, avatar)
  useEffect(() => {
    let cancelled = false;

    async function loadBotSettings() {
      if (!botId) {
        setBotSettings(null);
        // Keep default welcome if there’s no saved bot
        return;
      }

      const { data, error } = await supabase
        .from("chatbots")
        .select("name, welcome_message, placeholder, bot_avatar")
        .eq("id", botId)
        .single();

      if (cancelled) return;

      if (error) {
        console.warn("Failed to load chatbot settings:", error);
        setBotSettings(null);
        // Keep whatever message we had
        return;
      }

      setBotSettings(data as ChatbotSettings);

      // Reset the conversation to the bot's welcome message on bot change
      const welcome =
        (data?.welcome_message && data.welcome_message.trim()) ||
        DEFAULT_WELCOME;

      setMessages([
        {
          id: "initial",
          text: welcome,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }

    loadBotSettings();
    return () => {
      cancelled = true;
    };
  }, [botId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !botId || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      let finalText = "";

      await sendMessage.mutateAsync({
        chatbotId: botId,
        message: userMessage.text,
        userId: user?.id || "NO_USER",
        onChunk: (chunk) => {
          finalText += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === loadingMessage.id
                ? {
                    ...msg,
                    text: finalText,
                    isLoading: true,
                  }
                : msg
            )
          );
        },
      });

      // Once stream ends, mark message as done
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id ? { ...msg, isLoading: false } : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: "Sorry, I encountered an error. Please try again.",
                isLoading: false,
              }
            : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputPlaceholder =
    (botSettings?.placeholder && botSettings.placeholder.trim()) ||
    "Type your message...";

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 h-96 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {botSettings?.bot_avatar ? (
              // Avatar image if configured
              <img
                src={botSettings.bot_avatar}
                alt={botSettings.name ?? "Bot"}
                className="h-6 w-6 rounded-full mr-3 object-cover"
              />
            ) : (
              <Bot className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3" />
            )}
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {botSettings?.name
                ? `Chat Preview — ${botSettings.name}`
                : "Chat Preview"}
            </h3>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-subtle ${
                message.sender === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              <div className="flex items-start">
                {message.sender === "bot" &&
                  (botSettings?.bot_avatar ? (
                    <img
                      src={botSettings.bot_avatar}
                      alt={botSettings.name ?? "Bot"}
                      className="h-4 w-4 mr-2 mt-0.5 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <Bot className="h-4 w-4 mr-2 mt-0.5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  ))}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.text}
                    {message.isLoading && (
                      <span className="animate-pulse">▌</span>
                    )}
                  </p>
                  <span
                    className={`text-xs opacity-75 mt-1 block ${
                      message.sender === "user"
                        ? "text-white/80"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.sender === "user" && (
                  <User className="h-4 w-4 ml-2 mt-0.5 text-white/80 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={inputPlaceholder}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
            disabled={sendMessage.isPending || !botId}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessage.isPending || !botId}
            className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {sendMessage.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        {!botId && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Chat preview is only available for saved chatbots
          </p>
        )}
      </div>
    </div>
  );
};

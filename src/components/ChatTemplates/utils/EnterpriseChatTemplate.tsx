import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  User,
  ShieldCheck,
} from "lucide-react";
import { LogoMini } from "../../ui/Logo";
import { useTypewriter } from "./useTypewriter";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}
interface BotMetadata {
  name: string;
  welcome_message: string;
  placeholder: string;
  bot_avatar?: string;
}
interface EnterpriseChatTemplateProps {
  botId: string;
  apiUrl?: string;
  apiKey?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  theme?: "light" | "dark";
  className?: string;
}

export const EnterpriseChatTemplate = ({
  botId,
  apiUrl = "/api",
  apiKey,
  isOpen = false,
  onToggle,
  theme = "light",
  className = "",
}: EnterpriseChatTemplateProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [botMetadata, setBotMetadata] = useState<BotMetadata>({
    name: "",
    welcome_message: "",
    placeholder: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch bot meta
  useEffect(() => {
    async function fetchBotMetadata() {
      try {
        const response = await fetch(
          `${apiUrl}/bot-metadata?chatbot_id=${botId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
            },
          }
        );
        const data = await response.json();
        if (data?.name) {
          setBotMetadata({
            name: data.name,
            welcome_message: `Hi there! I’m your Chatterwise assistant.\n\nI can answer questions about Chatterwise features, walk you through getting started, and guide you through integrations with other platforms.\n\nJust let me know what you’d like to do, or ask for a quick overview of what’s possible!`,
            placeholder: data.placeholder || "Type your question...",
            bot_avatar: data.bot_avatar || undefined,
          });
        }
      } catch (err) {
        setBotMetadata((meta) => ({
          ...meta,
          welcome_message:
            meta.welcome_message ||
            `👋 Welcome to Chatterwise!\n\nI can answer questions about features, getting started, and integrations. Try asking, "What can Chatterwise do?" or "How do I connect with Slack?"`,
        }));
        console.error("Failed to fetch bot metadata", err);
      }
    }
    fetchBotMetadata();
  }, [botId, apiUrl, apiKey]);

  // Show welcome message when opening, or when resetting
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "1",
          text: botMetadata.welcome_message,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
    }
  }, [isOpen, botMetadata.welcome_message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Loading placeholder
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          chatbot_id: botId,
          message: userMessage.text,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? { ...msg, text: data.response, isLoading: false }
            : msg
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset chat handler
  const handleReset = () => {
    setMessages([
      {
        id: "1",
        text: botMetadata.welcome_message,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
  };

  const isDark = theme === "dark";

  // Find index and message for the streaming effect
  const lastBotMsgIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "bot" && !messages[i].isLoading) return i;
    }
    return -1;
  })();
  const botStreamMsg =
    lastBotMsgIdx !== -1 ? messages[lastBotMsgIdx] : undefined;
  // Always call the hook! Only use the value if rendering that message.
  const botStreamText = useTypewriter(
    botStreamMsg?.text ?? "",
    14,
    !!botStreamMsg
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-full max-w-sm ${className}`}
      style={{ minWidth: 350 }}
    >
      <div
        className={`border rounded-xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark
            ? "bg-neutral-900 text-neutral-100 border-neutral-800"
            : "bg-white text-neutral-900 border-neutral-200"
        }`}
        style={{
          minHeight: isMinimized ? 64 : 500,
          height: isMinimized ? 64 : 560,
        }}
      >
        {/* Header */}
        <div
          className={`border-b px-5 py-3 flex items-center justify-between ${
            isDark
              ? "bg-neutral-950 border-neutral-800 text-neutral-100"
              : "bg-neutral-50 border-neutral-200 text-neutral-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {botMetadata.bot_avatar ? (
              <img
                src={botMetadata.bot_avatar}
                alt={botMetadata.name}
                className="w-9 h-9 rounded-full object-cover bg-white"
              />
            ) : (
              <LogoMini className="w-5 h-7 rounded-full object-cover" />
            )}
            <div>
              <div className="font-semibold text-base leading-none">
                {botMetadata.name || "Enterprise Bot"}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Online{" "}
                <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full align-middle" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`p-1 rounded hover:bg-neutral-200/30 transition-colors ${
                isDark ? "dark:hover:bg-neutral-800/50" : ""
              }`}
              aria-label="Reset chat"
              title="Reset chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className={`p-1 rounded hover:bg-neutral-200/30 transition-colors ${
                isDark ? "dark:hover:bg-neutral-800/50" : ""
              }`}
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggle?.(false)}
              className={`p-1 rounded hover:bg-red-50 transition-colors ${
                isDark ? "dark:hover:bg-red-900/40" : ""
              }`}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 bg-transparent">
              {messages.map((msg, i) => {
                const isBotStreaming =
                  i === lastBotMsgIdx && msg.sender === "bot" && !msg.isLoading;

                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 items-end ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Avatar (bot left, user right) */}
                    {msg.sender === "bot" && (
                      <div className="mr-2 flex-shrink-0">
                        {botMetadata.bot_avatar ? (
                          <img
                            src={botMetadata.bot_avatar}
                            alt={botMetadata.name}
                            className="w-8 h-8 rounded-full object-cover bg-white"
                          />
                        ) : (
                          <LogoMini className="w-4 h-5 rounded-full object-cover" />
                        )}
                      </div>
                    )}
                    <div>
                      <div
                        className={
                          msg.sender === "user"
                            ? "rounded-xl px-4 py-2 bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg border border-blue-700 flex items-center min-h-10"
                            : "rounded-xl px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow flex items-center min-h-10"
                        }
                        style={{ fontSize: 13, minHeight: 40, maxWidth: 320 }}
                      >
                        {msg.isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="animate-spin w-4 h-4" />
                            <span>Thinking…</span>
                          </span>
                        ) : (
                          <span className="whitespace-pre-wrap">
                            {isBotStreaming ? botStreamText : msg.text}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender === "user"
                            ? "text-right text-blue-600"
                            : "text-left text-neutral-400 dark:text-neutral-400"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center rounded-full font-bold shadow border border-blue-800">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div
              className={`flex items-center justify-between px-5 py-2 border-t ${
                isDark
                  ? "border-neutral-800 bg-neutral-950/95 text-neutral-300"
                  : "border-neutral-200 bg-neutral-50 text-neutral-700"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Your data is private</span>
              </div>
              <a
                href="https://www.iubenda.com/privacy-policy/16849142"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:text-primary-400 transition-colors"
              >
                Privacy policy
              </a>
            </div>

            {/* Input */}
            <div
              className={`px-5 py-4 border-t ${
                isDark
                  ? "border-neutral-800 bg-neutral-950"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <form
                className="flex items-center gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                autoComplete="off"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={botMetadata.placeholder}
                  className={`flex-1 rounded-lg border px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-400"
                      : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-500"
                  }`}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

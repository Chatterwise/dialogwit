import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Loader, X, Minimize2, Maximize2 } from "lucide-react";

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

interface ChatTemplateProps {
  botId: string;
  apiUrl?: string;
  apiKey?: string;
  template?:
    | "modern"
    | "minimal"
    | "bubble"
    | "professional"
    | "gaming"
    | "elegant"
    | "corporate"
    | "healthcare"
    | "education"
    | "retail"
    | "glassdock"
    | "messenger";
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  // botName?: string;
  botAvatar?: string;
  // welcomeMessage?: string;
  // placeholder?: string;
  position?: "bottom-right" | "bottom-left" | "center" | "fullscreen";
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export const ChatTemplate = ({
  botId,
  apiUrl = "/api",
  apiKey,
  template = "modern",
  theme = "light",
  botAvatar,
  position = "bottom-right",
  isOpen = false,
  onToggle,
  className = "",
}: ChatTemplateProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [botMetadata, setBotMetadata] = useState<BotMetadata>({
    name: "",
    welcome_message: "",
    placeholder: "",
  });
  const baseStyles = {
    light: "bg-white text-gray-900",
    dark: "bg-gray-900 text-white",
  };

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
            welcome_message: data.welcome_message || "Hello!",
            placeholder: data.placeholder || "Type your question...",
            bot_avatar: data.bot_avatar || undefined,
          });
        }
      } catch (err) {
        console.error("Failed to fetch bot metadata", err);
      }
    }
    fetchBotMetadata();
  }, [botId]);

  useEffect(() => {
    if (messages.length === 0 && botMetadata?.welcome_message !== "") {
      setMessages([
        {
          id: "1",
          text: botMetadata.welcome_message,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [botMetadata]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollDown(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollDown(!atBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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

    // Add loading message
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
          message: inputValue,
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

  const getTemplateStyles = () => {
    const templates = {
      modern: {
        container: `rounded-2xl shadow-2xl border ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`,
        header: `bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md`,
          bot: `${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          } rounded-2xl rounded-bl-md`,
        },
      },
      minimal: {
        container: `rounded-lg shadow-lg border ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`,
        header: `${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        } rounded-t-lg`,
        message: {
          user: `bg-blue-500 text-white rounded-lg`,
          bot: `${theme === "dark" ? "bg-gray-700" : "bg-gray-100"} rounded-lg`,
        },
      },
      bubble: {
        container: `rounded-3xl shadow-xl border-2 ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        }`,
        header: `bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl`,
        message: {
          user: `bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-6 py-3`,
          bot: `${
            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
          } rounded-full px-6 py-3`,
        },
      },
      professional: {
        container: `rounded-lg shadow-lg border ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        }`,
        header: `${
          theme === "dark" ? "bg-gray-800" : "bg-slate-800"
        } text-white rounded-t-lg`,
        message: {
          user: `bg-slate-700 text-white rounded-lg`,
          bot: `${
            theme === "dark" ? "bg-gray-700" : "bg-slate-100"
          } rounded-lg`,
        },
      },
      gaming: {
        container: `rounded-xl shadow-2xl border-2 border-green-500 bg-gradient-to-b ${
          theme === "dark" ? "from-gray-900 to-black" : "from-gray-100 to-white"
        }`,
        header: `bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl`,
        message: {
          user: `bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg border border-green-400`,
          bot: `${
            theme === "dark"
              ? "bg-gray-800 border-gray-600"
              : "bg-gray-100 border-gray-300"
          } rounded-lg border`,
        },
      },
      elegant: {
        container: `rounded-2xl shadow-2xl border ${
          theme === "dark" ? "border-purple-500" : "border-purple-200"
        } bg-gradient-to-b ${
          theme === "dark"
            ? "from-purple-900 to-gray-900"
            : "from-purple-50 to-white"
        }`,
        header: `bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl`,
          bot: `${
            theme === "dark"
              ? "bg-purple-800/30 border-purple-500"
              : "bg-purple-100 border-purple-200"
          } rounded-2xl border`,
        },
      },
      corporate: {
        container: `rounded-lg shadow-lg border ${
          theme === "dark" ? "border-gray-600" : "border-gray-300"
        } bg-white`,
        header: `bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-t-lg`,
        message: {
          user: `bg-gray-700 text-white rounded-lg`,
          bot: `${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50 border-gray-200"
          } rounded-lg border`,
        },
      },
      healthcare: {
        container: `rounded-2xl shadow-xl border-2 ${
          theme === "dark" ? "border-teal-600" : "border-teal-200"
        } bg-gradient-to-b ${
          theme === "dark"
            ? "from-teal-900 to-gray-900"
            : "from-teal-50 to-white"
        }`,
        header: `bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl`,
          bot: `${
            theme === "dark"
              ? "bg-teal-800/30 border-teal-500"
              : "bg-teal-50 border-teal-200"
          } rounded-2xl border`,
        },
      },
      education: {
        container: `rounded-2xl shadow-xl border-2 ${
          theme === "dark" ? "border-amber-600" : "border-amber-200"
        } bg-gradient-to-b ${
          theme === "dark"
            ? "from-amber-900 to-gray-900"
            : "from-amber-50 to-white"
        }`,
        header: `bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl`,
          bot: `${
            theme === "dark"
              ? "bg-amber-800/30 border-amber-500"
              : "bg-amber-50 border-amber-200"
          } rounded-2xl border`,
        },
      },
      retail: {
        container: `rounded-2xl shadow-xl border-2 ${
          theme === "dark" ? "border-rose-600" : "border-rose-200"
        } bg-gradient-to-b ${
          theme === "dark"
            ? "from-rose-900 to-gray-900"
            : "from-rose-50 to-white"
        }`,
        header: `bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-t-2xl`,
        message: {
          user: `bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl`,
          bot: `${
            theme === "dark"
              ? "bg-rose-800/30 border-rose-500"
              : "bg-rose-50 border-rose-200"
          } rounded-2xl border`,
        },
      },
      glassdock: {
        container: `rounded-3xl shadow-2xl ${
          theme === "dark" ? "bg-white/5" : "bg-white/70"
        } backdrop-blur-xl border ${
          theme === "dark" ? "border-white/10" : "border-gray-200/60"
        }`,
        header: `bg-gradient-to-r from-primary-600/90 to-blue-600/90 text-white rounded-t-3xl`,
        message: {
          user: `bg-primary-600 text-white rounded-2xl shadow`,
          bot: `${
            theme === "dark"
              ? "bg-gray-800/70 border-gray-700"
              : "bg-white/80 border-gray-200"
          } rounded-2xl border backdrop-blur`,
        },
      },
      messenger: {
        container: `rounded-2xl shadow-xl ${
          theme === "dark" ? "bg-gray-900" : "bg-white"
        } border ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`,
        header: `${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} text-gray-900 dark:text-white rounded-t-2xl border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`,
        message: {
          user: `bg-blue-600 text-white rounded-2xl`,
          bot: `${theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"} rounded-2xl`,
        },
      },
    };

    return templates[template];
  };

  const styles = getTemplateStyles();

  if (!isOpen) return null;

  const getPositionStyles = () => {
    switch (position) {
      case "bottom-left":
        return "fixed bottom-4 left-4 z-50";
      case "center":
        return "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50";
      case "fullscreen":
        return "fixed inset-4 z-50";
      default:
        return "fixed bottom-4 right-4 z-50";
    }
  };

  const getContainerSize = () => {
    if (position === "fullscreen") return "w-full h-full";
    if (position === "center") return "w-96 h-[600px]";
    return isMinimized ? "w-80 h-16" : "w-80 h-[500px]";
  };

  return (
    <div
      className={`${getPositionStyles()} ${getContainerSize()} ${className}`}
    >
      <div
        className={`${baseStyles[theme]} ${styles.container} h-full flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* Header */}
        <div
          className={`${styles.header} px-4 py-3 flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            {botAvatar ? (
              <img
                src={botAvatar}
                alt={botMetadata?.name ?? "Bot Avatar"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {botMetadata?.name ?? "ChatBot"}
              </h3>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggle?.(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative">
              {messages.map((message, idx) => {
                const prev = messages[idx - 1];
                const next = messages[idx + 1];
                const sameAsPrev = prev && prev.sender === message.sender;
                const sameAsNext = next && next.sender === message.sender;
                const isMessenger = template === "messenger";
                const isNewDay = !prev || new Date(prev.timestamp).toDateString() !== new Date(message.timestamp).toDateString();
                const extraRound = isMessenger
                  ? `${
                      message.sender === "user"
                        ? `${sameAsPrev ? "rounded-tr-md" : ""} ${
                            sameAsNext ? "rounded-br-md" : ""
                          }`
                        : `${sameAsPrev ? "rounded-tl-md" : ""} ${
                            sameAsNext ? "rounded-bl-md" : ""
                          }`
                    }`
                  : "";
                const bubbleClass = `max-w-xs lg:max-w-sm px-4 py-2 ${styles.message[message.sender]} ${extraRound}`;
                return (
                  <div
                    key={message.id}
                    className={`group flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {isNewDay && (
                      <div className="w-full text-center mb-1">
                        <span className="inline-block text-[11px] text-gray-600 dark:text-gray-400 bg-white/70 dark:bg-gray-900/70 px-2 py-0.5 rounded-full backdrop-blur">
                          {new Date(message.timestamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className={bubbleClass}>
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <span className="text-xs opacity-75 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {template === "messenger" && (
                            <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {["👍", "❤️", "👎"].map((r) => (
                                <button
                                  key={r}
                                  onClick={() => setReactions((prev) => ({ ...prev, [message.id]: r }))}
                                  className={`text-[11px] px-1 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
                                    reactions[message.id] === r ? "bg-black/10 dark:bg-white/10" : ""
                                  }`}
                                  aria-label={`React ${r}`}
                                >
                                  {r}
                                </button>
                              ))}
                              {reactions[message.id] && (
                                <span className="ml-1 text-[11px] opacity-70">{reactions[message.id]}</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              {(template === "glassdock" || template === "messenger") && showScrollDown && (
                <button
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs backdrop-blur hover:bg-black/70"
                >
                  New messages ↓
                </button>
              )}
            </div>

            {/* Input */}
            <div
              className={`p-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={botMetadata.placeholder}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    template === "glassdock" ? "bg-primary-600 hover:bg-primary-700 shadow" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              {(template === "glassdock" || template === "messenger") && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {["What can you do?", "Summarize our pricing", "How to integrate?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setInputValue(q)}
                      className="px-2.5 py-1 text-xs rounded-full border border-gray-300/70 dark:border-gray-700/70 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

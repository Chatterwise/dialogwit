import { useState, useEffect, useRef } from "react";
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
import { MarkdownMessage } from "../../MarkdownMessage";
import { readSSE } from "../../utils/sse";

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
  status?: "ready" | "paused" | "deleted" | string;
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

function normalizeStreamingText(input: string): string {
  let s = input.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/^\n{2,}/, "\n");
  return s;
}

function statusDisplay(status?: string) {
  const s = String(status || "ready").toLowerCase();
  if (s === "ready")
    return { label: "Ready", dot: "bg-green-500", text: "text-neutral-500" };
  if (s === "paused")
    return { label: "Paused", dot: "bg-amber-500", text: "text-amber-600" };
  if (s === "deleted")
    return { label: "Unavailable", dot: "bg-red-500", text: "text-red-600" };
  return { label: "Unknown", dot: "bg-neutral-400", text: "text-neutral-500" };
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [botMetadata, setBotMetadata] = useState<BotMetadata>({
    name: "",
    welcome_message: "",
    placeholder: "",
    status: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";
  const botReady = (botMetadata.status ?? "ready").toLowerCase() === "ready";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/bot-metadata?chatbot_id=${botId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          },
          cache: "no-store",
        });
        const data = await res.json();
        setBotMetadata({
          name: data?.name ?? "",
          welcome_message:
            data?.welcome_message ||
            "Hi there! I’m your Chatterwise assistant.\n\nI can answer questions about Chatterwise features, walk you through getting started, and guide you through integrations with other platforms.",
          placeholder: data?.placeholder || "Type your message...",
          bot_avatar: data?.bot_avatar || undefined,
          status: data?.status || "ready",
        });
      } catch {
        setBotMetadata((meta) => ({
          ...meta,
          status: meta.status || "paused",
          welcome_message:
            meta.welcome_message ||
            "👋 Welcome to Chatterwise! Ask me anything about features, setup, and integrations.",
        }));
      }
    })();
  }, [botId, apiUrl, apiKey]);

  useEffect(() => {
    if (!isOpen) return;
    setMessages([
      {
        id: "welcome",
        text: botMetadata.welcome_message,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
  }, [isOpen, botMetadata.welcome_message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending || !botReady) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    const botMsgId = `b_${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      {
        id: botMsgId,
        text: "",
        sender: "bot",
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    try {
      const res = await fetch(`${apiUrl}/chat-file-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
          Accept: "text/event-stream",
        },
        cache: "no-store",
        keepalive: false,
        body: JSON.stringify({
          chatbot_id: botId,
          message: userMessage.text,
          ...(threadId ? { thread_id: threadId } : {}),
          stream: true,
        }),
      });

      let full = "";
      await readSSE(res, {
        onReady: (tid) => tid && setThreadId(tid),
        onDelta: (chunk) => {
          full += chunk;
          const normalized = normalizeStreamingText(full);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, text: normalized, isLoading: true }
                : m
            )
          );
        },
        onEnd: (payload) => {
          const finalText = (payload?.text && String(payload.text)) || full;
          const normalized = normalizeStreamingText(finalText).trimEnd();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, text: normalized, isLoading: false }
                : m
            )
          );
        },
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: "Sorry, I hit an error. Please try again.",
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const s = statusDisplay(botMetadata.status);

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
        <div
          className={`border-b px-5 py-3 flex items-center justify-between ${
            isDark
              ? "bg-neutral-950 border-neutral-800"
              : "bg-neutral-50 border-neutral-200"
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
              <div className={`text-xs mt-1 flex items-center gap-2 ${s.text}`}>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${s.dot}`}
                />
                <span>{s.label}</span>
                {!botReady && (
                  <span className="opacity-70">— replies disabled</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: "welcome",
                    text: botMetadata.welcome_message,
                    sender: "bot",
                    timestamp: new Date(),
                  },
                ]);
                setThreadId(null);
                setInputValue("");
              }}
              className="p-1 rounded hover:bg-neutral-200/30 dark:hover:bg-neutral-800/50"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-neutral-200/30 dark:hover:bg-neutral-800/50"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggle?.(false)}
              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 bg-transparent">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex mb-3 items-end ${
                      isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isBot && (
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
                          isBot
                            ? "rounded-xl px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 shadow flex items-start min-h-10"
                            : "rounded-xl px-4 py-2 bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg border border-blue-700 flex items-center min-h-10"
                        }
                        style={{
                          fontSize: 13,
                          minHeight: 40,
                          maxWidth: 420,
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {isBot ? (
                          msg.isLoading ? (
                            msg.text ? (
                              <div
                                className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1"
                                style={{
                                  maxHeight: 280,
                                  overflow: "auto",
                                }}
                              >
                                <MarkdownMessage text={msg.text} />
                              </div>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Loader className="animate-spin w-4 h-4" />
                                <span>Thinking…</span>
                              </span>
                            )
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1">
                              <MarkdownMessage text={msg.text} />
                            </div>
                          )
                        ) : (
                          <span className="whitespace-pre-wrap">
                            {msg.text}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          isBot
                            ? "text-left text-neutral-400 dark:text-neutral-400"
                            : "text-right text-blue-600"
                        }`}
                        style={{ fontSize: 11 }}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {!isBot && (
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
                  ? "border-neutral-800 bg-neutral-950/95"
                  : "border-neutral-200 bg-neutral-50"
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={
                    botReady
                      ? botMetadata.placeholder || "Type your message..."
                      : "This bot is not accepting messages right now"
                  }
                  className={`flex-1 rounded-lg border px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${
                    isDark
                      ? "bg-neutral-950 border-neutral-800 text-neutral-100 placeholder-neutral-400"
                      : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-500"
                  }`}
                  disabled={isSending || !botReady}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending || !botReady}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white disabled:bg-blue-400 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  {isSending ? (
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

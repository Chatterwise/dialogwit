import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  Loader,
  MessageCircle,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useChatbot } from "../hooks/useChatbots";
import { MarkdownMessage } from "./MarkdownMessage";
import { useTranslation } from "../hooks/useTranslation";
import { readSSE } from "./utils/sse";
import { fetchWithRetry } from "../lib/http";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

export const PublicChat = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { chatbotId } = useParams<{ lang?: string; chatbotId: string }>();
  const { data: chatbot, isLoading: chatbotLoading } = useChatbot(chatbotId || "");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message (localized, with fallback)
  useEffect(() => {
    if (!chatbot) return;
    const welcome =
      (chatbot.welcome_message && chatbot.welcome_message.trim()) ||
      t(
        "chat.preview.defaults.welcome",
        `Hi! I’m ${chatbot.name}. ${chatbot.description ?? ""} How can I help you today?`
      );

    setMessages([
      { id: "welcome", text: welcome, sender: "bot", timestamp: new Date() },
    ]);
    setThreadId(null);
  }, [chatbot, t]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatbotId || isSending) return;

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
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const { data: sessionData } = await supabase.auth.getSession();
      const bearer = sessionData.session?.access_token ?? anon;

      const res = await fetchWithRetry(`${base}/functions/v1/chat-file-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anon,
          Authorization: `Bearer ${bearer}`,
          Accept: "text/event-stream",
        },
        cache: "no-store",
        body: JSON.stringify({
          chatbot_id: chatbotId,
          message: userMessage.text,
          ...(threadId ? { thread_id: threadId } : {}),
          stream: true,
        }),
        timeoutMs: 20000,
        retries: 1,
      });

      let full = "";
      await readSSE(res, {
        onReady: (tid) => tid && setThreadId(tid),
        onDelta: (chunk) => {
          full += chunk;
          // show live stream (raw) while typing to avoid broken code fences
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: full, isLoading: true } : m
            )
          );
        },
        onEnd: (payload) => {
          const finalText = (payload?.text && String(payload.text)) || full;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? { ...m, text: finalText, isLoading: false }
                : m
            )
          );
          if (payload?.thread_id && typeof payload.thread_id === "string") {
            setThreadId(payload.thread_id);
          }
        },
      });
    } catch (e) {
      console.error(e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: t(
                  "chat.preview.errors.generic",
                  "Sorry, I couldn’t process that request. Please try again."
                ),
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  if (chatbotLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {t("publicChat.loading", "Loading chatbot...")}
          </p>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {t("publicChat.notFoundTitle", "Chatbot Not Found")}
          </h1>
          <p className="text-gray-600">
            {t(
              "publicChat.notFoundDesc",
              "The chatbot you're looking for doesn't exist or isn't available."
            )}
          </p>
        </div>
      </div>
    );
  }

  if (chatbot.status !== "ready") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {t("publicChat.notReadyTitle", "Chatbot Not Ready")}
          </h1>
          <p className="text-gray-600">
            {t(
              "publicChat.notReadyDesc",
              "This chatbot is still being processed. Please try again later."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-white/90 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{chatbot.name}</h1>
                <p className="text-sm text-gray-600">{chatbot.description}</p>
              </div>
            </div>
            <button
              onClick={() => setIsMinimized((s) => !s)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title={
                isMinimized
                  ? t("publicChat.expand", "Expand")
                  : t("publicChat.minimize", "Minimize")
              }
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div
          className={`bg-white rounded-2xl shadow-xl border transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          }`}
        >
          {!isMinimized && (
            <>
              <div className="px-6 py-3 border-b bg-gray-50 rounded-t-2xl flex items-center">
                <MessageCircle className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium">
                  {t("publicChat.header", "Chat with {{name}}", {
                    name: chatbot.name,
                  })}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 h-[480px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-subtle ${
                        m.sender === "user"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-50 border text-gray-900"
                      }`}
                    >
                      <div className="flex items-start">
                        {m.sender === "bot" && (
                          <Bot className="h-4 w-4 mr-2 mt-0.5 text-primary-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          {m.isLoading ? (
                            m.text ? (
                              <pre className="text-sm whitespace-pre-wrap">
                                {m.text}
                              </pre>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span className="text-sm">
                                  {t(
                                    "chat.preview.status.thinking",
                                    "Thinking..."
                                  )}
                                </span>
                              </div>
                            )
                          ) : m.sender === "bot" ? (
                            <div className="prose prose-sm max-w-none">
                              <MarkdownMessage text={m.text} />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              {m.text}
                            </p>
                          )}
                          <span
                            className={`text-xs opacity-75 mt-2 block ${
                              m.sender === "user"
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            {m.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {m.sender === "user" && (
                          <User className="h-4 w-4 ml-2 mt-0.5 text-white/80 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t(
                      "chat.preview.input.placeholder",
                      "Type your message..."
                    )}
                    className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                    disabled={isSending}
                    aria-label={t(
                      "chat.preview.input.aria_message",
                      "Message input"
                    )}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                    aria-label={t("chat.preview.actions.send", "Send")}
                  >
                    {isSending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {t("publicChat.poweredBy", "Powered by {{name}} • Press Enter to send", {
                    name: chatbot.name,
                  })}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          {t(
            "publicChat.footerNote",
            "This chatbot is powered by AI and trained on custom Bot Knowledge"
          )}
        </p>
      </div>
    </div>
  );
};

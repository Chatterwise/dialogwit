import React, { useState, useEffect, useRef } from "react";
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
import { useChatbot } from "../hooks/useChatbots";
import { useAuth } from "../hooks/useAuth";
import { useChatFileSearch } from "../hooks/useChatFileSearch";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

export const PublicChat = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>();
  const { data: chatbot, isLoading: chatbotLoading } = useChatbot(
    chatbotId || ""
  );
  const ask = useChatFileSearch();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [threadId, setThreadId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatbot) {
      const welcome =
        (chatbot.welcome_message && chatbot.welcome_message.trim()) ||
        `Hola, soy ${chatbot.name}. ${
          chatbot.description ?? ""
        } ¿En qué puedo ayudarte hoy?`;
      setMessages([
        {
          id: "welcome",
          text: welcome,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setThreadId(undefined); // new bot => new thread
    }
  }, [chatbot]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatbotId || ask.isPending) return;

    const userMessage: Message = {
      id: `u_${Date.now()}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    const loadingMessage: Message = {
      id: `b_${Date.now() + 1}`,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // pass thread_id for reuse (faster)
      const res = await ask.mutateAsync({
        chatbot_id: chatbotId,
        message: userMessage.text,
        thread_id: threadId,
        user_id: user?.id ?? "PUBLIC",
      });

      setThreadId(res.thread_id ?? threadId); // keep the one from server

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessage.id
            ? { ...m, text: res.text, isLoading: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessage.id
            ? {
                ...m,
                text: "Sorry, I encountered an error. Please try again in a moment.",
                isLoading: false,
              }
            : m
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

  if (chatbotLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Chatbot Not Found</h1>
          <p className="text-gray-600">
            The chatbot you're looking for doesn't exist or isn't available.
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
          <h1 className="text-2xl font-bold mb-2">Chatbot Not Ready</h1>
          <p className="text-gray-600">
            This chatbot is still being processed. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
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
              title={isMinimized ? "Expand" : "Minimize"}
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

      {/* Chat */}
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
                  Chat with {chatbot.name}
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
                            <div className="flex items-center space-x-2">
                              <Loader className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Thinking...</span>
                            </div>
                          ) : m.sender === "bot" ? (
                            // Render markdown for bot replies
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: (props) => (
                                    <a
                                      {...props}
                                      className="underline hover:no-underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    />
                                  ),
                                  ul: (props) => (
                                    <ul {...props} className="list-disc ml-5" />
                                  ),
                                  ol: (props) => (
                                    <ol
                                      {...props}
                                      className="list-decimal ml-5"
                                    />
                                  ),
                                  code: (props) => (
                                    <code
                                      {...props}
                                      className="bg-gray-100 px-1 rounded"
                                    />
                                  ),
                                }}
                              >
                                {m.text}
                              </ReactMarkdown>
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
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                    disabled={ask.isPending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || ask.isPending}
                    className="px-5 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                  >
                    {ask.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Powered by {chatbot.name} • Press Enter to send
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-sm text-gray-500">
          This chatbot is powered by AI and trained on custom Bot Knowledge
        </p>
      </div>
    </div>
  );
};

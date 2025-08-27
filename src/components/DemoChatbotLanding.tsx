import { useState, useRef, useEffect } from "react";
import { Bot, ArrowRight } from "lucide-react";

const BOT_ID = "6db4c04f-0ed7-4f7d-b622-bd003e22bac5";
const API_URL = "https://bpzfivbuhgjpkngcjpzc.supabase.co/functions/v1";
const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwemZpdmJ1aGdqcGtuZ2NqcHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTI3MzIsImV4cCI6MjA2NTY2ODczMn0.fBkQQJiLLfSwW3yH3rJ1HOLj-fs27tEfBJtOBpWtdx4";

export function DemoChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi there! I’m the Chatterwise Assistant. Ask me anything about Chatterwise features, pricing, integrations, or how to get started.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo?.(0, chatRef.current.scrollHeight);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    setMessages((msgs) => [
      ...msgs,
      { id: Date.now(), text: input, sender: "user" },
    ]);
    setInput("");
    setIsTyping(true);

    // Call the real ChatterWise backend
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          chatbot_id: BOT_ID,
          message: input,
        }),
      });
      if (!response.ok) throw new Error("Bot API error");

      const data = await response.json();
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 1,
          text: data.response ?? "Sorry, I didn't get that.",
          sender: "bot",
        },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 2,
          text: "Sorry, there was an error connecting to the bot. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
        <div className="flex items-center">
          <Bot className="h-6 w-6 mr-2" />
          <div>
            <h3 className="font-bold">ChatterWise Assistant</h3>
            <p className="text-xs opacity-80">
              Want to know more about chatterwise?
            </p>
          </div>
        </div>
      </div>
      <div
        className="h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
        ref={chatRef}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-primary-500 text-white rounded-tr-none"
                  : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex mb-3">
            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-lg rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleSend}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-r-lg transition-colors"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

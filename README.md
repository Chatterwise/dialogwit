[![Netlify Status](https://api.netlify.com/api/v1/badges/558a24b5-c65e-4ee3-bcbf-e43fd0ae4291/deploy-status)](https://app.netlify.com/projects/jovial-sfogliatella-0211f2/deploys)

# 🤖 AI Chatbot Integration Solution

A complete chatbot integration solution that allows users to easily add AI-powered chatbots to any web application. Supports both React (headless approach) and universal script tag integration.

Lingo npx lingo.dev@latest run

## Commit message rules

- **Default** (patch): chore: …, docs: …, refactor: …, ci: …, etc.

- **Minor**: start the commit with feat:
`  e.g. feat: add export to CSV
`
- **Major**: add a breaking marker or footer
`  e.g. feat!: remove legacy API or include a footer:
`

## 🚀 Features

### For React Developers

- **Headless UI Approach**: Complete control over chat interface design
- **TypeScript Support**: Fully typed for better development experience
- **Built-in State Management**: Handles messages, loading states, and errors
- **Customizable**: Easy to style and integrate into existing designs
- **Zero Dependencies**: Self-contained hook with no external dependencies

### For All Other Frameworks

- **Universal Script Tag**: Works with any framework or vanilla HTML
- **No Build Process**: Just add a script tag and you're ready
- **Highly Customizable**: Colors, position, theme, and behavior options
- **Responsive Design**: Works perfectly on desktop and mobile
- **Professional UI**: Beautiful, modern chat widget design

💡 Folder Structure (under `supabase/functions/`):

- `_shared/`: All shared logic.
  - `types.ts`: TypeScript interfaces and types.
  - `utils/`: Utility functions:
    - `openai.ts`: Embedding + chat completion logic.
    - `chunking.ts`: `chunkText` with smart paragraph/sentence boundaries.
    - `database.ts`: Batch insert, metadata tracking, fallback queries.
    - `response.ts`: Standard success/error responses.
  - `handlers/`: Abstracted core handlers.
    - `rag.ts`: `generateRAGResponse()`, supports streaming + citations.
    - `processing.ts`: `processKnowledgeBase()`, handles batch ingestion.

📦 Edge Functions:

- `chat/index.ts`: Handles user messages using RAG.
- `process-knowledge-base/index.ts`: Ingests docs, chunks, and embeds.
- `train-chatbot/index.ts`: Training abstraction (optional).

✅ Key Features:

1. **Batch Efficiency**

   - Inserts up to 100 chunks per query.
   - Embeds up to 20 chunks per OpenAI call.
   - Rate limit–safe, with exponential backoff.

2. **Chunking**

   - Preserves paragraphs/sentences.
   - Configurable `maxLength`, `overlapLength`.

3. **Citation Support**

   - Chunk metadata: `source_url`, `chunk_index`, `similarity`, etc.
   - Optionally included in chatbot responses.

4. **Search & Fallback**

   - Primary: vector search via `match_documents()`.
   - Fallback: text-based keyword search if embeddings fail or unavailable.

5. **Robust Error Handling**

   - `OpenAIError`, `ValidationError`, etc.
   - 4xx/5xx status codes and JSON error payloads.
   - Detects missing/invalid `OPENAI_API_KEY`.

6. **Streaming Ready**
   - `streamChatCompletion()` using `ReadableStream`.
   - Easily swapped into chat handler.

🛠️ Extendable:

- Add new metadata fields to chunks (e.g., section titles).
- Track processing timestamps and document versions.
- Easily portable to other vector DBs or LLM providers.

## 📁 Files Included

```
├── useChatbot.ts              # React hook for headless integration
├── chatbot-widget.js          # Universal widget script
├── integration-examples/
│   ├── react-example.tsx      # React implementation examples
│   └── vanilla-js-example.html # Vanilla JS demo page
└── README.md                  # This documentation
```

## 🔧 Quick Start

### React Integration

1. **Download the hook**: Copy `useChatbot.ts` into your React project

2. **Install and use**:

```tsx
import { useChatbot } from "./useChatbot";

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChatbot({
    botId: "your-bot-id",
    apiUrl: "https://your-api.supabase.co/functions/v1",
    apiKey: "your-api-key",
  });

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  return <div>{/* Your custom chat UI here */}</div>;
}
```

### Universal Script Tag Integration

1. **Host the widget**: Upload `chatbot-widget.js` to your server

2. **Add to your HTML**:

```html
<script
  src="https://your-domain.com/chatbot-widget.js"
  data-bot-id="your-bot-id"
  data-api-url="https://your-api.supabase.co/functions/v1"
  data-api-key="your-api-key"
  data-theme="light"
  data-position="bottom-right"
  data-primary-color="#3B82F6"
  async
></script>
```

## ⚙️ Configuration Options

### React Hook Options

```typescript
interface UseChatbotOptions {
  botId: string; // Required: Your bot ID
  apiUrl?: string; // API endpoint URL
  apiKey?: string; // API authentication key
  onError?: (error: string) => void; // Error callback
  onMessageSent?: (message: string) => void; // Message sent callback
  onResponseReceived?: (response: string) => void; // Response received callback
}
```

### Script Tag Attributes

| Attribute              | Description                                                              | Default                            |
| ---------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| `data-bot-id`          | Your chatbot ID (required)                                               | -                                  |
| `data-api-url`         | API endpoint URL                                                         | -                                  |
| `data-api-key`         | API authentication key                                                   | -                                  |
| `data-theme`           | Widget theme (`light`, `dark`)                                           | `light`                            |
| `data-position`        | Widget position (`bottom-right`, `bottom-left`, `top-right`, `top-left`) | `bottom-right`                     |
| `data-primary-color`   | Primary color (hex)                                                      | `#3B82F6`                          |
| `data-title`           | Widget title                                                             | `AI Assistant`                     |
| `data-subtitle`        | Widget subtitle                                                          | `Online`                           |
| `data-placeholder`     | Input placeholder                                                        | `Type your message...`             |
| `data-welcome-message` | Welcome message                                                          | `Hello! How can I help you today?` |

## 🎮 Widget API (Script Tag)

The script tag integration exposes a global `ChatbotWidget` object:

```javascript
// Open the chat widget
ChatbotWidget.open();

// Close the chat widget
ChatbotWidget.close();

// Toggle the chat widget
ChatbotWidget.toggle();

// Send a message programmatically
ChatbotWidget.sendMessage("Hello!");

// Check if widget is open
console.log(ChatbotWidget.isOpen()); // true/false

// Access configuration
console.log(ChatbotWidget.config);
```

## 🌐 Framework Compatibility

### ✅ Supported Frameworks

- **React** (via custom hook)
- **Angular** (via script tag)
- **Vue.js** (via script tag)
- **Svelte** (via script tag)
- **Vanilla JavaScript** (via script tag)
- **WordPress** (via script tag)
- **Shopify** (via script tag)
- **Any other framework** (via script tag)

## 🎨 Customization Examples

### React Custom Styling

```tsx
const { messages, sendMessage, isLoading } = useChatbot({
  botId: "your-bot-id",
  apiUrl: "https://your-api.supabase.co/functions/v1",
  apiKey: "your-api-key",
});

return (
  <div className="my-custom-chat">
    {messages.map((msg) => (
      <div key={msg.id} className="message">
        <div className="user-message">{msg.message}</div>
        <div className="bot-response">
          {msg.isLoading ? "Thinking..." : msg.response}
        </div>
      </div>
    ))}
  </div>
);
```

### Script Tag Custom Colors

```html
<script
  src="chatbot-widget.js"
  data-bot-id="your-bot-id"
  data-primary-color="#ff6b6b"
  data-theme="dark"
  data-position="bottom-left"
></script>
```

## 🔒 Security Notes

1. **API Keys**: Replace `YOUR_API_KEY` with your actual API key
2. **CORS**: Ensure your API endpoint allows requests from your domain
3. **Rate Limiting**: Implement rate limiting on your API endpoint
4. **Input Validation**: Validate all user inputs on the server side

## 🐛 Troubleshooting

### Common Issues

1. **Widget not appearing**: Check console for JavaScript errors
2. **API errors**: Verify your API URL and key are correct
3. **CORS issues**: Ensure your API allows cross-origin requests
4. **Styling conflicts**: Use more specific CSS selectors

### Debug Mode

Add this to enable debug logging:

```javascript
// For script tag integration
window.ChatbotWidget.debug = true;

// For React hook
const { messages, error } = useChatbot({
  // ... options
  onError: (error) => console.error("Chat error:", error),
});
```

## 📚 API Reference

### React Hook Return Values

```typescript
interface UseChatbotReturn {
  messages: ChatMessage[]; // Array of chat messages
  isLoading: boolean; // Loading state
  error: string | null; // Error message if any
  sendMessage: (message: string) => Promise<void>; // Send message function
  clearMessages: () => void; // Clear all messages
  retryLastMessage: () => Promise<void>; // Retry last failed message
}
```

### Message Object Structure

```typescript
interface ChatMessage {
  id: string; // Unique message ID
  message: string; // User's message
  response: string; // Bot's response
  timestamp: Date; // Message timestamp
  isLoading?: boolean; // Loading state for this message
}
```

## 🤝 Support

For support and questions:

1. Check the examples in `integration-examples/`
2. Review this documentation
3. Test with the demo page (`vanilla-js-example.html`)
4. Contact support if issues persist

## 📄 License

This integration solution is provided as-is for use with your AI chatbot service.

---

**Happy chatting! 🚀**

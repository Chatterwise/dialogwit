# Complete Chatbot Integration Setup Guide

This guide provides step-by-step instructions for integrating our chatbot solution into your application using either React templates or the universal script widget.

## Table of Contents

1. [React Template Integration](#react-template-integration)
2. [Universal Script Widget](#universal-script-widget)
3. [Headless Hook Usage](#headless-hook-usage)
4. [Configuration Options](#configuration-options)
5. [Troubleshooting](#troubleshooting)

## React Template Integration

### Step 1: Download Template Files

Choose your preferred template and download the necessary files:

```bash
# Create the directory structure
mkdir -p src/components/ChatTemplates

# Download the base template
curl -o src/components/ChatTemplates/ChatTemplate.tsx https://your-domain.com/templates/ChatTemplate.tsx

# Download your chosen template (example: Modern)
curl -o src/components/ChatTemplates/ModernChat.tsx https://your-domain.com/templates/ModernChat.tsx

# Download the index file
curl -o src/components/ChatTemplates/index.ts https://your-domain.com/templates/index.ts
```

### Step 2: Install Dependencies

```bash
npm install lucide-react
```

### Step 3: Basic Implementation

```tsx
import React, { useState } from 'react'
import { ModernChat } from './components/ChatTemplates'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your app content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to My App
        </h1>
        
        {/* Chat trigger button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
        >
          💬
        </button>
      </div>

      {/* Chat Template */}
      <ModernChat
        botId="your-bot-id"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        theme="light"
      />
    </div>
  )
}

export default App
```

### Step 4: Advanced Configuration

```tsx
<ModernChat
  botId="your-bot-id"
  apiUrl="https://your-api.supabase.co/functions/v1"
  apiKey="your-api-key"
  isOpen={isChatOpen}
  onToggle={setIsChatOpen}
  theme="dark"
  position="center"
  botName="Support Assistant"
  welcomeMessage="Welcome! How can I help you today?"
  placeholder="Type your message here..."
  primaryColor="#059669"
  className="custom-animation"
/>
```

## Universal Script Widget

### Step 1: Host the Widget Script

Upload the `chatbot-widget.js` file to your server or CDN.

### Step 2: Add Script Tag

Add this script tag to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Chatbot Widget -->
    <script 
      src="https://your-domain.com/chatbot-widget.js" 
      data-bot-id="your-bot-id"
      data-api-url="https://your-api.supabase.co/functions/v1"
      data-api-key="your-api-key"
      data-template="modern"
      data-theme="light"
      data-position="bottom-right"
      data-primary-color="#3B82F6"
      data-bot-name="AI Assistant"
      data-welcome-message="Hello! How can I help you today?"
      data-placeholder="Type your message..."
      async>
    </script>
</body>
</html>
```

### Step 3: Programmatic Control (Optional)

```javascript
// Wait for widget to load
document.addEventListener('DOMContentLoaded', function() {
  if (typeof ChatbotWidget !== 'undefined') {
    // Open chat after 5 seconds
    setTimeout(() => {
      ChatbotWidget.open()
    }, 5000)
    
    // Send a message programmatically
    ChatbotWidget.sendMessage("Hello from JavaScript!")
    
    // Check if widget is open
    console.log(ChatbotWidget.isOpen())
  }
})
```

## Headless Hook Usage

For complete UI control, use the headless hook:

### Step 1: Download the Hook

```bash
curl -o src/hooks/useChatbot.ts https://your-domain.com/hooks/useChatbot.ts
```

### Step 2: Create Custom UI

```tsx
import React, { useState } from 'react'
import { useChatbot } from './hooks/useChatbot'

function CustomChat() {
  const { messages, sendMessage, isLoading, error } = useChatbot({
    botId: 'your-bot-id',
    apiUrl: 'https://your-api.supabase.co/functions/v1',
    apiKey: 'your-api-key'
  })

  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      {/* Custom header */}
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold">Custom Chat</h3>
      </div>
      
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
            
            {/* Bot response */}
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-xs">
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <p className="text-sm">{msg.response}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
```

## Configuration Options

### Template Styles

- `modern` - Sleek gradient design with rounded corners
- `minimal` - Clean and simple interface
- `bubble` - Playful bubble-style messages
- `professional` - Corporate and business-focused
- `gaming` - Gaming-inspired with neon accents
- `elegant` - Sophisticated and refined

### Themes

- `light` - Light theme (default)
- `dark` - Dark theme
- `auto` - Automatic based on system preference

### Positions

- `bottom-right` - Bottom right corner (default)
- `bottom-left` - Bottom left corner
- `center` - Center of screen
- `fullscreen` - Full screen overlay

### Colors

Use any hex color for `primaryColor` or `data-primary-color`:
- `#3B82F6` - Blue (default)
- `#059669` - Green
- `#DC2626` - Red
- `#7C3AED` - Purple

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check console for JavaScript errors
   - Verify script URL is accessible
   - Ensure bot ID is correct

2. **API errors**
   - Verify API URL and key are correct
   - Check CORS settings on your API
   - Ensure bot is in 'ready' status

3. **Styling conflicts**
   - Use more specific CSS selectors
   - Check for conflicting CSS frameworks
   - Use `!important` sparingly for overrides

4. **Mobile responsiveness**
   - Templates are responsive by default
   - Test on actual devices
   - Check viewport meta tag

### Debug Mode

Enable debug logging:

```javascript
// For script tag integration
window.ChatbotWidget.debug = true

// For React hook
const { messages, error } = useChatbot({
  // ... options
  onError: (error) => console.error('Chat error:', error),
  onMessageSent: (message) => console.log('Message sent:', message),
  onResponseReceived: (response) => console.log('Response received:', response)
})
```

### Performance Optimization

1. **Lazy loading**
   ```tsx
   const ModernChat = React.lazy(() => import('./components/ChatTemplates/ModernChat'))
   
   // Use with Suspense
   <Suspense fallback={<div>Loading chat...</div>}>
     <ModernChat {...props} />
   </Suspense>
   ```

2. **Bundle size optimization**
   - Import only the templates you need
   - Use tree shaking
   - Consider code splitting

3. **API optimization**
   - Implement request debouncing
   - Add retry logic
   - Use connection pooling

## Support

For additional help:

1. Check the template gallery for live examples
2. Review the API documentation
3. Contact support for custom implementations

---

**Happy chatting! 🚀**
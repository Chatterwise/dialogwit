// Universal Chatbot Widget - Self-contained integration solution
(function() {
  'use strict';

  // Get configuration from script tag
  const script = document.currentScript || document.querySelector('script[data-bot-id]');
  const config = {
    botId: script.getAttribute('data-bot-id'),
    apiUrl: script.getAttribute('data-api-url') || 'https://your-api.supabase.co/functions/v1',
    apiKey: script.getAttribute('data-api-key') || 'YOUR_API_KEY',
    theme: script.getAttribute('data-theme') || 'light',
    position: script.getAttribute('data-position') || 'bottom-right',
    primaryColor: script.getAttribute('data-primary-color') || '#3B82F6',
    title: script.getAttribute('data-title') || 'AI Assistant',
    subtitle: script.getAttribute('data-subtitle') || 'Online',
    placeholder: script.getAttribute('data-placeholder') || 'Type your message...',
    welcomeMessage: script.getAttribute('data-welcome-message') || 'Hello! How can I help you today?'
  };

  if (!config.botId) {
    console.error('Chatbot Widget: data-bot-id is required');
    return;
  }

  // Widget state
  let isOpen = false;
  let messages = [];
  let isLoading = false;

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'chatbot-widget';
    widget.innerHTML = `
      <style>
        #chatbot-widget {
          position: fixed;
          ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
          ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .chatbot-toggle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .chatbot-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0,0,0,0.2);
        }
        
        .chatbot-toggle:active {
          transform: scale(0.95);
        }
        
        .chatbot-toggle svg {
          width: 24px;
          height: 24px;
          fill: white;
          transition: transform 0.3s ease;
        }
        
        .chatbot-toggle.open svg {
          transform: rotate(180deg);
        }
        
        .chatbot-window {
          position: absolute;
          ${config.position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
          ${config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
          width: 380px;
          height: 550px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.8) translateY(20px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .chatbot-window.open {
          display: flex;
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        
        .chatbot-header {
          background: linear-gradient(135deg, ${config.primaryColor}, ${adjustColor(config.primaryColor, -20)});
          color: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        
        .chatbot-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }
        
        .chatbot-header-content {
          position: relative;
          z-index: 1;
        }
        
        .chatbot-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 2px;
        }
        
        .chatbot-subtitle {
          font-size: 12px;
          opacity: 0.9;
          display: flex;
          align-items: center;
        }
        
        .status-dot {
          width: 6px;
          height: 6px;
          background: #10B981;
          border-radius: 50%;
          margin-right: 6px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          position: relative;
          z-index: 1;
        }
        
        .close-button:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f8fafc;
        }
        
        .chatbot-messages::-webkit-scrollbar {
          width: 4px;
        }
        
        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          animation: messageSlide 0.3s ease-out;
        }
        
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message.user {
          background: ${config.primaryColor};
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 6px;
        }
        
        .message.bot {
          background: white;
          color: #374151;
          align-self: flex-start;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .message.loading {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .loading-dots {
          display: flex;
          gap: 3px;
        }
        
        .loading-dots span {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          animation: loading 1.4s infinite ease-in-out;
        }
        
        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes loading {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }
        
        .chatbot-input {
          padding: 20px;
          border-top: 1px solid #e2e8f0;
          background: white;
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        
        .input-container {
          flex: 1;
          position: relative;
        }
        
        .chatbot-input input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s ease;
          resize: none;
          font-family: inherit;
        }
        
        .chatbot-input input:focus {
          border-color: ${config.primaryColor};
        }
        
        .send-button {
          padding: 12px;
          background: ${config.primaryColor};
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 44px;
        }
        
        .send-button:hover:not(:disabled) {
          background: ${adjustColor(config.primaryColor, -10)};
          transform: translateY(-1px);
        }
        
        .send-button:active {
          transform: translateY(0);
        }
        
        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .send-button svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
        
        .powered-by {
          text-align: center;
          padding: 8px;
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
        }
        
        @media (max-width: 480px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          }
        }
      </style>
      
      <button class="chatbot-toggle" onclick="toggleChat()" aria-label="Toggle chat">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
      
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-header-content">
            <div class="chatbot-title">${config.title}</div>
            <div class="chatbot-subtitle">
              <span class="status-dot"></span>
              ${config.subtitle}
            </div>
          </div>
          <button class="close-button" onclick="toggleChat()" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="message bot">
            ${config.welcomeMessage}
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </div>
        
        <div class="chatbot-input">
          <div class="input-container">
            <input 
              type="text" 
              id="chatbot-input" 
              placeholder="${config.placeholder}"
              onkeypress="handleKeyPress(event)"
              autocomplete="off"
            />
          </div>
          <button class="send-button" onclick="sendMessage()" id="send-button" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        
        <div class="powered-by">
          Powered by AI Chatbot
        </div>
      </div>
    `;
    
    document.body.appendChild(widget);
  }

  // Utility function to adjust color brightness
  function adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  }

  // Toggle chat window
  window.toggleChat = function() {
    isOpen = !isOpen;
    const chatWindow = document.getElementById('chatbot-window');
    const toggleButton = document.querySelector('.chatbot-toggle');
    
    if (isOpen) {
      chatWindow.classList.add('open');
      toggleButton.classList.add('open');
      // Focus input when opened
      setTimeout(() => {
        document.getElementById('chatbot-input').focus();
      }, 300);
    } else {
      chatWindow.classList.remove('open');
      toggleButton.classList.remove('open');
    }
  };

  // Handle enter key
  window.handleKeyPress = function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Send message
  window.sendMessage = async function() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    
    if (!message || isLoading) return;
    
    input.value = '';
    addMessage(message, 'user');
    
    // Add loading message
    const loadingId = addLoadingMessage();
    isLoading = true;
    updateSendButton();
    
    try {
      const response = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          botId: config.botId,
          message: message,
          userIp: 'widget-user'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      removeLoadingMessage(loadingId);
      addMessage(data.response, 'bot');
      
    } catch (error) {
      console.error('Chat error:', error);
      removeLoadingMessage(loadingId);
      addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
    } finally {
      isLoading = false;
      updateSendButton();
      input.focus();
    }
  };

  // Add message to chat
  function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
      ${text}
      <div class="message-time">${timeString}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add loading message
  function addLoadingMessage() {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    const loadingId = 'loading-' + Date.now();
    messageDiv.id = loadingId;
    messageDiv.className = 'message bot loading';
    messageDiv.innerHTML = `
      <span>Thinking</span>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return loadingId;
  }

  // Remove loading message
  function removeLoadingMessage(loadingId) {
    const loadingMessage = document.getElementById(loadingId);
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  // Update send button state
  function updateSendButton() {
    const button = document.getElementById('send-button');
    button.disabled = isLoading;
    
    if (isLoading) {
      button.innerHTML = `
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
    } else {
      button.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      `;
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

  // Handle escape key to close chat
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isOpen) {
      toggleChat();
    }
  });

  // Expose widget API for advanced users
  window.ChatbotWidget = {
    open: () => !isOpen && toggleChat(),
    close: () => isOpen && toggleChat(),
    toggle: toggleChat,
    sendMessage: (message) => {
      if (message && typeof message === 'string') {
        document.getElementById('chatbot-input').value = message;
        window.sendMessage();
      }
    },
    isOpen: () => isOpen,
    config: config
  };

})();
# Framework-Specific Integration Examples

This guide provides specific implementation examples for popular web frameworks.

## React / Next.js

### Basic Integration

```tsx
import React, { useState } from 'react'
import { ModernChat } from './components/ChatTemplates'

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div>
      <main>
        <h1>Welcome to our website</h1>
        <button onClick={() => setIsChatOpen(true)}>
          Need help? Chat with us!
        </button>
      </main>

      <ModernChat
        botId="your-bot-id"
        apiUrl="https://your-api.supabase.co/functions/v1"
        apiKey="your-api-key"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
      />
    </div>
  )
}
```

### Next.js with Dynamic Import

```tsx
import dynamic from 'next/dynamic'
import { useState } from 'react'

const ModernChat = dynamic(
  () => import('./components/ChatTemplates/ModernChat'),
  { ssr: false }
)

export default function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div>
      <main>Your content here</main>
      <ModernChat
        botId="your-bot-id"
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
      />
    </div>
  )
}
```

## Vue.js

### Vue 3 Composition API

```vue
<template>
  <div>
    <main>
      <h1>Welcome to our website</h1>
      <button @click="openChat">Need help?</button>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const openChat = () => {
  if (window.ChatbotWidget) {
    window.ChatbotWidget.open()
  }
}

onMounted(() => {
  // Load chatbot widget
  const script = document.createElement('script')
  script.src = 'https://your-domain.com/chatbot-widget.js'
  script.setAttribute('data-bot-id', 'your-bot-id')
  script.setAttribute('data-api-url', 'https://your-api.supabase.co/functions/v1')
  script.setAttribute('data-api-key', 'your-api-key')
  script.setAttribute('data-template', 'modern')
  script.async = true
  document.head.appendChild(script)
})
</script>
```

### Vue 2 Options API

```vue
<template>
  <div>
    <main>
      <h1>Welcome to our website</h1>
      <button @click="openChat">Need help?</button>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  mounted() {
    this.loadChatWidget()
  },
  methods: {
    loadChatWidget() {
      const script = document.createElement('script')
      script.src = 'https://your-domain.com/chatbot-widget.js'
      script.setAttribute('data-bot-id', 'your-bot-id')
      script.setAttribute('data-template', 'modern')
      script.async = true
      document.head.appendChild(script)
    },
    openChat() {
      if (window.ChatbotWidget) {
        window.ChatbotWidget.open()
      }
    }
  }
}
</script>
```

## Angular

### Component Integration

```typescript
// chat.component.ts
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-chat',
  template: `
    <div>
      <main>
        <h1>Welcome to our website</h1>
        <button (click)="openChat()">Need help?</button>
      </main>
    </div>
  `
})
export class ChatComponent implements OnInit {
  
  ngOnInit() {
    this.loadChatWidget()
  }

  loadChatWidget() {
    const script = document.createElement('script')
    script.src = 'https://your-domain.com/chatbot-widget.js'
    script.setAttribute('data-bot-id', 'your-bot-id')
    script.setAttribute('data-api-url', 'https://your-api.supabase.co/functions/v1')
    script.setAttribute('data-api-key', 'your-api-key')
    script.setAttribute('data-template', 'professional')
    script.async = true
    document.head.appendChild(script)
  }

  openChat() {
    if ((window as any).ChatbotWidget) {
      (window as any).ChatbotWidget.open()
    }
  }
}
```

### Service Integration

```typescript
// chat.service.ts
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private widgetLoaded = false

  loadWidget(config: {
    botId: string
    apiUrl: string
    apiKey: string
    template?: string
  }) {
    if (this.widgetLoaded) return

    const script = document.createElement('script')
    script.src = 'https://your-domain.com/chatbot-widget.js'
    script.setAttribute('data-bot-id', config.botId)
    script.setAttribute('data-api-url', config.apiUrl)
    script.setAttribute('data-api-key', config.apiKey)
    script.setAttribute('data-template', config.template || 'modern')
    script.async = true
    
    script.onload = () => {
      this.widgetLoaded = true
    }
    
    document.head.appendChild(script)
  }

  openChat() {
    if ((window as any).ChatbotWidget) {
      (window as any).ChatbotWidget.open()
    }
  }

  closeChat() {
    if ((window as any).ChatbotWidget) {
      (window as any).ChatbotWidget.close()
    }
  }
}
```

## Svelte

### Basic Integration

```svelte
<!-- Chat.svelte -->
<script>
  import { onMount } from 'svelte'
  
  let chatLoaded = false

  onMount(() => {
    loadChatWidget()
  })

  function loadChatWidget() {
    const script = document.createElement('script')
    script.src = 'https://your-domain.com/chatbot-widget.js'
    script.setAttribute('data-bot-id', 'your-bot-id')
    script.setAttribute('data-api-url', 'https://your-api.supabase.co/functions/v1')
    script.setAttribute('data-api-key', 'your-api-key')
    script.setAttribute('data-template', 'bubble')
    script.async = true
    
    script.onload = () => {
      chatLoaded = true
    }
    
    document.head.appendChild(script)
  }

  function openChat() {
    if (window.ChatbotWidget) {
      window.ChatbotWidget.open()
    }
  }
</script>

<main>
  <h1>Welcome to our website</h1>
  <button on:click={openChat} disabled={!chatLoaded}>
    {chatLoaded ? 'Need help?' : 'Loading chat...'}
  </button>
</main>
```

### SvelteKit Integration

```svelte
<!-- +page.svelte -->
<script>
  import { browser } from '$app/environment'
  import { onMount } from 'svelte'

  onMount(() => {
    if (browser) {
      loadChatWidget()
    }
  })

  function loadChatWidget() {
    const script = document.createElement('script')
    script.src = 'https://your-domain.com/chatbot-widget.js'
    script.setAttribute('data-bot-id', 'your-bot-id')
    script.setAttribute('data-template', 'elegant')
    script.async = true
    document.head.appendChild(script)
  }
</script>

<svelte:head>
  <title>Home Page</title>
</svelte:head>

<main>
  <h1>Welcome to SvelteKit</h1>
</main>
```

## WordPress

### Theme Integration

Add to your theme's `functions.php`:

```php
<?php
function add_chatbot_widget() {
    ?>
    <script 
      src="https://your-domain.com/chatbot-widget.js" 
      data-bot-id="your-bot-id"
      data-api-url="https://your-api.supabase.co/functions/v1"
      data-api-key="your-api-key"
      data-template="professional"
      data-theme="light"
      data-position="bottom-right"
      async>
    </script>
    <?php
}
add_action('wp_footer', 'add_chatbot_widget');
?>
```

### Plugin Integration

Create a simple plugin:

```php
<?php
/*
Plugin Name: AI Chatbot Widget
Description: Adds an AI chatbot to your website
Version: 1.0
*/

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AIChatbotWidget {
    
    public function __construct() {
        add_action('wp_footer', array($this, 'add_widget_script'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    public function add_widget_script() {
        $bot_id = get_option('chatbot_bot_id', '');
        $api_url = get_option('chatbot_api_url', '');
        $api_key = get_option('chatbot_api_key', '');
        $template = get_option('chatbot_template', 'modern');
        
        if (!empty($bot_id)) {
            ?>
            <script 
              src="https://your-domain.com/chatbot-widget.js" 
              data-bot-id="<?php echo esc_attr($bot_id); ?>"
              data-api-url="<?php echo esc_attr($api_url); ?>"
              data-api-key="<?php echo esc_attr($api_key); ?>"
              data-template="<?php echo esc_attr($template); ?>"
              async>
            </script>
            <?php
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Chatbot Settings',
            'Chatbot',
            'manage_options',
            'chatbot-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('chatbot_bot_id', sanitize_text_field($_POST['bot_id']));
            update_option('chatbot_api_url', sanitize_url($_POST['api_url']));
            update_option('chatbot_api_key', sanitize_text_field($_POST['api_key']));
            update_option('chatbot_template', sanitize_text_field($_POST['template']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $bot_id = get_option('chatbot_bot_id', '');
        $api_url = get_option('chatbot_api_url', '');
        $api_key = get_option('chatbot_api_key', '');
        $template = get_option('chatbot_template', 'modern');
        ?>
        <div class="wrap">
            <h1>Chatbot Settings</h1>
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">Bot ID</th>
                        <td><input type="text" name="bot_id" value="<?php echo esc_attr($bot_id); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">API URL</th>
                        <td><input type="url" name="api_url" value="<?php echo esc_attr($api_url); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">API Key</th>
                        <td><input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" /></td>
                    </tr>
                    <tr>
                        <th scope="row">Template</th>
                        <td>
                            <select name="template">
                                <option value="modern" <?php selected($template, 'modern'); ?>>Modern</option>
                                <option value="minimal" <?php selected($template, 'minimal'); ?>>Minimal</option>
                                <option value="bubble" <?php selected($template, 'bubble'); ?>>Bubble</option>
                                <option value="professional" <?php selected($template, 'professional'); ?>>Professional</option>
                                <option value="gaming" <?php selected($template, 'gaming'); ?>>Gaming</option>
                                <option value="elegant" <?php selected($template, 'elegant'); ?>>Elegant</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

new AIChatbotWidget();
?>
```

## Shopify

### Theme Liquid Template

Add to your theme's `theme.liquid` before the closing `</body>` tag:

```liquid
<!-- Chatbot Widget -->
<script 
  src="https://your-domain.com/chatbot-widget.js" 
  data-bot-id="{{ settings.chatbot_bot_id }}"
  data-api-url="{{ settings.chatbot_api_url }}"
  data-api-key="{{ settings.chatbot_api_key }}"
  data-template="{{ settings.chatbot_template | default: 'modern' }}"
  data-theme="light"
  data-position="bottom-right"
  data-bot-name="Shop Assistant"
  data-welcome-message="Hi! How can I help you find what you're looking for?"
  async>
</script>
```

### Settings Schema

Add to your theme's `settings_schema.json`:

```json
{
  "name": "Chatbot",
  "settings": [
    {
      "type": "text",
      "id": "chatbot_bot_id",
      "label": "Bot ID",
      "info": "Your chatbot ID from the dashboard"
    },
    {
      "type": "text",
      "id": "chatbot_api_url",
      "label": "API URL",
      "default": "https://your-api.supabase.co/functions/v1"
    },
    {
      "type": "text",
      "id": "chatbot_api_key",
      "label": "API Key"
    },
    {
      "type": "select",
      "id": "chatbot_template",
      "label": "Template Style",
      "options": [
        { "value": "modern", "label": "Modern" },
        { "value": "minimal", "label": "Minimal" },
        { "value": "bubble", "label": "Bubble" },
        { "value": "professional", "label": "Professional" },
        { "value": "gaming", "label": "Gaming" },
        { "value": "elegant", "label": "Elegant" }
      ],
      "default": "modern"
    }
  ]
}
```

## Vanilla JavaScript

### Simple Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <main>
        <h1>Welcome to our website</h1>
        <button id="open-chat">Need help?</button>
    </main>

    <!-- Chatbot Widget -->
    <script 
      src="https://your-domain.com/chatbot-widget.js" 
      data-bot-id="your-bot-id"
      data-api-url="https://your-api.supabase.co/functions/v1"
      data-api-key="your-api-key"
      data-template="modern"
      async>
    </script>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const openButton = document.getElementById('open-chat')
            
            openButton.addEventListener('click', function() {
                if (window.ChatbotWidget) {
                    window.ChatbotWidget.open()
                }
            })
            
            // Auto-open after 10 seconds
            setTimeout(() => {
                if (window.ChatbotWidget) {
                    window.ChatbotWidget.open()
                }
            }, 10000)
        })
    </script>
</body>
</html>
```

### Advanced Integration with Custom Events

```html
<script>
// Custom chatbot manager
class ChatbotManager {
    constructor(config) {
        this.config = config
        this.isLoaded = false
        this.loadWidget()
    }
    
    loadWidget() {
        const script = document.createElement('script')
        script.src = 'https://your-domain.com/chatbot-widget.js'
        
        Object.keys(this.config).forEach(key => {
            script.setAttribute(`data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, this.config[key])
        })
        
        script.async = true
        script.onload = () => {
            this.isLoaded = true
            this.dispatchEvent('chatbot:loaded')
        }
        
        document.head.appendChild(script)
    }
    
    open() {
        if (this.isLoaded && window.ChatbotWidget) {
            window.ChatbotWidget.open()
            this.dispatchEvent('chatbot:opened')
        }
    }
    
    close() {
        if (this.isLoaded && window.ChatbotWidget) {
            window.ChatbotWidget.close()
            this.dispatchEvent('chatbot:closed')
        }
    }
    
    sendMessage(message) {
        if (this.isLoaded && window.ChatbotWidget) {
            window.ChatbotWidget.sendMessage(message)
            this.dispatchEvent('chatbot:message-sent', { message })
        }
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail })
        document.dispatchEvent(event)
    }
}

// Initialize chatbot
const chatbot = new ChatbotManager({
    botId: 'your-bot-id',
    apiUrl: 'https://your-api.supabase.co/functions/v1',
    apiKey: 'your-api-key',
    template: 'modern',
    theme: 'light'
})

// Listen for events
document.addEventListener('chatbot:loaded', () => {
    console.log('Chatbot loaded successfully')
})

document.addEventListener('chatbot:opened', () => {
    console.log('Chatbot opened')
    // Track analytics
    gtag('event', 'chatbot_opened')
})

document.addEventListener('chatbot:message-sent', (e) => {
    console.log('Message sent:', e.detail.message)
    // Track analytics
    gtag('event', 'chatbot_message_sent')
})
</script>
```

## Framework-Agnostic Tips

### 1. Lazy Loading

```javascript
// Load chatbot only when needed
function loadChatbotWhenNeeded() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadChatWidget()
                observer.disconnect()
            }
        })
    })
    
    // Observe a trigger element
    const trigger = document.querySelector('.chat-trigger')
    if (trigger) {
        observer.observe(trigger)
    }
}
```

### 2. Error Handling

```javascript
function loadChatWidget() {
    const script = document.createElement('script')
    script.src = 'https://your-domain.com/chatbot-widget.js'
    script.async = true
    
    script.onerror = () => {
        console.error('Failed to load chatbot widget')
        // Fallback: show contact form or email
        showFallbackContact()
    }
    
    script.onload = () => {
        console.log('Chatbot widget loaded successfully')
    }
    
    document.head.appendChild(script)
}
```

### 3. Performance Optimization

```javascript
// Preload the script for faster loading
function preloadChatWidget() {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = 'https://your-domain.com/chatbot-widget.js'
    link.as = 'script'
    document.head.appendChild(link)
}

// Call on page load
document.addEventListener('DOMContentLoaded', preloadChatWidget)
```

This comprehensive guide should help you integrate the chatbot solution into any framework or platform you're using.
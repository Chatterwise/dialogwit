import React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { SEO } from "../../../components/SEO";

const WebsiteIntegrationPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Schema data for breadcrumbs
  const breadcrumbSchema = {
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Documentation",
        item: "https://chatterwise.io/documentation",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Integrations",
        item: "https://chatterwise.io/docs/integrations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Website Integration",
        item: "https://chatterwise.io/docs/integrations/website-integration",
      },
    ],
  };

  const scriptCode = `<!-- Add this script tag to your HTML -->
<script 
  src="https://cdn.chatterwise.io/widget.js" 
  data-bot-id="your-bot-id"
  data-api-key="your-api-key"
  data-theme="light"
  data-position="bottom-right"
  data-primary-color="#3B82F6"
  data-template="modern"
  async>
</script>`;

  const reactCode = `import { useChatbot } from './useChatbot';

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChatbot({
    botId: "your-bot-id",
    apiUrl: "https://api.chatterwise.io/v1",
    apiKey: "your-api-key",
  });

  const handleSend = (message) => {
    sendMessage(message);
  };

  return (
    <div className="chat-container">
      {/* Your custom chat UI here */}
      {messages.map((msg) => (
        <div key={msg.id} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
          {msg.text}
        </div>
      ))}
      <input 
        type="text" 
        placeholder="Type your message..." 
        onKeyPress={(e) => e.key === 'Enter' && handleSend(e.target.value)}
      />
    </div>
  );
}`;

  return (
    <>
      <SEO
        title="Website Integration | ChatterWise Documentation"
        description="Learn how to integrate your ChatterWise chatbot into your website using our JavaScript widget or React components."
        canonicalUrl="/docs/integrations/website-integration"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="chatbot website integration, embed chatbot, JavaScript widget, React chatbot, website chat widget, chatbot code snippet"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Integrations", href: "/docs/integrations" },
            {
              name: "Website Integration",
              href: "/docs/integrations/website-integration",
            },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Website Integration
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Integrating your ChatterWise chatbot into your website is simple
              and straightforward. We offer multiple integration options to suit
              your needs, from a simple JavaScript widget to a fully
              customizable React component.
            </p>

            <h2>Quick Integration with JavaScript Widget</h2>
            <p>
              The easiest way to add your chatbot to any website is using our
              JavaScript widget. Simply add a script tag to your HTML, and the
              chatbot will appear on your website.
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {scriptCode}
              </pre>
              <button
                onClick={() => copyToClipboard(scriptCode, "script")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "script" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <h3>Configuration Options</h3>
            <p>
              You can customize the appearance and behavior of the widget using
              data attributes:
            </p>

            <div className="not-prose">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 my-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Widget Attributes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Required Attributes
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-bot-id
                        </code>
                        : Your chatbot ID
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-api-key
                        </code>
                        : Your API key
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Optional Attributes
                    </h5>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-theme
                        </code>
                        : <code>light</code> or <code>dark</code>
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-position
                        </code>
                        : <code>bottom-right</code>, <code>bottom-left</code>,{" "}
                        <code>top-right</code>, <code>top-left</code>
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-primary-color
                        </code>
                        : Hex color code
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-template
                        </code>
                        : <code>modern</code>, <code>minimal</code>,{" "}
                        <code>bubble</code>, etc.
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-title
                        </code>
                        : Widget title
                      </li>
                      <li>
                        <code className="bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                          data-welcome-message
                        </code>
                        : Initial message
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h3>Widget API</h3>
            <p>
              The widget exposes a JavaScript API that you can use to control it
              programmatically:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`// Open the chat widget
ChatbotWidget.open();

// Close the chat widget
ChatbotWidget.close();

// Toggle the chat widget
ChatbotWidget.toggle();

// Send a message programmatically
ChatbotWidget.sendMessage("Hello!");

// Check if widget is open
console.log(ChatbotWidget.isOpen()); // true/false`}
            </pre>

            <h2>React Integration</h2>
            <p>
              For React applications, we offer a custom hook that gives you
              complete control over the chat interface:
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {reactCode}
              </pre>
              <button
                onClick={() => copyToClipboard(reactCode, "react")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "react" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <p>
              The <code>useChatbot</code> hook provides:
            </p>
            <ul>
              <li>Message history</li>
              <li>Loading states</li>
              <li>Error handling</li>
              <li>Message sending functionality</li>
            </ul>

            <p>
              You can download the hook from the{" "}
              <Link
                to="/integrations"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Integrations page
              </Link>{" "}
              or install it via npm:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              npm install @chatterwise/react
            </pre>

            <h2>Pre-built React Templates</h2>
            <p>
              If you prefer not to build your own UI, we offer pre-built React
              templates that you can use:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`import { ModernChat } from '@chatterwise/react';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <ModernChat
        botId="your-bot-id"
        apiKey="your-api-key"
        theme="light"
        position="bottom-right"
      />
    </div>
  );
}`}
            </pre>

            <p>Available templates include:</p>
            <ul>
              <li>
                <code>ModernChat</code>: A sleek, modern design with gradient
                accents
              </li>
              <li>
                <code>MinimalChat</code>: A clean, minimalist design
              </li>
              <li>
                <code>BubbleChat</code>: A playful design with bubble-style
                messages
              </li>
              <li>
                <code>ProfessionalChat</code>: A corporate-focused design
              </li>
              <li>And more...</li>
            </ul>

            <h2>Advanced Customization</h2>

            <h3>CSS Customization</h3>
            <p>
              You can customize the appearance of the widget using CSS
              variables:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`:root {
  --chatterwise-primary-color: #3B82F6;
  --chatterwise-text-color: #1F2937;
  --chatterwise-background-color: #FFFFFF;
  --chatterwise-border-radius: 12px;
  --chatterwise-font-family: 'Inter', sans-serif;
}`}
            </pre>

            <h3>Event Handling</h3>
            <p>You can listen for events from the widget:</p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`// Listen for widget open event
window.addEventListener('chatterwise:open', () => {
  console.log('Chat widget opened');
});

// Listen for new messages
window.addEventListener('chatterwise:message', (event) => {
  console.log('New message:', event.detail.message);
});

// Listen for widget close event
window.addEventListener('chatterwise:close', () => {
  console.log('Chat widget closed');
});`}
            </pre>

            <h2>Testing Your Integration</h2>
            <p>
              After adding the widget to your website, you should test it
              thoroughly:
            </p>
            <ol>
              <li>Verify that the widget appears correctly on your website</li>
              <li>Test on different devices and screen sizes</li>
              <li>
                Try asking various questions to ensure the chatbot responds
                correctly
              </li>
              <li>Check that the widget styling matches your brand</li>
            </ol>

            <h2>Troubleshooting</h2>
            <p>
              If you encounter issues with your integration, check the
              following:
            </p>
            <ul>
              <li>Ensure your bot ID and API key are correct</li>
              <li>Check for JavaScript errors in your browser's console</li>
              <li>Verify that the script is loading correctly</li>
              <li>Make sure your chatbot is active and has been trained</li>
            </ul>

            <p>
              If you continue to experience issues, please{" "}
              <Link
                to="/contact"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                contact our support team
              </Link>
              .
            </p>

            <h2>Next Steps</h2>
            <p>
              Now that you've integrated your chatbot into your website, you
              might want to explore other integration options:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/integrations/slack-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Slack Integration
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/integrations/discord-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Discord Integration
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/integrations/wordpress-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  WordPress Integration
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/getting-started/training-chatbot"
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous: Training Your Chatbot
            </Link>
            <Link
              to="/docs/integrations/slack-integration"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Slack Integration
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default WebsiteIntegrationPage;

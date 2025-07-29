import React, { useState } from "react";
import {
  MessageSquare,
  Globe,
  ShoppingCart,
  Users,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Download,
  Code,
  Webhook,
  Key,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import { motion } from "framer-motion";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  status: "available" | "connected" | "configured";
  category: "messaging" | "ecommerce" | "cms" | "automation";
  setupSteps: string[];
  codeExample?: string;
  webhookUrl?: string;
}

export const PlatformIntegrations = () => {
  const { user } = useAuth();
  const { data: chatbots = [] } = useChatbots(user?.id || "");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const integrations: Integration[] = [
    {
      id: "slack",
      name: "Slack",
      description: "Deploy your chatbot as a Slack app for team communication",
      icon: MessageSquare,
      status: "available",
      category: "messaging",
      setupSteps: [
        "Create a new Slack app in your workspace",
        "Configure bot permissions and scopes",
        "Install the app to your workspace",
        "Copy the webhook URL to your chatbot settings",
      ],
      codeExample: `// Slack Bot Configuration
{
  "bot_token": "xoxb-your-bot-token",
  "signing_secret": "your-signing-secret",
  "webhook_url": "${
    import.meta.env.VITE_SUPABASE_URL
  }/functions/v1/integrations/slack",
  "chatbot_id": "${selectedChatbot}"
}`,
      webhookUrl: `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/integrations/slack`,
    },
    {
      id: "wordpress",
      name: "WordPress",
      description: "Add chatbot to any WordPress site with shortcode",
      icon: Globe,
      status: "available",
      category: "cms",
      setupSteps: [
        "Install the ChatBot plugin from WordPress repository",
        "Enter your API key and chatbot ID",
        "Use shortcode [chatbot] or widget in your theme",
        "Customize appearance in plugin settings",
      ],
      codeExample: `<!-- WordPress Shortcode -->
[chatbot id="${selectedChatbot}" template="modern" theme="light"]

<!-- Or use PHP in your theme -->
<?php echo do_shortcode('[chatbot id="${selectedChatbot}"]'); ?>

<!-- Direct HTML integration -->
<script src="${import.meta.env.VITE_SUPABASE_URL}/widget/chatbot.js" 
        data-bot-id="${selectedChatbot}"
        data-api-url="${import.meta.env.VITE_SUPABASE_URL}/functions/v1"
        async></script>`,
    },
    {
      id: "shopify",
      name: "Shopify",
      description: "Integrate with Shopify stores for customer support",
      icon: ShoppingCart,
      status: "available",
      category: "ecommerce",
      setupSteps: [
        "Install the ChatBot app from Shopify App Store",
        "Connect your chatbot account",
        "Configure product recommendations and order tracking",
        "Customize the chat widget for your store theme",
      ],
      codeExample: `<!-- Shopify Liquid Template -->
{% comment %} Add to theme.liquid before </body> {% endcomment %}
<script src="${import.meta.env.VITE_SUPABASE_URL}/widget/shopify.js" 
        data-bot-id="${selectedChatbot}"
        data-shop="{{ shop.domain }}"
        data-customer-id="{% if customer %}{{ customer.id }}{% endif %}"
        async></script>

<!-- Product page integration -->
<div id="chatbot-product-support" 
     data-product-id="{{ product.id }}"
     data-product-title="{{ product.title }}">
</div>`,
    },
    {
      id: "discord",
      name: "Discord",
      description: "Deploy as a Discord bot for community servers",
      icon: Users,
      status: "available",
      category: "messaging",
      setupSteps: [
        "Create a Discord application and bot",
        "Copy the bot token and application ID",
        "Invite the bot to your server with proper permissions",
        "Configure the webhook URL in Discord settings",
      ],
      codeExample: `// Discord Bot Configuration
{
  "application_id": "your-application-id",
  "bot_token": "your-bot-token",
  "webhook_url": "${
    import.meta.env.VITE_SUPABASE_URL
  }/functions/v1/integrations/discord",
  "chatbot_id": "${selectedChatbot}",
  "guild_id": "your-server-id"
}`,
      webhookUrl: `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/integrations/discord`,
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Connect with Microsoft Teams for enterprise communication",
      icon: MessageSquare,
      status: "available",
      category: "messaging",
      setupSteps: [
        "Register your app in Azure Active Directory",
        "Configure Teams app manifest",
        "Upload and install the app in Teams",
        "Set up the messaging endpoint",
      ],
      codeExample: `// Teams App Manifest
{
  "bots": [{
    "botId": "your-bot-id",
    "scopes": ["personal", "team"],
    "commandLists": [{
      "scopes": ["personal", "team"],
      "commands": [{
        "title": "Help",
        "description": "Get help from the AI assistant"
      }]
    }]
  }],
  "webApplicationInfo": {
    "id": "your-app-id",
    "resource": "${
      import.meta.env.VITE_SUPABASE_URL
    }/functions/v1/integrations/teams"
  }
}`,
      webhookUrl: `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/integrations/teams`,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier automation",
      icon: Zap,
      status: "available",
      category: "automation",
      setupSteps: [
        "Create a new Zap in your Zapier account",
        'Choose "Webhooks by Zapier" as the trigger',
        "Use the provided webhook URL",
        "Configure your desired actions and filters",
      ],
      codeExample: `// Zapier Webhook Configuration
{
  "webhook_url": "${
    import.meta.env.VITE_SUPABASE_URL
  }/functions/v1/integrations/zapier",
  "chatbot_id": "${selectedChatbot}",
  "trigger_events": ["message_received", "conversation_started"],
  "filters": {
    "min_confidence": 0.8,
    "keywords": ["support", "help", "issue"]
  }
}`,
      webhookUrl: `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/integrations/zapier`,
    },
  ];

  const categories = [
    { id: "all", name: "All Integrations", count: integrations.length },
    {
      id: "messaging",
      name: "Messaging",
      count: integrations.filter((i) => i.category === "messaging").length,
    },
    {
      id: "ecommerce",
      name: "E-commerce",
      count: integrations.filter((i) => i.category === "ecommerce").length,
    },
    {
      id: "cms",
      name: "CMS",
      count: integrations.filter((i) => i.category === "cms").length,
    },
    {
      id: "automation",
      name: "Automation",
      count: integrations.filter((i) => i.category === "automation").length,
    },
  ];

  const filteredIntegrations =
    activeCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "configured":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "configured":
        return "Configured";
      default:
        return "Available";
    }
  };

  const selectedIntegrationData = integrations.find(
    (i) => i.id === selectedIntegration
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 mt-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
            Platform Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your chatbots with popular platforms and services.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedChatbot}
            onChange={(e) => setSelectedChatbot(e.target.value)}
            className="py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          >
            <option value="">Select Chatbot</option>
            {chatbots
              .filter((bot) => bot.status === "ready")
              .map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {category.name} ({category.count})
          </motion.button>
        ))}
      </div>

      {/* No Chatbot Selected Warning */}
      {!selectedChatbot && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                No Chatbot Selected
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Select a chatbot from the dropdown above to configure
                integrations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => setSelectedIntegration(integration.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-3">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {integration.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        integration.status
                      )}`}
                    >
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {integration.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    integration.category === "messaging"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                      : integration.category === "ecommerce"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : integration.category === "cms"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                  }`}
                >
                  {integration.category}
                </span>
                <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Integration Details Modal */}
      {selectedIntegration && selectedIntegrationData && (
        <div className="fixed inset-0 bg-gray-800/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4">
                    <selectedIntegrationData.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedIntegrationData.name} Integration
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedIntegrationData.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="p-2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Setup Steps */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Setup Instructions
                </h4>
                <div className="space-y-3">
                  {selectedIntegrationData.setupSteps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Webhook URL */}
              {selectedIntegrationData.webhookUrl && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Webhook URL
                  </h4>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={selectedIntegrationData.webhookUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-sm text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedIntegrationData.webhookUrl!,
                          `webhook-${selectedIntegrationData.id}`
                        )
                      }
                      className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {copiedCode ===
                      `webhook-${selectedIntegrationData.id}` ? (
                        <Check className="h-4 w-4 text-green-500 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Code Example */}
              {selectedIntegrationData.codeExample && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Configuration Example
                    </h4>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedIntegrationData.codeExample!,
                          `code-${selectedIntegrationData.id}`
                        )
                      }
                      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded"
                    >
                      {copiedCode === `code-${selectedIntegrationData.id}` ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      {copiedCode === `code-${selectedIntegrationData.id}`
                        ? "Copied!"
                        : "Copy"}
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-100 font-mono overflow-x-auto">
                    <pre>{selectedIntegrationData.codeExample}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <div className="flex space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Guide
                  </button>
                  <button
                    disabled={!selectedChatbot}
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Integration
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Integration Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-primary-100 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-200">
              Integration Overview
            </h3>
            <p className="text-primary-700 dark:text-primary-300">
              Connect your chatbots across multiple platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {integrations.length}
              </div>
              <div className="text-sm text-primary-700 dark:text-primary-300">
                Available
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {integrations.filter((i) => i.status === "connected").length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Connected
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {categories.length - 1}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Categories
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                24/7
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Support
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Need Help with Integrations?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Code className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Developer Docs
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete integration guides and API documentation
            </p>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Webhook className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Webhook Testing
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test your webhooks and troubleshoot issues
            </p>
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#"
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Key className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                API Keys
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your API keys and authentication
            </p>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
};

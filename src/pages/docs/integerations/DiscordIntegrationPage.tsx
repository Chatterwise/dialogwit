import React from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { SEO } from "../../../components/SEO";

const DiscordIntegrationPage: React.FC = () => {
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
        name: "Discord Integration",
        item: "https://chatterwise.io/docs/integrations/discord-integration",
      },
    ],
  };

  const discordConfigCode = `// Discord Bot Configuration
{
  "application_id": "your-application-id",
  "bot_token": "your-bot-token",
  "webhook_url": "https://api.chatterwise.io/v1/integrations/discord",
  "chatbot_id": "your-chatbot-id",
  "guild_id": "your-server-id"
}`;

  return (
    <>
      <SEO
        title="Discord Integration | ChatterWise Documentation"
        description="Learn how to integrate your ChatterWise chatbot with Discord. Step-by-step guide to deploy your AI chatbot as a Discord bot for community servers."
        canonicalUrl="/docs/integrations/discord-integration"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="Discord integration, Discord chatbot, AI Discord bot, ChatterWise Discord, community server bot, Discord app integration"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Integrations", href: "/docs/integrations" },
            {
              name: "Discord Integration",
              href: "/docs/integrations/discord-integration",
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
            Discord Integration
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Integrating your ChatterWise chatbot with Discord allows your
              community to interact with your chatbot directly within your
              Discord server. This guide will walk you through the process of
              setting up a Discord bot for your chatbot.
            </p>

            <h2>Prerequisites</h2>
            <p>Before you begin, make sure you have:</p>
            <ul>
              <li>A ChatterWise account with at least one trained chatbot</li>
              <li>Admin access to a Discord server</li>
              <li>
                A Discord account with two-factor authentication enabled
                (required for creating bots)
              </li>
            </ul>

            <h2>Step 1: Create a Discord Application</h2>
            <p>First, you'll need to create a new Discord application:</p>
            <ol>
              <li>
                Go to the{" "}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Discord Developer Portal
                </a>
              </li>
              <li>Click "New Application"</li>
              <li>
                Enter a name for your application (e.g., "ChatterWise
                Assistant")
              </li>
              <li>Accept the terms of service and click "Create"</li>
            </ol>

            <h2>Step 2: Create a Bot User</h2>
            <p>Next, you'll need to create a bot user for your application:</p>
            <ol>
              <li>In the left sidebar, click on "Bot"</li>
              <li>Click "Add Bot"</li>
              <li>Confirm by clicking "Yes, do it!"</li>
              <li>
                Under the "TOKEN" section, click "Reset Token" and copy the
                token that appears (you'll need this later)
              </li>
              <li>
                Under "Privileged Gateway Intents", enable:
                <ul>
                  <li>Presence Intent</li>
                  <li>Server Members Intent</li>
                  <li>Message Content Intent</li>
                </ul>
              </li>
              <li>Save your changes</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Security Note
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 mb-0">
                Keep your bot token secure! Anyone with your token can control
                your bot. Never share it publicly or commit it to version
                control.
              </p>
            </div>

            <h2>Step 3: Configure Bot Permissions</h2>
            <p>Now, you'll need to configure the bot permissions:</p>
            <ol>
              <li>In the left sidebar, click on "OAuth2"</li>
              <li>Click on "URL Generator"</li>
              <li>Under "Scopes", select "bot" and "applications.commands"</li>
              <li>
                Under "Bot Permissions", select:
                <ul>
                  <li>Read Messages/View Channels</li>
                  <li>Send Messages</li>
                  <li>Embed Links</li>
                  <li>Attach Files</li>
                  <li>Read Message History</li>
                  <li>Add Reactions</li>
                </ul>
              </li>
              <li>Copy the generated URL at the bottom of the page</li>
            </ol>

            <h2>Step 4: Invite the Bot to Your Server</h2>
            <p>
              Use the URL you copied to invite the bot to your Discord server:
            </p>
            <ol>
              <li>Paste the URL into your browser</li>
              <li>Select the server where you want to add the bot</li>
              <li>Click "Authorize"</li>
              <li>Complete the CAPTCHA if prompted</li>
            </ol>

            <p>
              Your bot should now appear in your server's member list, but it
              will be offline until we complete the integration with
              ChatterWise.
            </p>

            <h2>Step 5: Configure ChatterWise Integration</h2>
            <p>
              Now, you'll need to configure the Discord integration in
              ChatterWise:
            </p>
            <ol>
              <li>Log in to your ChatterWise account</li>
              <li>Navigate to the "Integrations" page</li>
              <li>Click on "Discord"</li>
              <li>
                Enter the following information:
                <ul>
                  <li>
                    <strong>Application ID:</strong> Found in the "General
                    Information" section of your Discord application
                  </li>
                  <li>
                    <strong>Bot Token:</strong> The token you copied earlier
                  </li>
                  <li>
                    <strong>Server ID (Guild ID):</strong> Right-click on your
                    server in Discord and select "Copy ID" (you need to enable
                    Developer Mode in Discord settings to see this option)
                  </li>
                  <li>
                    <strong>Chatbot:</strong> Select the chatbot you want to
                    connect to Discord
                  </li>
                </ul>
              </li>
              <li>Click "Save Configuration"</li>
            </ol>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {discordConfigCode}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(discordConfigCode, "discord-config")
                }
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "discord-config" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <h2>Step 6: Test Your Discord Bot</h2>
            <p>
              Once the integration is set up, you can test your chatbot in
              Discord:
            </p>
            <ol>
              <li>Open your Discord server</li>
              <li>
                Send a direct message to your bot or mention it in a channel
              </li>
              <li>The bot should respond based on its training</li>
            </ol>

            <p>You can mention your bot in channels using the @ symbol:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
              @ChatterWise Assistant How do I reset my password?
            </pre>

            <h2>Advanced Configuration</h2>

            <h3>Command Prefix</h3>
            <p>
              You can configure a command prefix for your bot, allowing users to
              interact with it using commands:
            </p>
            <ol>
              <li>In ChatterWise, go to your chatbot's settings</li>
              <li>Navigate to the "Integrations" tab</li>
              <li>Find the Discord integration section</li>
              <li>Set the "Command Prefix" field (e.g., "!")</li>
              <li>Save your changes</li>
            </ol>

            <h3>Channel Restrictions</h3>
            <p>You can restrict your bot to specific channels:</p>
            <ol>
              <li>In ChatterWise, go to your chatbot's settings</li>
              <li>Navigate to the "Integrations" tab</li>
              <li>Find the Discord integration section</li>
              <li>
                Add channel IDs to the "Allowed Channels" field
                (comma-separated)
              </li>
              <li>Save your changes</li>
            </ol>

            <h3>Response Formatting</h3>
            <p>ChatterWise supports Discord's message formatting, including:</p>
            <ul>
              <li>
                Bold text: <code>**bold**</code>
              </li>
              <li>
                Italic text: <code>*italic*</code>
              </li>
              <li>
                Code blocks: <code>```code```</code>
              </li>
              <li>
                Inline code: <code>`code`</code>
              </li>
              <li>
                Strikethrough: <code>~~strikethrough~~</code>
              </li>
            </ul>

            <p>
              You can enable or disable formatting in your chatbot's settings.
            </p>

            <h2>Troubleshooting</h2>

            <h3>Bot Not Responding</h3>
            <p>If your bot isn't responding, check the following:</p>
            <ul>
              <li>Verify that your Application ID and Bot Token are correct</li>
              <li>Ensure that your chatbot is active in ChatterWise</li>
              <li>
                Check that the bot has the necessary permissions in your Discord
                server
              </li>
              <li>
                Verify that the Message Content Intent is enabled in your
                Discord application
              </li>
            </ul>

            <h3>Error Messages</h3>
            <p>Common error messages and their solutions:</p>
            <ul>
              <li>
                <strong>"Invalid token":</strong> Your Bot Token is incorrect or
                has been revoked. Generate a new token in the Discord Developer
                Portal.
              </li>
              <li>
                <strong>"Missing Access":</strong> The bot doesn't have the
                necessary permissions. Check the bot's role and permissions in
                your Discord server.
              </li>
              <li>
                <strong>"Cannot send messages to this user":</strong> The user
                has disabled direct messages from server members. They need to
                enable this setting in their Discord privacy settings.
              </li>
            </ul>

            <h2>Next Steps</h2>
            <p>
              Now that you've integrated your chatbot with Discord, you might
              want to explore other integration options:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/integrations/wordpress-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  WordPress Integration
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/advanced-features/webhooks"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Webhooks
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/integrations/slack-integration"
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
              Previous: Slack Integration
            </Link>
            <Link
              to="/docs/integrations/wordpress-integration"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: WordPress Integration
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

export default DiscordIntegrationPage;

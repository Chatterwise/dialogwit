import React from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { SEO } from "../../../components/SEO";

const SlackIntegrationPage: React.FC = () => {
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
        name: "Slack Integration",
        item: "https://chatterwise.io/docs/integrations/slack-integration",
      },
    ],
  };

  const slackConfigCode = `// Slack Bot Configuration
{
  "bot_token": "xoxb-your-bot-token",
  "signing_secret": "your-signing-secret",
  "webhook_url": "https://api.chatterwise.io/v1/integrations/slack",
  "chatbot_id": "your-chatbot-id"
}`;

  return (
    <>
      <SEO
        title="Slack Integration | ChatterWise Documentation"
        description="Learn how to integrate your ChatterWise chatbot with Slack. Step-by-step guide to deploy your AI chatbot as a Slack app for team communication."
        canonicalUrl="/docs/integrations/slack-integration"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="Slack integration, Slack chatbot, AI Slack bot, ChatterWise Slack, team communication bot, Slack app integration"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Integrations", href: "/docs/integrations" },
            {
              name: "Slack Integration",
              href: "/docs/integrations/slack-integration",
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
            Slack Integration
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Integrating your ChatterWise chatbot with Slack allows your team
              to interact with your chatbot directly within your Slack
              workspace. This guide will walk you through the process of setting
              up a Slack app for your chatbot.
            </p>

            <h2>Prerequisites</h2>
            <p>Before you begin, make sure you have:</p>
            <ul>
              <li>A ChatterWise account with at least one trained chatbot</li>
              <li>Admin access to a Slack workspace</li>
            </ul>

            <h2>Step 1: Create a Slack App</h2>
            <p>First, you'll need to create a new Slack app:</p>
            <ol>
              <li>
                Go to the{" "}
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Slack API website
                </a>
              </li>
              <li>Click "Create New App"</li>
              <li>Choose "From scratch"</li>
              <li>Enter a name for your app (e.g., "ChatterWise Assistant")</li>
              <li>Select the workspace where you want to install the app</li>
              <li>Click "Create App"</li>
            </ol>

            <h2>Step 2: Configure Bot Permissions</h2>
            <p>Next, you'll need to configure the bot permissions:</p>
            <ol>
              <li>In the left sidebar, click on "OAuth & Permissions"</li>
              <li>
                Scroll down to "Scopes" and add the following Bot Token Scopes:
                <ul>
                  <li>
                    <code>app_mentions:read</code> - Allow the bot to see when
                    it's mentioned
                  </li>
                  <li>
                    <code>chat:write</code> - Allow the bot to send messages
                  </li>
                  <li>
                    <code>im:history</code> - Allow the bot to view message
                    history in direct messages
                  </li>
                  <li>
                    <code>im:read</code> - Allow the bot to read direct messages
                  </li>
                  <li>
                    <code>im:write</code> - Allow the bot to send direct
                    messages
                  </li>
                </ul>
              </li>
              <li>Click "Save Changes"</li>
            </ol>

            <h2>Step 3: Enable Event Subscriptions</h2>
            <p>Now, you'll need to enable event subscriptions:</p>
            <ol>
              <li>In the left sidebar, click on "Event Subscriptions"</li>
              <li>Toggle "Enable Events" to On</li>
              <li>
                In the "Request URL" field, enter your ChatterWise Slack
                integration webhook URL:
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                  https://api.chatterwise.io/v1/integrations/slack
                </pre>
              </li>
              <li>
                Under "Subscribe to bot events", add the following events:
                <ul>
                  <li>
                    <code>app_mention</code> - When the bot is mentioned
                  </li>
                  <li>
                    <code>message.im</code> - When a message is sent in a direct
                    message
                  </li>
                </ul>
              </li>
              <li>Click "Save Changes"</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Verification Process
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 mb-0">
                Slack will verify your Request URL by sending a challenge
                request. ChatterWise automatically handles this verification
                process. If the verification fails, double-check your webhook
                URL and ensure your ChatterWise account is active.
              </p>
            </div>

            <h2>Step 4: Install the App to Your Workspace</h2>
            <p>
              After configuring your app, you need to install it to your
              workspace:
            </p>
            <ol>
              <li>In the left sidebar, click on "OAuth & Permissions"</li>
              <li>Click "Install to Workspace"</li>
              <li>Review the permissions and click "Allow"</li>
            </ol>

            <p>
              After installation, you'll see a "Bot User OAuth Token" that
              starts with <code>xoxb-</code>. Copy this token as you'll need it
              in the next step.
            </p>

            <h2>Step 5: Configure ChatterWise Integration</h2>
            <p>
              Now, you'll need to configure the Slack integration in
              ChatterWise:
            </p>
            <ol>
              <li>Log in to your ChatterWise account</li>
              <li>Navigate to the "Integrations" page</li>
              <li>Click on "Slack"</li>
              <li>
                Enter the following information:
                <ul>
                  <li>
                    <strong>Bot Token:</strong> The Bot User OAuth Token you
                    copied (starts with <code>xoxb-</code>)
                  </li>
                  <li>
                    <strong>Signing Secret:</strong> Found in the "Basic
                    Information" section of your Slack app
                  </li>
                  <li>
                    <strong>Chatbot:</strong> Select the chatbot you want to
                    connect to Slack
                  </li>
                </ul>
              </li>
              <li>Click "Save Configuration"</li>
            </ol>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {slackConfigCode}
              </pre>
              <button
                onClick={() => copyToClipboard(slackConfigCode, "slack-config")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "slack-config" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <h2>Step 6: Test Your Slack Bot</h2>
            <p>
              Once the integration is set up, you can test your chatbot in
              Slack:
            </p>
            <ol>
              <li>Open your Slack workspace</li>
              <li>Find your bot in the Apps section or direct messages</li>
              <li>Send a message to your bot</li>
              <li>The bot should respond based on its training</li>
            </ol>

            <p>
              You can also mention your bot in channels where it's been added:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
              @ChatterWise Assistant How do I reset my password?
            </pre>

            <h2>Advanced Configuration</h2>

            <h3>Custom Welcome Message</h3>
            <p>
              You can customize the welcome message that your bot sends when a
              user starts a conversation:
            </p>
            <ol>
              <li>In ChatterWise, go to your chatbot's settings</li>
              <li>Navigate to the "Integrations" tab</li>
              <li>Find the Slack integration section</li>
              <li>Update the "Welcome Message" field</li>
              <li>Save your changes</li>
            </ol>

            <h3>Channel Restrictions</h3>
            <p>You can restrict your bot to specific channels:</p>
            <ol>
              <li>In ChatterWise, go to your chatbot's settings</li>
              <li>Navigate to the "Integrations" tab</li>
              <li>Find the Slack integration section</li>
              <li>
                Add channel IDs to the "Allowed Channels" field
                (comma-separated)
              </li>
              <li>Save your changes</li>
            </ol>

            <h3>Response Formatting</h3>
            <p>ChatterWise supports Slack's message formatting, including:</p>
            <ul>
              <li>
                Bold text: <code>*bold*</code>
              </li>
              <li>
                Italic text: <code>_italic_</code>
              </li>
              <li>
                Code blocks: <code>```code```</code>
              </li>
              <li>
                Bulleted lists: <code>• item</code>
              </li>
              <li>
                Links: <code>&lt;https://example.com|Link Text&gt;</code>
              </li>
            </ul>

            <p>
              You can enable or disable formatting in your chatbot's settings.
            </p>

            <h2>Troubleshooting</h2>

            <h3>Bot Not Responding</h3>
            <p>If your bot isn't responding, check the following:</p>
            <ul>
              <li>Verify that your Bot Token and Signing Secret are correct</li>
              <li>Ensure that your chatbot is active in ChatterWise</li>
              <li>
                Check that the bot has been invited to the channel (for channel
                interactions)
              </li>
              <li>Verify that the necessary event subscriptions are enabled</li>
            </ul>

            <h3>Error Messages</h3>
            <p>Common error messages and their solutions:</p>
            <ul>
              <li>
                <strong>"Invalid token":</strong> Your Bot Token is incorrect or
                has been revoked. Generate a new token in Slack.
              </li>
              <li>
                <strong>"Request URL verification failed":</strong> Your Signing
                Secret is incorrect. Double-check it in your Slack app settings.
              </li>
              <li>
                <strong>"Channel not found":</strong> The bot hasn't been
                invited to the channel. Invite the bot using{" "}
                <code>/invite @YourBotName</code>.
              </li>
            </ul>

            <h2>Next Steps</h2>
            <p>
              Now that you've integrated your chatbot with Slack, you might want
              to explore other integration options:
            </p>

            <ul>
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
              to="/docs/integrations/website-integration"
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
              Previous: Website Integration
            </Link>
            <Link
              to="/docs/integrations/discord-integration"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Discord Integration
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

export default SlackIntegrationPage;

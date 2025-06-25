import React from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { useState } from "react";

const WebhooksPage: React.FC = () => {
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
        item: "https://chatterwise.ai/documentation",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Advanced Features",
        item: "https://chatterwise.ai/docs/advanced-features",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Webhooks",
        item: "https://chatterwise.ai/docs/advanced-features/webhooks",
      },
    ],
  };

  const webhookPayloadExample = `{
  "event_type": "message_received",
  "timestamp": "2025-06-20T15:30:45Z",
  "chatbot_id": "cb_123456789",
  "data": {
    "message_id": "msg_987654321",
    "user_message": "How do I reset my password?",
    "bot_response": "To reset your password, please go to the login page and click on the 'Forgot Password' link. You'll receive an email with instructions to create a new password.",
    "user_id": "user_123456",
    "user_ip": "192.168.1.1",
    "metadata": {
      "source": "website",
      "page_url": "https://example.com/support"
    }
  }
}`;

  const webhookVerificationCode = `const crypto = require('crypto');

// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

// Example Express.js route handler
app.post('/webhook', (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-chatterwise-signature'];
  const webhookSecret = process.env.CHATTERWISE_WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook event
  const event = req.body;
  console.log('Received webhook event:', event.event_type);
  
  // Handle different event types
  switch (event.event_type) {
    case 'message_received':
      // Process new message
      break;
    case 'conversation_started':
      // Handle new conversation
      break;
    // Handle other event types...
  }
  
  res.status(200).send('Webhook received');
});`;

  return (
    <>
      <SEO
        title="Webhooks | ChatterWise Documentation"
        description="Learn how to use webhooks to integrate ChatterWise with your existing systems. Receive real-time notifications for chatbot events and automate workflows."
        canonicalUrl="/docs/advanced-features/webhooks"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="webhooks, chatbot webhooks, event notifications, real-time integration, ChatterWise API, webhook security"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[
            { name: "Advanced Features", href: "/docs/advanced-features" },
            { name: "Webhooks", href: "/docs/advanced-features/webhooks" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Webhooks
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Webhooks allow you to receive real-time notifications when
              specific events occur in your ChatterWise chatbots. This enables
              you to integrate your chatbots with your existing systems and
              automate workflows based on chatbot interactions.
            </p>

            <h2>What are Webhooks?</h2>
            <p>
              Webhooks are HTTP callbacks that are triggered by specific events
              in your ChatterWise account. When an event occurs, ChatterWise
              sends an HTTP POST request to the URL you've configured,
              containing data about the event.
            </p>

            <p>For example, you might want to:</p>
            <ul>
              <li>Log all chatbot conversations in your CRM</li>
              <li>Create support tickets when users ask specific questions</li>
              <li>
                Send notifications to your team when a new conversation starts
              </li>
              <li>Trigger custom workflows based on user interactions</li>
            </ul>

            <h2>Setting Up Webhooks</h2>

            <h3>Step 1: Create a Webhook Endpoint</h3>
            <p>
              First, you need to create an endpoint on your server that can
              receive webhook requests. This endpoint should:
            </p>
            <ul>
              <li>Accept HTTP POST requests</li>
              <li>Parse JSON payloads</li>
              <li>Verify the webhook signature (for security)</li>
              <li>Return a 200 OK response quickly (to acknowledge receipt)</li>
            </ul>

            <h3>Step 2: Configure the Webhook in ChatterWise</h3>
            <p>To set up a webhook in ChatterWise:</p>
            <ol>
              <li>Log in to your ChatterWise account</li>
              <li>Navigate to the "Integrations" page</li>
              <li>Click on "Webhooks"</li>
              <li>Click "Create Webhook"</li>
              <li>
                Enter the following information:
                <ul>
                  <li>
                    <strong>Name:</strong> A descriptive name for your webhook
                  </li>
                  <li>
                    <strong>URL:</strong> The endpoint URL where webhook events
                    should be sent
                  </li>
                  <li>
                    <strong>Events:</strong> Select the events you want to
                    receive notifications for
                  </li>
                  <li>
                    <strong>Secret:</strong> Create a secret key for signature
                    verification (optional but recommended)
                  </li>
                  <li>
                    <strong>Chatbot:</strong> Select a specific chatbot or leave
                    blank for all chatbots
                  </li>
                </ul>
              </li>
              <li>Click "Create Webhook"</li>
            </ol>

            <h2>Webhook Events</h2>
            <p>ChatterWise supports the following webhook events:</p>

            <div className="not-prose">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 my-8">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Available Events
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      message_received
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a user sends a message to the chatbot
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      conversation_started
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a new conversation begins
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      conversation_ended
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a conversation ends (after inactivity)
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      feedback_received
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a user provides feedback on a response
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      chatbot_created
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a new chatbot is created
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      chatbot_updated
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when a chatbot's settings are updated
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      knowledge_base_updated
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when content is added to or removed from a
                      knowledge base
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      error_occurred
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered when an error occurs during chatbot operation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2>Webhook Payload</h2>
            <p>
              When an event occurs, ChatterWise sends a JSON payload to your
              webhook URL. The payload structure depends on the event type, but
              all payloads include common fields:
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {webhookPayloadExample}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(webhookPayloadExample, "payload")
                }
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "payload" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <h2>Webhook Security</h2>
            <p>
              To ensure that webhook requests are coming from ChatterWise and
              haven't been tampered with, we include a signature in the{" "}
              <code>X-ChatterWise-Signature</code> header of each request. You
              should verify this signature before processing the webhook.
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {webhookVerificationCode}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(webhookVerificationCode, "verification")
                }
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "verification" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Security Best Practices
              </h3>
              <ul className="space-y-2 text-yellow-700 dark:text-yellow-400 mb-0">
                <li>
                  Always verify the webhook signature to ensure the request is
                  legitimate
                </li>
                <li>
                  Keep your webhook secret secure and don't expose it in
                  client-side code
                </li>
                <li>
                  Use HTTPS for your webhook endpoint to encrypt data in transit
                </li>
                <li>Implement rate limiting to protect against abuse</li>
                <li>
                  Process webhooks asynchronously and respond quickly to avoid
                  timeouts
                </li>
              </ul>
            </div>

            <h2>Testing Webhooks</h2>
            <p>
              ChatterWise provides a way to test your webhooks without
              triggering actual events:
            </p>
            <ol>
              <li>Go to the "Webhooks" page in your ChatterWise account</li>
              <li>Find the webhook you want to test</li>
              <li>Click the "Test" button</li>
              <li>Select an event type to simulate</li>
              <li>Click "Send Test Event"</li>
            </ol>

            <p>
              This will send a test payload to your webhook endpoint, allowing
              you to verify that it's working correctly.
            </p>

            <h2>Webhook Logs</h2>
            <p>
              ChatterWise keeps logs of all webhook deliveries, which can be
              useful for debugging:
            </p>
            <ol>
              <li>Go to the "Webhooks" page in your ChatterWise account</li>
              <li>Find the webhook you want to check</li>
              <li>Click "View Logs"</li>
            </ol>

            <p>The logs show:</p>
            <ul>
              <li>The timestamp of each delivery attempt</li>
              <li>The event type</li>
              <li>The HTTP status code returned by your endpoint</li>
              <li>Any error messages</li>
            </ul>

            <h2>Webhook Retries</h2>
            <p>
              If your webhook endpoint returns a non-2xx status code or times
              out, ChatterWise will retry the delivery with an exponential
              backoff:
            </p>
            <ul>
              <li>1st retry: 5 seconds after the initial failure</li>
              <li>2nd retry: 30 seconds after the 1st retry</li>
              <li>3rd retry: 2 minutes after the 2nd retry</li>
              <li>4th retry: 10 minutes after the 3rd retry</li>
              <li>5th retry: 30 minutes after the 4th retry</li>
            </ul>

            <p>
              After 5 failed attempts, the webhook delivery will be marked as
              failed.
            </p>

            <h2>Common Use Cases</h2>

            <h3>CRM Integration</h3>
            <p>
              Use webhooks to automatically create or update customer records in
              your CRM when users interact with your chatbot:
            </p>
            <ol>
              <li>
                Set up a webhook for the <code>conversation_started</code> event
              </li>
              <li>
                When a new conversation starts, create a new lead in your CRM
              </li>
              <li>
                Use the <code>message_received</code> event to update the lead
                with conversation details
              </li>
            </ol>

            <h3>Support Ticket Creation</h3>
            <p>
              Automatically create support tickets when your chatbot can't
              resolve a user's issue:
            </p>
            <ol>
              <li>
                Set up a webhook for the <code>feedback_received</code> event
              </li>
              <li>
                When a user provides negative feedback, create a support ticket
              </li>
              <li>
                Include the conversation history in the ticket for context
              </li>
            </ol>

            <h3>Analytics and Reporting</h3>
            <p>Send chatbot interaction data to your analytics platform:</p>
            <ol>
              <li>
                Set up webhooks for various events (
                <code>message_received</code>, <code>conversation_started</code>
                , etc.)
              </li>
              <li>Process the webhook payloads and extract relevant metrics</li>
              <li>Send the data to your analytics platform</li>
              <li>
                Create dashboards and reports to track chatbot performance
              </li>
            </ol>

            <h2>Next Steps</h2>
            <p>
              Now that you understand how to use webhooks, you might want to
              explore:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/advanced-features/security-best-practices"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Security Best Practices
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/api-reference"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/advanced-features/custom-templates"
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
              Previous: Custom Templates
            </Link>
            <Link
              to="/docs/advanced-features/security-best-practices"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Security Best Practices
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

export default WebhooksPage;

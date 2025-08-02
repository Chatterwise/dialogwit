import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { ScrollToTop } from "../../../components/utils/ScrollToTop";

const CustomerSupportBotPage: React.FC = () => {
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
        name: "Tutorials",
        item: "https://chatterwise.io/docs/tutorials",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Building a Customer Support Bot",
        item: "https://chatterwise.io/docs/tutorials/customer-support-bot",
      },
    ],
  };

  return (
    <>
      <SEO
        title="Building a Customer Support Bot | ChatterWise Documentation"
        description="Learn how to build an effective customer support chatbot with ChatterWise. This step-by-step tutorial covers knowledge base setup, training, and integration with your support systems."
        canonicalUrl="/docs/tutorials/customer-support-bot"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="customer support chatbot, support bot tutorial, AI customer service, help desk automation, ChatterWise tutorial, FAQ chatbot"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Tutorials", href: "/docs/tutorials" },
            {
              name: "Building a Customer Support Bot",
              href: "/docs/tutorials/customer-support-bot",
            },
          ]}
        />
        <ScrollToTop />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Building a Customer Support Bot
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Customer support is one of the most popular use cases for AI
              chatbots. A well-designed support bot can handle common questions,
              troubleshoot issues, and escalate complex problems to human agents
              when necessary. In this tutorial, we'll walk through the process
              of building an effective customer support bot with ChatterWise.
            </p>

            <h2>What You'll Build</h2>
            <p>
              By the end of this tutorial, you'll have created a customer
              support chatbot that can:
            </p>
            <ul>
              <li>
                Answer frequently asked questions about your products or
                services
              </li>
              <li>Help users troubleshoot common issues</li>
              <li>
                Collect information for support tickets when it can't resolve an
                issue
              </li>
              <li>Integrate with your existing support system (optional)</li>
            </ul>

            <h2>Prerequisites</h2>
            <p>Before you begin, make sure you have:</p>
            <ul>
              <li>
                A ChatterWise account (if you don't have one,{" "}
                <Link
                  to="/auth"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  sign up here
                </Link>
                )
              </li>
              <li>Support documentation, FAQs, or knowledge base articles</li>
              <li>Basic understanding of your customer support processes</li>
            </ul>

            <h2>Step 1: Plan Your Support Bot</h2>
            <p>
              Before creating your chatbot, it's important to plan its scope and
              capabilities:
            </p>

            <h3>Define Your Bot's Purpose</h3>
            <p>Start by defining what you want your support bot to handle:</p>
            <ul>
              <li>Which types of questions should it answer?</li>
              <li>Which issues should it troubleshoot?</li>
              <li>When should it escalate to a human agent?</li>
            </ul>

            <h3>Map Common Support Scenarios</h3>
            <p>
              Identify the most common support scenarios your bot will need to
              handle:
            </p>
            <ol>
              <li>Product information and pricing questions</li>
              <li>
                Account-related issues (login problems, password resets, etc.)
              </li>
              <li>Troubleshooting common technical problems</li>
              <li>Billing and payment inquiries</li>
              <li>Return and refund policies</li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-3">
                Pro Tip: Analyze Support Tickets
              </h3>
              <p className="text-blue-700 dark:text-blue-400 mb-0">
                Review your existing support tickets to identify the most common
                questions and issues. This will help you prioritize what content
                to include in your chatbot's knowledge base.
              </p>
            </div>

            <h2>Step 2: Create Your Support Bot</h2>
            <p>Now, let's create your customer support bot in ChatterWise:</p>

            <ol>
              <li>Log in to your ChatterWise account</li>
              <li>Click "New Chatbot" in the dashboard</li>
              <li>Enter a name (e.g., "Customer Support Assistant")</li>
              <li>
                Add a description (e.g., "AI-powered support bot to help
                customers with common questions and issues")
              </li>
              <li>Click "Create Chatbot"</li>
            </ol>

            <h3>Configure Basic Settings</h3>
            <p>After creating your chatbot, configure its basic settings:</p>
            <ol>
              <li>
                Set a welcoming message (e.g., "Hello! I'm your support
                assistant. How can I help you today?")
              </li>
              <li>
                Customize the input placeholder (e.g., "Ask me anything about
                our products or services...")
              </li>
              <li>Upload a brand-appropriate avatar (optional)</li>
            </ol>

            <h2>Step 3: Build Your Knowledge Base</h2>
            <p>
              The knowledge base is the foundation of your support bot. It
              should contain all the information your bot needs to answer
              customer questions.
            </p>

            <h3>Gather Support Content</h3>
            <p>Collect the following types of content:</p>
            <ul>
              <li>FAQs and their answers</li>
              <li>Product documentation</li>
              <li>Troubleshooting guides</li>
              <li>Policy documents (returns, refunds, shipping, etc.)</li>
              <li>Common error messages and their solutions</li>
            </ul>

            <h3>Organize Your Content</h3>
            <p>
              Organize your content in a clear, structured format before adding
              it to your chatbot:
            </p>
            <ul>
              <li>Group related information together</li>
              <li>Use clear headings and subheadings</li>
              <li>Format questions and answers clearly</li>
              <li>Include step-by-step instructions for processes</li>
            </ul>

            <h3>Add Content to Your Knowledge Base</h3>
            <p>Now, add your content to your chatbot's knowledge base:</p>
            <ol>
              <li>Go to the "Bot Knowledge" tab</li>
              <li>Click "Add Knowledge"</li>
              <li>Choose the appropriate content type (text or document)</li>
              <li>Upload your documents or paste your text content</li>
              <li>Add a descriptive title for each knowledge item</li>
              <li>Click "Add to Knowledge Base"</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Important Consideration
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 mb-0">
                For large knowledge bases, consider splitting your content into
                multiple smaller documents rather than one large document. This
                makes it easier to update specific sections and helps the
                chatbot retrieve more relevant information.
              </p>
            </div>

            <h2>Step 4: Configure Advanced Settings</h2>
            <p>
              To optimize your support bot's performance, configure these
              advanced settings:
            </p>

            <h3>RAG Settings</h3>
            <p>
              Adjust the Retrieval-Augmented Generation (RAG) settings to
              optimize how your chatbot retrieves and uses information:
            </p>
            <ul>
              <li>
                <strong>Max Retrieved Chunks:</strong> Set to 3-5 for support
                bots to provide comprehensive answers
              </li>
              <li>
                <strong>Similarity Threshold:</strong> Start with 0.7 and adjust
                based on performance
              </li>
              <li>
                <strong>Enable Citations:</strong> Turn on to show sources of
                information (helpful for support)
              </li>
            </ul>

            <h3>Custom Instructions</h3>
            <p>Add custom instructions to guide your chatbot's behavior:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`You are a helpful customer support assistant for [Your Company Name].
Always be polite, patient, and professional.
If you don't know the answer to a question, apologize and offer to connect the user with a human agent.
For technical issues, provide step-by-step troubleshooting instructions when possible.
If a user seems frustrated, acknowledge their frustration and focus on resolving their issue.
Never make up information. If you're unsure, say so.
For account-specific questions, ask the user to provide their order number or account email, then suggest they contact support directly.
End each interaction by asking if there's anything else you can help with.`}
            </pre>

            <h2>Step 5: Test Your Support Bot</h2>
            <p>
              Before deploying your support bot, thoroughly test it to ensure
              it's providing accurate and helpful responses:
            </p>

            <h3>Create Test Scenarios</h3>
            <p>Develop test scenarios based on common support interactions:</p>
            <ol>
              <li>Go to the "Testing Tools" section</li>
              <li>Click "Create Scenario"</li>
              <li>
                Add test messages that represent common customer questions
              </li>
              <li>Run the scenarios to evaluate your chatbot's responses</li>
            </ol>

            <h3>Manual Testing</h3>
            <p>
              Conduct manual testing by asking your chatbot a variety of
              questions:
            </p>
            <ul>
              <li>Common FAQs</li>
              <li>Complex technical issues</li>
              <li>Edge cases and unusual questions</li>
              <li>
                Questions that should trigger an escalation to human support
              </li>
            </ul>

            <h3>Refine Your Knowledge Base</h3>
            <p>Based on your testing results:</p>
            <ul>
              <li>Add missing information to your knowledge base</li>
              <li>Clarify ambiguous or confusing content</li>
              <li>Adjust your custom instructions if needed</li>
              <li>Fine-tune RAG settings for better performance</li>
            </ul>

            <h2>Step 6: Set Up Human Handoff</h2>
            <p>
              Even the best support bots sometimes need to escalate issues to
              human agents. Set up a human handoff process:
            </p>

            <h3>Configure Escalation Triggers</h3>
            <p>Define when your chatbot should escalate to a human:</p>
            <ul>
              <li>When the user explicitly asks for a human agent</li>
              <li>
                When the chatbot can't answer a question with high confidence
              </li>
              <li>When the user expresses frustration or dissatisfaction</li>
              <li>After multiple failed attempts to resolve an issue</li>
            </ul>

            <h3>Integration with Support Systems</h3>
            <p>Integrate your chatbot with your existing support system:</p>
            <ul>
              <li>
                <strong>Email integration:</strong> Configure your chatbot to
                send support requests to your support email
              </li>
              <li>
                <strong>Ticketing system integration:</strong> Use webhooks to
                create tickets in systems like Zendesk, Freshdesk, or Help Scout
              </li>
              <li>
                <strong>Live chat handoff:</strong> Transfer conversations to
                live chat agents when needed
              </li>
            </ul>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`// Example webhook configuration for Zendesk integration
{
  "event_type": "conversation_escalation",
  "webhook_url": "https://your-zendesk-webhook-endpoint.com",
  "include_conversation_history": true,
  "metadata": {
    "source": "support_bot",
    "priority": "medium"
  }
}`}
            </pre>

            <h2>Step 7: Deploy Your Support Bot</h2>
            <p>Now that your support bot is ready, it's time to deploy it:</p>

            <h3>Website Integration</h3>
            <p>Add your chatbot to your website:</p>
            <ol>
              <li>Go to the "Integrations" tab</li>
              <li>Select "Website"</li>
              <li>Customize the appearance to match your brand</li>
              <li>Copy the provided code snippet</li>
              <li>Add the code to your website</li>
            </ol>

            <h3>Help Center Integration</h3>
            <p>
              If you have a dedicated help center or knowledge base, integrate
              your chatbot there:
            </p>
            <ul>
              <li>For Zendesk Help Center, use the ChatterWise Zendesk app</li>
              <li>
                For WordPress-based help centers, use our WordPress plugin
              </li>
              <li>For custom help centers, use the JavaScript widget or API</li>
            </ul>

            <h3>Mobile App Integration</h3>
            <p>
              If you have a mobile app, consider integrating your support bot:
            </p>
            <ul>
              <li>Use our mobile SDK for native integration</li>
              <li>For web-based apps, use the responsive web widget</li>
            </ul>

            <h2>Step 8: Monitor and Improve</h2>
            <p>
              After deploying your support bot, continuously monitor its
              performance and make improvements:
            </p>

            <h3>Analytics and Reporting</h3>
            <p>Use ChatterWise's analytics to track your bot's performance:</p>
            <ul>
              <li>Monitor conversation volume and peak usage times</li>
              <li>Track common questions and topics</li>
              <li>Analyze user satisfaction ratings</li>
              <li>Identify knowledge gaps and areas for improvement</li>
            </ul>

            <h3>Continuous Improvement</h3>
            <p>Based on analytics and user feedback:</p>
            <ul>
              <li>Regularly update your knowledge base with new information</li>
              <li>
                Add content to address common questions that weren't initially
                covered
              </li>
              <li>
                Refine your bot's responses to improve clarity and helpfulness
              </li>
              <li>Adjust escalation triggers based on performance data</li>
            </ul>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 my-8">
              <h3 className="text-green-800 dark:text-green-300 font-semibold mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Success Metrics
              </h3>
              <p className="text-green-700 dark:text-green-400 mb-3">
                Track these metrics to measure your support bot's success:
              </p>
              <ul className="space-y-2 text-green-700 dark:text-green-400 mb-0">
                <li>
                  <strong>Deflection Rate:</strong> Percentage of inquiries
                  resolved without human intervention
                </li>
                <li>
                  <strong>Customer Satisfaction:</strong> Feedback ratings for
                  bot interactions
                </li>
                <li>
                  <strong>Average Resolution Time:</strong> Time to resolve
                  customer issues
                </li>
                <li>
                  <strong>Escalation Rate:</strong> Percentage of conversations
                  escalated to humans
                </li>
                <li>
                  <strong>Cost Savings:</strong> Reduction in support costs
                  compared to human-only support
                </li>
              </ul>
            </div>

            <h2>Advanced Support Bot Features</h2>

            <h3>Proactive Support</h3>
            <p>
              Configure your bot to proactively offer help based on user
              behavior:
            </p>
            <ul>
              <li>
                Trigger the chatbot after a user spends a certain amount of time
                on a help page
              </li>
              <li>
                Offer assistance when a user visits the same support article
                multiple times
              </li>
              <li>Suggest related articles based on the user's current page</li>
            </ul>

            <h3>Personalization</h3>
            <p>Enhance the support experience with personalization:</p>
            <ul>
              <li>
                Pass user context to the chatbot (e.g., account status, recent
                orders)
              </li>
              <li>Customize responses based on user segments or preferences</li>
              <li>Remember previous conversations to provide continuity</li>
            </ul>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`// Example of passing user context to the chatbot
<script src="https://cdn.chatterwise.io/widget.js" 
        data-bot-id="your-bot-id"
        data-context='{"user_name": "John", "account_type": "premium", "last_order_id": "ORD-12345"}'
        async></script>`}
            </pre>

            <h3>Multi-language Support</h3>
            <p>
              If you have international customers, consider setting up
              multi-language support:
            </p>
            <ul>
              <li>Create separate knowledge bases for each language</li>
              <li>
                Configure language detection to automatically switch languages
              </li>
              <li>Use translation services for less common languages</li>
            </ul>

            <h2>Conclusion</h2>
            <p>
              You've now built a comprehensive customer support chatbot that can
              handle common questions, troubleshoot issues, and escalate to
              human agents when necessary. As you continue to refine and improve
              your bot, it will become an increasingly valuable part of your
              customer support strategy, reducing costs while maintaining or
              even improving customer satisfaction.
            </p>

            <h2>Next Steps</h2>
            <p>
              To further enhance your customer support bot, consider exploring:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/tutorials/lead-generation-bot"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Creating a Lead Generation Bot
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/tutorials/faq-chatbot-setup"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  FAQ Chatbot Setup
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/tutorials/multi-language-support"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Multi-language Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/advanced-features/security-best-practices"
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
              Previous: Security Best Practices
            </Link>
            <Link
              to="/docs/tutorials/lead-generation-bot"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Creating a Lead Generation Bot
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

export default CustomerSupportBotPage;

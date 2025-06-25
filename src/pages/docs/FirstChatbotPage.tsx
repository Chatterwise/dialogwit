import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DocBreadcrumbs } from "../../components/DocBreadcrumbs";
import { SEO } from "../../components/SEO";

const FirstChatbotPage: React.FC = () => {
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
        name: "Getting Started",
        item: "https://chatterwise.io/docs/getting-started",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Creating Your First Chatbot",
        item: "https://chatterwise.io/docs/getting-started/first-chatbot",
      },
    ],
  };

  return (
    <>
      <SEO
        title="Creating Your First Chatbot | ChatterWise Documentation"
        description="Learn how to create your first AI-powered chatbot with ChatterWise. Follow this step-by-step guide to build, train, and deploy your chatbot in minutes."
        canonicalUrl="/docs/getting-started/first-chatbot"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="create chatbot, first chatbot, AI chatbot tutorial, ChatterWise tutorial, chatbot setup, build chatbot"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[
            { name: "Getting Started", href: "/docs/getting-started" },
            {
              name: "Creating Your First Chatbot",
              href: "/docs/getting-started/first-chatbot",
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
            Creating Your First Chatbot
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              In this guide, we'll walk you through the process of creating your
              first chatbot with ChatterWise. By the end, you'll have a fully
              functional AI-powered chatbot ready to deploy on your website or
              other platforms.
            </p>

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
              <li>
                Some content for your chatbot's knowledge base (documentation,
                FAQs, product information, etc.)
              </li>
            </ul>

            <h2>Step 1: Create a New Chatbot</h2>
            <p>To create a new chatbot, follow these steps:</p>
            <ol>
              <li>Log in to your ChatterWise account</li>
              <li>Navigate to the Dashboard</li>
              <li>Click on the "New Chatbot" button in the top right corner</li>
              <li>Enter a name and description for your chatbot</li>
              <li>Click "Create Chatbot"</li>
            </ol>

            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 my-8">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3">
                Pro Tip
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-0">
                Choose a descriptive name for your chatbot that reflects its
                purpose. This will help you and your team identify it easily,
                especially if you plan to create multiple chatbots.
              </p>
            </div>

            <h2>Step 2: Configure Basic Settings</h2>
            <p>
              After creating your chatbot, you'll be taken to the chatbot
              builder. Here, you can configure the basic settings:
            </p>

            <ul>
              <li>
                <strong>Welcome Message:</strong> The first message users will
                see when they start a conversation
              </li>
              <li>
                <strong>Input Placeholder:</strong> The text shown in the input
                field before the user types
              </li>
              <li>
                <strong>Bot Avatar:</strong> An image that represents your
                chatbot (optional)
              </li>
            </ul>

            <p>
              These settings help personalize your chatbot and make it more
              engaging for users. You can always come back and modify these
              settings later.
            </p>

            <h2>Step 3: Add Knowledge Base Content</h2>
            <p>
              The next step is to add content to your chatbot's knowledge base.
              This is the information your chatbot will use to answer questions.
            </p>

            <p>There are several ways to add content:</p>

            <ul>
              <li>
                <strong>Upload Documents:</strong> You can upload PDFs, Word
                documents, Excel spreadsheets, and more. ChatterWise will
                automatically extract the text and process it.
              </li>
              <li>
                <strong>Add Text Directly:</strong> You can paste text directly
                into the knowledge base editor.
              </li>
              <li>
                <strong>Import from URL:</strong> You can import content from a
                website by providing the URL.
              </li>
            </ul>

            <p>For this guide, let's add some text directly:</p>

            <ol>
              <li>Click on the "Bot Knowledge" tab</li>
              <li>Click "Add Knowledge"</li>
              <li>Select "Text" as the content type</li>
              <li>Enter a title for your content (e.g., "Product FAQs")</li>
              <li>Paste your text content in the editor</li>
              <li>Click "Add to Knowledge Base"</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3">
                Important Note
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 mb-0">
                The quality of your chatbot's responses depends on the quality
                and relevance of the content in its knowledge base. Make sure to
                provide clear, comprehensive information that covers the topics
                your users are likely to ask about.
              </p>
            </div>

            <h2>Step 4: Train Your Chatbot</h2>
            <p>
              Once you've added content to your knowledge base, ChatterWise will
              automatically process it using our RAG (Retrieval-Augmented
              Generation) pipeline. This process includes:
            </p>

            <ul>
              <li>
                <strong>Chunking:</strong> Breaking down your content into
                manageable pieces
              </li>
              <li>
                <strong>Embedding:</strong> Creating vector representations of
                your content for semantic search
              </li>
              <li>
                <strong>Indexing:</strong> Organizing the content for efficient
                retrieval
              </li>
            </ul>

            <p>
              The training process typically takes a few minutes, depending on
              the amount of content. You'll see a progress indicator while the
              training is in progress.
            </p>

            <h2>Step 5: Test Your Chatbot</h2>
            <p>
              After the training is complete, you can test your chatbot to see
              how it responds to questions:
            </p>

            <ol>
              <li>Click on the "Test Chat" tab</li>
              <li>Type a question related to the content you added</li>
              <li>Press Enter or click the send button</li>
              <li>Review the chatbot's response</li>
            </ol>

            <p>
              Try asking different questions to see how well your chatbot
              understands and responds. If you're not satisfied with the
              responses, you can add more content to the knowledge base or
              refine the existing content.
            </p>

            <h2>Step 6: Deploy Your Chatbot</h2>
            <p>
              Once you're happy with your chatbot's performance, you can deploy
              it to your website or other platforms:
            </p>

            <ol>
              <li>Click on the "Integrations" tab</li>
              <li>
                Choose the platform where you want to deploy your chatbot (e.g.,
                Website, Slack, Discord)
              </li>
              <li>
                Follow the platform-specific instructions to complete the
                integration
              </li>
            </ol>

            <p>
              For website integration, you'll typically need to add a small code
              snippet to your website. ChatterWise provides this code for you,
              and you can customize the appearance of the chat widget to match
              your brand.
            </p>

            <h2>Next Steps</h2>
            <p>
              Congratulations! You've created your first chatbot with
              ChatterWise. Here are some next steps to consider:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/getting-started/knowledge-base"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Learn more about managing your Bot Knowledge
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/getting-started/training-chatbot"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Explore advanced training options
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/integrations/website-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Customize your website integration
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/getting-started/introduction"
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
              Previous: Introduction
            </Link>
            <Link
              to="/docs/getting-started/knowledge-base"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Understanding Bot Knowledge
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

export default FirstChatbotPage;

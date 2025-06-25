import React from "react";
import { motion } from "framer-motion";
import { Bot, Zap, Database, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { DocBreadcrumbs } from "../../components/DocBreadcrumbs";
import { SEO } from "../../components/SEO";

const IntroductionPage: React.FC = () => {
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
        name: "Introduction to ChatterWise",
        item: "https://chatterwise.io/docs/getting-started/introduction",
      },
    ],
  };

  return (
    <>
      <SEO
        title="Introduction to ChatterWise | Documentation"
        description="Learn about ChatterWise, the AI-powered chatbot platform that helps you build intelligent, context-aware chatbots in minutes."
        canonicalUrl="/docs/getting-started/introduction"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise, AI chatbot, introduction, getting started, documentation, RAG, retrieval augmented generation"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Getting Started", href: "/docs/getting-started" },
            {
              name: "Introduction",
              href: "/docs/getting-started/introduction",
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
            Introduction to ChatterWise
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Welcome to ChatterWise, the AI-powered chatbot platform that helps
              businesses create intelligent, context-aware chatbots in minutes,
              not months. Whether you're looking to enhance customer support,
              streamline sales processes, or provide 24/7 assistance to your
              users, ChatterWise makes it easy to build and deploy sophisticated
              chatbots without any coding knowledge.
            </p>

            <h2>What is ChatterWise?</h2>
            <p>
              ChatterWise is a comprehensive platform for creating, training,
              and deploying AI chatbots powered by advanced language models like
              GPT-3.5 and GPT-4. Our platform uses Retrieval-Augmented
              Generation (RAG) to combine the power of large language models
              with your specific knowledge base, ensuring accurate and
              contextually relevant responses.
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-6 my-8">
              <h3 className="text-primary-800 dark:text-primary-300 font-semibold mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1 mr-3 flex-shrink-0" />
                  <span>
                    <strong>AI-Powered Chatbots:</strong> Create intelligent
                    chatbots that understand context, remember conversations,
                    and provide accurate responses.
                  </span>
                </li>
                <li className="flex items-start">
                  <Database className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1 mr-3 flex-shrink-0" />
                  <span>
                    <strong>Knowledge Base Integration:</strong> Train your
                    chatbots with your own content by uploading documents or
                    adding text.
                  </span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1 mr-3 flex-shrink-0" />
                  <span>
                    <strong>Easy Deployment:</strong> Deploy your chatbots
                    anywhere your customers are with just a few clicks.
                  </span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-1 mr-3 flex-shrink-0" />
                  <span>
                    <strong>Customizable Templates:</strong> Choose from a
                    variety of beautiful, responsive chat templates designed for
                    different industries.
                  </span>
                </li>
              </ul>
            </div>

            <h2>How ChatterWise Works</h2>
            <p>
              ChatterWise uses a three-step process to create powerful,
              context-aware chatbots:
            </p>

            <ol>
              <li>
                <strong>Upload Your Content:</strong> Add documents, FAQs, or
                any text content that contains your knowledge base.
              </li>
              <li>
                <strong>Train Your Chatbot:</strong> Our AI automatically
                processes your content and creates a smart, context-aware
                chatbot.
              </li>
              <li>
                <strong>Deploy & Integrate:</strong> Add your chatbot to your
                website, app, or platform with a simple embed code or API.
              </li>
            </ol>

            <h2>Understanding RAG Technology</h2>
            <p>
              At the heart of ChatterWise is Retrieval-Augmented Generation
              (RAG) technology. RAG combines the power of large language models
              with a retrieval system that can access and use your specific
              knowledge base. This approach ensures that your chatbot provides
              accurate, up-to-date information that's relevant to your business.
            </p>

            <p>When a user asks a question, the RAG system:</p>

            <ol>
              <li>Analyzes the question to understand the intent</li>
              <li>Searches your knowledge base for relevant information</li>
              <li>Retrieves the most pertinent content</li>
              <li>
                Uses the language model to generate a coherent, accurate
                response based on the retrieved information
              </li>
            </ol>

            <p>
              This approach combines the best of both worlds: the natural
              language understanding and generation capabilities of large
              language models, and the accuracy and specificity of your own
              knowledge base.
            </p>

            <h2>Getting Started with ChatterWise</h2>
            <p>
              Ready to create your first chatbot? Follow our step-by-step guides
              to get started:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/getting-started/first-chatbot"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Creating Your First Chatbot
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/getting-started/knowledge-base"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Understanding Bot Knowledge
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/getting-started/training-chatbot"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Training Your Chatbot
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div></div>
            <Link
              to="/docs/getting-started/first-chatbot"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Creating Your First Chatbot
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

export default IntroductionPage;

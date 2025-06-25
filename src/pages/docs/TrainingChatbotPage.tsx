import React from "react";
import { motion } from "framer-motion";
import { Brain, Settings, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { DocBreadcrumbs } from "../../components/DocBreadcrumbs";
import { SEO } from "../../components/SEO";

const TrainingChatbotPage: React.FC = () => {
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
        name: "Training Your Chatbot",
        item: "https://chatterwise.io/docs/getting-started/training-chatbot",
      },
    ],
  };

  return (
    <>
      <SEO
        title="Training Your Chatbot | ChatterWise Documentation"
        description="Learn how to train your AI chatbot for optimal performance. Discover advanced training techniques, RAG settings, and continuous improvement strategies."
        canonicalUrl="/docs/getting-started/training-chatbot"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="chatbot training, AI model training, RAG settings, chatbot optimization, fine-tuning chatbot, improve chatbot responses"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Getting Started", href: "/docs/getting-started" },
            {
              name: "Training Your Chatbot",
              href: "/docs/getting-started/training-chatbot",
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
            Training Your Chatbot
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Training is a crucial step in creating an effective chatbot. While
              ChatterWise handles much of the technical aspects automatically,
              understanding the training process and knowing how to optimize it
              can significantly improve your chatbot's performance.
            </p>

            <h2>Understanding the Training Process</h2>
            <p>
              When you add content to your chatbot's knowledge base, ChatterWise
              automatically processes it using our RAG (Retrieval-Augmented
              Generation) pipeline. This training process involves:
            </p>

            <ol>
              <li>
                <strong>Content Processing:</strong> Extracting text from
                documents and preparing it for analysis
              </li>
              <li>
                <strong>Chunking:</strong> Breaking down content into smaller,
                manageable pieces
              </li>
              <li>
                <strong>Embedding Generation:</strong> Creating vector
                representations of each chunk using advanced AI models
              </li>
              <li>
                <strong>Vector Database Indexing:</strong> Storing these
                embeddings in a searchable database
              </li>
            </ol>

            <p>
              This process enables your chatbot to quickly find and retrieve
              relevant information when responding to user queries.
            </p>

            <h2>RAG Settings and Configuration</h2>
            <p>
              ChatterWise provides several settings that you can adjust to
              optimize your chatbot's training and performance:
            </p>

            <h3>Model Selection</h3>
            <p>You can choose which AI model powers your chatbot:</p>
            <ul>
              <li>
                <strong>GPT-3.5 Turbo:</strong> A good balance of performance
                and cost, suitable for most use cases
              </li>
              <li>
                <strong>GPT-4:</strong> More advanced understanding and
                reasoning capabilities, ideal for complex domains
              </li>
            </ul>

            <p>To change the model:</p>
            <ol>
              <li>Go to your chatbot's settings</li>
              <li>Navigate to the "Advanced" tab</li>
              <li>Select your preferred model from the dropdown</li>
              <li>Save your changes</li>
            </ol>

            <h3>RAG Pipeline Settings</h3>
            <p>
              You can fine-tune the RAG pipeline settings to optimize how your
              chatbot retrieves and uses information:
            </p>

            <div className="not-prose">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center mb-3">
                    <Settings className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Retrieval Settings
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>Max Retrieved Chunks:</strong> Number of knowledge
                      chunks to retrieve per query (default: 3)
                    </li>
                    <li>
                      <strong>Similarity Threshold:</strong> Minimum similarity
                      score for retrieved content (default: 0.7)
                    </li>
                    <li>
                      <strong>Enable Citations:</strong> Include sources in
                      responses (default: off)
                    </li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex items-center mb-3">
                    <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Generation Settings
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      <strong>Temperature:</strong> Controls randomness in
                      responses (default: 0.7)
                    </li>
                    <li>
                      <strong>Max Tokens:</strong> Maximum length of generated
                      responses (default: 500)
                    </li>
                    <li>
                      <strong>Streaming:</strong> Enable real-time response
                      generation (default: off)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p>To access these settings:</p>
            <ol>
              <li>Go to your chatbot's settings</li>
              <li>Navigate to the "RAG Settings" tab</li>
              <li>Adjust the settings as needed</li>
              <li>Save your changes</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Advanced Settings Caution
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400 mb-0">
                The default settings work well for most use cases. Only adjust
                these settings if you understand their impact. Improper settings
                can lead to less accurate responses or increased costs.
              </p>
            </div>

            <h2>Testing and Improving Your Chatbot</h2>
            <p>
              After training, it's important to test your chatbot thoroughly and
              make improvements based on its performance:
            </p>

            <h3>Test Scenarios</h3>
            <p>
              ChatterWise provides a Test Scenarios feature that allows you to
              create predefined conversations to evaluate your chatbot's
              performance:
            </p>
            <ol>
              <li>Go to the "Testing Tools" section</li>
              <li>Click "Create Scenario"</li>
              <li>Add test messages and expected responses</li>
              <li>Run the scenario to see how your chatbot performs</li>
            </ol>

            <h3>Analyzing Performance</h3>
            <p>
              Use the Analytics dashboard to monitor your chatbot's performance:
            </p>
            <ul>
              <li>
                <strong>Response Accuracy:</strong> How often your chatbot
                provides accurate responses
              </li>
              <li>
                <strong>User Satisfaction:</strong> Feedback from users on
                response quality
              </li>
              <li>
                <strong>Knowledge Gaps:</strong> Questions that your chatbot
                couldn't answer confidently
              </li>
            </ul>

            <h3>Continuous Improvement</h3>
            <p>
              Based on your analysis, you can continuously improve your chatbot:
            </p>
            <ul>
              <li>
                <strong>Add More Content:</strong> Fill knowledge gaps by adding
                more information to your knowledge base
              </li>
              <li>
                <strong>Refine Existing Content:</strong> Improve the clarity
                and structure of your existing content
              </li>
              <li>
                <strong>Adjust RAG Settings:</strong> Fine-tune the settings
                based on performance data
              </li>
              <li>
                <strong>Create Test Scenarios:</strong> Develop comprehensive
                test cases to ensure consistent performance
              </li>
            </ul>

            <h2>Advanced Training Techniques</h2>

            <h3>Custom Instructions</h3>
            <p>
              You can provide custom instructions to guide your chatbot's
              behavior:
            </p>
            <ol>
              <li>Go to your chatbot's settings</li>
              <li>Navigate to the "Advanced" tab</li>
              <li>Add custom instructions in the provided field</li>
              <li>Save your changes</li>
            </ol>

            <p>Example custom instructions:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              You are a helpful customer support assistant for Acme Inc. Always
              be polite and professional. If you don't know the answer to a
              question, suggest contacting support at support@acme.com. Never
              make up information that isn't in your knowledge base.
            </pre>

            <h3>Feedback Loop Integration</h3>
            <p>
              Implement a feedback loop to continuously improve your chatbot:
            </p>
            <ol>
              <li>Enable the feedback feature in your chatbot settings</li>
              <li>Regularly review user feedback</li>
              <li>Identify patterns in negative feedback</li>
              <li>Update your knowledge base to address common issues</li>
            </ol>

            <h2>Next Steps</h2>
            <p>
              Now that you understand how to train and optimize your chatbot,
              you're ready to explore integration options to deploy it to your
              preferred platforms.
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/integrations/website-integration"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Website Integration
                </Link>
              </li>
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
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/getting-started/knowledge-base"
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
              Previous: Understanding Bot Knowledge
            </Link>
            <Link
              to="/docs/integrations/website-integration"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Website Integration
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

export default TrainingChatbotPage;

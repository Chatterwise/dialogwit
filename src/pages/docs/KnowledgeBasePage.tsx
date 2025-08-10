import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { DocBreadcrumbs } from "../../components/DocBreadcrumbs";
import { SEO } from "../../components/SEO";
import { ScrollToTop } from "../../components/utils/ScrollToTop";

const KnowledgeBasePage: React.FC = () => {
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
        name: "Understanding Bot Knowledge",
        item: "https://chatterwise.io/docs/getting-started/knowledge-base",
      },
    ],
  };

  return (
    <>
      {/* Ensure that the page scrolls to the top when the page is loaded */}
      <ScrollToTop />
      <SEO
        title="Understanding Bot Knowledge | ChatterWise Documentation"
        description="Learn how to effectively manage your chatbot's knowledge base to improve response accuracy and relevance."
        canonicalUrl="/docs/getting-started/knowledge-base"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="chatbot knowledge base, RAG, retrieval augmented generation, document processing, knowledge management, AI training data"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Getting Started", href: "/docs/getting-started" },
            {
              name: "Understanding Bot Knowledge",
              href: "/docs/getting-started/knowledge-base",
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
            Understanding Bot Knowledge
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              The knowledge base is the foundation of your chatbot's
              intelligence. It contains all the information your chatbot uses to
              answer questions and engage with users. In this guide, we'll
              explore how to effectively manage your chatbot's knowledge base to
              improve response accuracy and relevance.
            </p>

            <h2>What is a Knowledge Base?</h2>
            <p>
              A knowledge base is a collection of information that your chatbot
              can access and use to generate responses. This information can
              come from various sources, including:
            </p>

            <ul>
              <li>Documents (PDFs, Word files, etc.)</li>
              <li>Text content (FAQs, product descriptions, etc.)</li>
              <li>Websites</li>
              <li>Databases</li>
            </ul>

            <p>
              ChatterWise uses Retrieval-Augmented Generation (RAG) to process
              this information and make it available to your chatbot. When a
              user asks a question, the system retrieves relevant information
              from the knowledge base and uses it to generate an accurate
              response.
            </p>

            <h2>How ChatterWise Processes Your Knowledge Base</h2>
            <p>
              When you add content to your chatbot's knowledge base, ChatterWise
              processes it through several steps:
            </p>

            <ol>
              <li>
                <strong>Content Extraction:</strong> For documents like PDFs or
                Word files, ChatterWise extracts the text content.
              </li>
              <li>
                <strong>Chunking:</strong> The content is divided into smaller,
                manageable chunks. This is important because large language
                models have context limitations.
              </li>
              <li>
                <strong>Embedding:</strong> Each chunk is converted into a
                vector representation (embedding) that captures its semantic
                meaning.
              </li>
              <li>
                <strong>Indexing:</strong> The embeddings are stored in a vector
                database for efficient retrieval.
              </li>
            </ol>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-6 my-8">
              <h3 className="text-primary-800 dark:text-primary-300 font-semibold mb-3">
                Understanding Embeddings
              </h3>
              <p className="text-primary-700 dark:text-primary-400 mb-0">
                Embeddings are numerical representations of text that capture
                semantic meaning. Similar pieces of text will have similar
                embeddings, which allows the system to find relevant information
                even if the exact words don't match. This is what enables your
                chatbot to understand the intent behind questions and provide
                relevant answers.
              </p>
            </div>

            <h2>Adding Content to Your Knowledge Base</h2>
            <p>
              There are several ways to add content to your chatbot's knowledge
              base:
            </p>

            <h3>1. Uploading Documents</h3>
            <p>ChatterWise supports various document formats, including:</p>
            <ul>
              <li>PDF</li>
              <li>Microsoft Word (.docx, .doc)</li>
              <li>Microsoft Excel (.xlsx, .xls)</li>
              <li>Microsoft PowerPoint (.pptx, .ppt)</li>
              <li>Text files (.txt)</li>
              <li>Markdown files (.md)</li>
            </ul>

            <p>To upload a document:</p>
            <ol>
              <li>Navigate to the "Bot Knowledge" tab</li>
              <li>Click "Add Knowledge"</li>
              <li>Select "Document" as the content type</li>
              <li>Click "Upload Document" or drag and drop your file</li>
              <li>Click "Add to Knowledge Base"</li>
            </ol>

            <h3>2. Adding Text Content</h3>
            <p>You can also add text content directly:</p>
            <ol>
              <li>Navigate to the "Bot Knowledge" tab</li>
              <li>Click "Add Knowledge"</li>
              <li>Select "Text" as the content type</li>
              <li>Enter a title for your content</li>
              <li>Paste or type your text in the editor</li>
              <li>Click "Add to Knowledge Base"</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 my-8">
              <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Best Practices for Knowledge Base Content
              </h3>
              <ul className="space-y-2 text-yellow-700 dark:text-yellow-400 mb-0">
                <li>Keep content clear, concise, and well-structured</li>
                <li>
                  Organize information logically with headings and subheadings
                </li>
                <li>Include common questions and their answers</li>
                <li>Use plain language and avoid jargon unless necessary</li>
                <li>
                  Regularly update your knowledge base to keep information
                  current
                </li>
              </ul>
            </div>

            <h2>Managing Your Knowledge Base</h2>
            <p>
              As your chatbot evolves, you'll need to manage your knowledge base
              to ensure it remains accurate and relevant:
            </p>

            <h3>Viewing Knowledge Items</h3>
            <p>
              You can view all items in your knowledge base from the "Bot
              Knowledge" tab. For each item, you can:
            </p>
            <ul>
              <li>View the content</li>
              <li>Check the processing status</li>
              <li>See when it was added</li>
            </ul>

            <h3>Editing Knowledge Items</h3>
            <p>To edit an existing knowledge item:</p>
            <ol>
              <li>Navigate to the "Bot Knowledge" tab</li>
              <li>Find the item you want to edit</li>
              <li>Click the "Edit" button</li>
              <li>Make your changes</li>
              <li>Click "Save Changes"</li>
            </ol>

            <p>
              After editing, the item will be reprocessed automatically to
              update the embeddings.
            </p>

            <h3>Deleting Knowledge Items</h3>
            <p>To delete a knowledge item:</p>
            <ol>
              <li>Navigate to the "Bot Knowledge" tab</li>
              <li>Find the item you want to delete</li>
              <li>Click the "Delete" button</li>
              <li>Confirm the deletion</li>
            </ol>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 my-8">
              <h3 className="text-green-800 dark:text-green-300 font-semibold mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Knowledge Base Optimization Tips
              </h3>
              <ul className="space-y-2 text-green-700 dark:text-green-400 mb-0">
                <li>
                  Start with your most frequently asked questions and their
                  answers
                </li>
                <li>
                  Add product documentation, user guides, and support articles
                </li>
                <li>Include specific examples and use cases</li>
                <li>
                  Monitor chatbot performance and add content to address gaps
                </li>
                <li>Remove outdated or irrelevant information</li>
              </ul>
            </div>

            <h2>Advanced Knowledge Base Features</h2>

            <h3>Content Chunking Settings</h3>
            <p>
              ChatterWise automatically chunks your content into smaller pieces
              for processing. You can customize the chunking settings in the RAG
              Settings:
            </p>
            <ul>
              <li>
                <strong>Chunk Size:</strong> The maximum number of characters in
                each chunk
              </li>
              <li>
                <strong>Chunk Overlap:</strong> The number of characters that
                overlap between chunks
              </li>
              <li>
                <strong>Minimum Word Count:</strong> The minimum number of words
                required for a chunk to be processed
              </li>
            </ul>

            <h3>Metadata and Tagging</h3>
            <p>
              You can add metadata to your knowledge base items to help organize
              and categorize them. This can be useful for filtering and
              searching your knowledge base.
            </p>

            <h2>Monitoring Knowledge Base Performance</h2>
            <p>
              ChatterWise provides analytics to help you monitor how well your
              knowledge base is performing:
            </p>
            <ul>
              <li>
                <strong>Response Accuracy:</strong> How often your chatbot
                provides accurate responses
              </li>
              <li>
                <strong>Knowledge Gaps:</strong> Questions that your chatbot
                couldn't answer confidently
              </li>
              <li>
                <strong>Popular Topics:</strong> The most frequently asked
                questions
              </li>
            </ul>

            <p>
              Use these insights to continuously improve your knowledge base by
              adding new content or refining existing content.
            </p>

            <h2>Next Steps</h2>
            <p>
              Now that you understand how to manage your chatbot's knowledge
              base, you're ready to learn about training your chatbot to improve
              its performance.
            </p>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/getting-started/first-chatbot"
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
              Previous: Creating Your First Chatbot
            </Link>
            <Link
              to="/docs/getting-started/training-chatbot"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Training Your Chatbot
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

export default KnowledgeBasePage;

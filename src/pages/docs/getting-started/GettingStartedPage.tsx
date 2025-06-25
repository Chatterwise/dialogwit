import React from "react";
import { motion } from "framer-motion";
import { Bot, FileText, Database, Brain } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";

const GettingStartedPage: React.FC = () => {
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
        name: "Getting Started",
        item: "https://chatterwise.ai/docs/getting-started",
      },
    ],
  };

  const articles = [
    {
      title: "Introduction to ChatterWise",
      description:
        "Learn about ChatterWise, the AI-powered chatbot platform that helps you build intelligent, context-aware chatbots in minutes.",
      icon: Bot,
      href: "/docs/getting-started/introduction",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Creating Your First Chatbot",
      description:
        "Follow this step-by-step guide to build, train, and deploy your first AI-powered chatbot.",
      icon: FileText,
      href: "/docs/getting-started/first-chatbot",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Understanding Bot Knowledge",
      description:
        "Learn how to effectively manage your chatbot's knowledge base to improve response accuracy and relevance.",
      icon: Database,
      href: "/docs/getting-started/knowledge-base",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Training Your Chatbot",
      description:
        "Discover advanced training techniques, RAG settings, and continuous improvement strategies.",
      icon: Brain,
      href: "/docs/getting-started/training-chatbot",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <>
      <SEO
        title="Getting Started with ChatterWise | Documentation"
        description="Learn the basics of ChatterWise and how to create your first AI-powered chatbot. Step-by-step guides for beginners."
        canonicalUrl="/docs/getting-started"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise getting started, chatbot basics, AI chatbot tutorial, beginner chatbot guide, create chatbot"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[{ name: "Getting Started", href: "/docs/getting-started" }]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Getting Started with ChatterWise
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
            <p>
              Welcome to the Getting Started section of the ChatterWise
              documentation. Here you'll find everything you need to know to
              begin building AI-powered chatbots with ChatterWise. Whether
              you're new to chatbots or an experienced developer, these guides
              will help you create, train, and deploy intelligent chatbots in
              minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {articles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <Link to={article.href} className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className={`p-3 ${article.color} rounded-xl mr-4`}>
                      <article.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {article.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {article.description}
                  </p>
                  <div className="text-primary-600 dark:text-primary-400 font-medium">
                    Read article →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Dive Deeper?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Once you've mastered the basics, explore our other documentation
              sections to learn about integrations, advanced features, and
              tutorials for specific use cases.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/docs/integrations/website-integration"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Website Integration
              </Link>
              <Link
                to="/docs/advanced-features/custom-templates"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Custom Templates
              </Link>
              <Link
                to="/docs/tutorials/customer-support-bot"
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
              >
                Customer Support Bot Tutorial
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default GettingStartedPage;

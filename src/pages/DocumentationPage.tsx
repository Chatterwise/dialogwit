import React from "react";
import { Link } from "react-router-dom";
import { Book, ChevronRight, FileText, Code, MessageSquare, Bot, Zap } from "lucide-react";
import { motion } from "framer-motion";

const DocumentationPage: React.FC = () => {
  const sections = [
    {
      title: "Getting Started",
      description: "Learn the basics of ChatterWise and how to create your first chatbot",
      icon: Bot,
      links: [
        { title: "Introduction to ChatterWise", href: "#introduction" },
        { title: "Creating Your First Chatbot", href: "#first-chatbot" },
        { title: "Understanding Bot Knowledge", href: "#knowledge-base" },
        { title: "Training Your Chatbot", href: "#training" },
      ],
    },
    {
      title: "Integrations",
      description: "Connect your chatbot to various platforms and services",
      icon: Zap,
      links: [
        { title: "Website Integration", href: "#website" },
        { title: "Slack Integration", href: "#slack" },
        { title: "Discord Integration", href: "#discord" },
        { title: "WordPress Integration", href: "#wordpress" },
      ],
    },
    {
      title: "Advanced Features",
      description: "Take your chatbots to the next level with advanced capabilities",
      icon: Code,
      links: [
        { title: "Custom Templates", href: "#templates" },
        { title: "Webhooks", href: "#webhooks" },
        { title: "API Reference", href: "/api-reference" },
        { title: "Security Best Practices", href: "#security" },
      ],
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides for common use cases",
      icon: FileText,
      links: [
        { title: "Building a Customer Support Bot", href: "#support-bot" },
        { title: "Creating a Lead Generation Bot", href: "#lead-gen" },
        { title: "FAQ Chatbot Setup", href: "#faq-bot" },
        { title: "Multi-language Support", href: "#multi-language" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Documentation</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about building and deploying AI-powered chatbots with ChatterWise
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Search
            </button>
          </div>
        </motion.div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-start mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4">
                  <section.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      to={link.href}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                    >
                      <span className="text-gray-800 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-300 font-medium">
                        {link.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need More Help?</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Check out our additional resources or contact our support team
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/api-reference"
                className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                <Code className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                API Reference
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center px-5 py-2.5 bg-primary-600 dark:bg-primary-700 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-sm"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Community Forum
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentationPage;
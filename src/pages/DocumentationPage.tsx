import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  FileText,
  Code,
  MessageSquare,
  Bot,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "../components/SEO";

// ScrollToTop component (for auto-scroll to top on navigation)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const DocumentationPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    {
      title: "Getting Started",
      description:
        "Learn the basics of ChatterWise and how to create your first chatbot",
      icon: Bot,
      links: [
        {
          title: "Introduction to ChatterWise",
          href: "/docs/getting-started/introduction",
        },
        {
          title: "Creating Your First Chatbot",
          href: "/docs/getting-started/first-chatbot",
        },
        {
          title: "Understanding Bot Knowledge",
          href: "/docs/getting-started/knowledge-base",
        },
        {
          title: "Training Your Chatbot",
          href: "/docs/getting-started/training-chatbot",
        },
      ],
      categoryLink: "/docs/getting-started",
    },
    {
      title: "Integrations",
      description: "Connect your chatbot to various platforms and services",
      icon: Zap,
      links: [
        {
          title: "Website Integration",
          href: "/docs/integrations/website-integration",
        },
        {
          title: "Slack Integration",
          href: "/docs/integrations/slack-integration",
        },
        {
          title: "Discord Integration",
          href: "/docs/integrations/discord-integration",
        },
        {
          title: "WordPress Integration",
          href: "/docs/integrations/wordpress-integration",
        },
      ],
      categoryLink: "/docs/integrations",
    },
    {
      title: "Advanced Features",
      description:
        "Take your chatbots to the next level with advanced capabilities",
      icon: Code,
      links: [
        {
          title: "Custom Templates",
          href: "/docs/advanced-features/custom-templates",
        },
        { title: "Webhooks", href: "/docs/advanced-features/webhooks" },
        { title: "API Reference", href: "/api-reference" },
        {
          title: "Security Best Practices",
          href: "/docs/advanced-features/security-best-practices",
        },
      ],
      categoryLink: "/docs/advanced-features",
    },
    {
      title: "Tutorials",
      description: "Step-by-step guides for common use cases",
      icon: FileText,
      links: [
        {
          title: "Building a Customer Support Bot",
          href: "/docs/tutorials/customer-support-bot",
        },
        {
          title: "Creating a Lead Generation Bot",
          href: "/docs/tutorials/lead-generation-bot",
        },
        {
          title: "FAQ Chatbot Setup",
          href: "/docs/tutorials/faq-chatbot-setup",
        },
        {
          title: "Multi-language Support",
          href: "/docs/tutorials/multi-language-support",
        },
      ],
      categoryLink: "/docs/tutorials",
    },
  ];

  // Schema data for breadcrumbs
  const breadcrumbSchema = {
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://chatterwise.io",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Documentation",
        item: "https://chatterwise.io/documentation",
      },
    ],
  };

  // Filter sections and links based on search query
  const filteredSections = searchQuery
    ? sections
        .map((section) => ({
          ...section,
          links: section.links.filter((link) =>
            link.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.links.length > 0)
    : sections;

  return (
    <>
      <ScrollToTop />
      <SEO
        title="ChatterWise Documentation | AI Chatbot Platform"
        description="Comprehensive documentation for ChatterWise, the AI-powered chatbot platform. Learn how to build, train, and deploy intelligent chatbots with our step-by-step guides."
        canonicalUrl="/documentation"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise documentation, chatbot documentation, AI chatbot guides, RAG documentation, chatbot tutorials, integration guides"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <a
            href="/"
            className="text-primary-600 dark:text-primary-400 hover:underline mb-6 inline-block"
          >
            Go back
          </a>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about building and deploying
              AI-powered chatbots with ChatterWise
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Search
              </button>
            </div>
          </motion.div>

          {/* Documentation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredSections.map((section, index) => (
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
                    <Link to={section.categoryLink} className="hover:underline">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {section.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-300">
                      {section.description}
                    </p>
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
                <div className="mt-4 text-right">
                  <Link
                    to={section.categoryLink}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    View all {section.title.toLowerCase()} →
                  </Link>
                </div>
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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Need More Help?
                </h3>
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
    </>
  );
};

export default DocumentationPage;

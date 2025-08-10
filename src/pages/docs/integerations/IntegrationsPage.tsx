import React from "react";
import { motion } from "framer-motion";
import { Globe, MessageSquare, Code, Puzzle, Webhook } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { ScrollToTop } from "../../../components/utils/ScrollToTop";

const IntegrationsPage: React.FC = () => {
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
    ],
  };

  const integrations = [
    {
      title: "Website Integration",
      description:
        "Learn how to integrate your ChatterWise chatbot into your website using our JavaScript widget or React components.",
      icon: Globe,
      href: "/docs/integrations/website-integration",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Slack Integration",
      description:
        "Deploy your chatbot as a Slack app for team communication and customer support.",
      icon: MessageSquare,
      href: "/docs/integrations/slack-integration",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Discord Integration",
      description:
        "Add your chatbot to Discord servers to support your community members.",
      icon: MessageSquare,
      href: "/docs/integrations/discord-integration",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      title: "WordPress Integration",
      description:
        "Easily add your chatbot to WordPress sites using our plugin or custom code.",
      icon: Puzzle,
      href: "/docs/integrations/wordpress-integration",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <>
      {/* Ensure that the page scrolls to the top when the page is loaded */}
      <ScrollToTop />
      <SEO
        title="Integrations | ChatterWise Documentation"
        description="Learn how to integrate your ChatterWise chatbot with various platforms including websites, Slack, Discord, and WordPress."
        canonicalUrl="/docs/integrations"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise integrations, chatbot integration, Slack integration, Discord integration, WordPress chatbot, website chatbot"
      />

      <div className="mx-auto h-lvh px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[{ name: "Integrations", href: "/docs/integrations" }]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Integrations
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
            <p>
              ChatterWise makes it easy to integrate your chatbots with various
              platforms and services. Whether you want to add your chatbot to
              your website, Slack workspace, Discord server, or WordPress site,
              we've got you covered. This section provides detailed guides for
              each integration option.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <Link to={integration.href} className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className={`p-3 ${integration.color} rounded-xl mr-4`}>
                      <integration.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {integration.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {integration.description}
                  </p>
                  <div className="text-primary-600 dark:text-primary-400 font-medium">
                    View integration guide →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Need a Custom Integration?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you need to integrate your chatbot with a platform not listed
              here, you can use our API to build a custom integration. Check out
              our API Reference for more information.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/api-reference"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Code className="h-4 w-4 mr-2" />
                API Reference
              </Link>
              <Link
                to="/docs/advanced-features/webhooks"
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
              >
                <Webhook className="h-4 w-4 mr-2" />
                Webhooks
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default IntegrationsPage;

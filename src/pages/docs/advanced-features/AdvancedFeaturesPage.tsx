import React from "react";
import { motion } from "framer-motion";
import { Palette, Webhook, Shield, Code } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";

const AdvancedFeaturesPage: React.FC = () => {
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
        name: "Advanced Features",
        item: "https://chatterwise.io/docs/advanced-features",
      },
    ],
  };

  const features = [
    {
      title: "Custom Templates",
      description:
        "Learn how to create and customize chat templates for your ChatterWise chatbot. Personalize your chatbot's appearance with custom CSS, components, and themes.",
      icon: Palette,
      href: "/docs/advanced-features/custom-templates",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Webhooks",
      description:
        "Use webhooks to integrate ChatterWise with your existing systems. Receive real-time notifications for chatbot events and automate workflows.",
      icon: Webhook,
      href: "/docs/advanced-features/webhooks",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Security Best Practices",
      description:
        "Learn how to secure your ChatterWise chatbot implementation with our comprehensive security best practices guide.",
      icon: Shield,
      href: "/docs/advanced-features/security-best-practices",
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    {
      title: "API Reference",
      description:
        "Comprehensive documentation for the ChatterWise API. Learn how to programmatically interact with your chatbots.",
      icon: Code,
      href: "/api-reference",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <>
      <SEO
        title="Advanced Features | ChatterWise Documentation"
        description="Explore advanced features of ChatterWise including custom templates, webhooks, security best practices, and API reference."
        canonicalUrl="/docs/advanced-features"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise advanced features, custom chatbot templates, webhooks, chatbot security, API reference"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[
            { name: "Advanced Features", href: "/docs/advanced-features" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced Features
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
            <p>
              Take your ChatterWise chatbots to the next level with our advanced
              features. This section covers customization options, integration
              capabilities, security best practices, and API documentation to
              help you build sophisticated chatbot solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <Link to={feature.href} className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <div className={`p-3 ${feature.color} rounded-xl mr-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {feature.description}
                  </p>
                  <div className="text-primary-600 dark:text-primary-400 font-medium">
                    Learn more →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Looking for Enterprise Features?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              ChatterWise Enterprise offers additional advanced features
              including SSO, dedicated infrastructure, custom data residency,
              and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/enterprise"
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
              >
                Learn about Enterprise
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdvancedFeaturesPage;

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, FileText, Globe } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { ScrollToTop } from "../../../components/utils/ScrollToTop";

const TutorialsPage: React.FC = () => {
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
    ],
  };

  const tutorials = [
    {
      title: "Building a Customer Support Bot",
      description:
        "Learn how to build an effective customer support chatbot with ChatterWise. This step-by-step tutorial covers knowledge base setup, training, and integration with your support systems.",
      icon: MessageSquare,
      href: "/docs/tutorials/customer-support-bot",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      difficulty: "Intermediate",
      timeEstimate: "30 minutes",
    },
    {
      title: "Creating a Lead Generation Bot",
      description:
        "Build a chatbot that engages visitors, qualifies leads, and captures contact information for your sales team.",
      icon: Users,
      href: "/docs/tutorials/lead-generation-bot",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      difficulty: "Intermediate",
      timeEstimate: "25 minutes",
    },
    {
      title: "FAQ Chatbot Setup",
      description:
        "Create a simple but effective FAQ chatbot to answer common questions about your products or services.",
      icon: FileText,
      href: "/docs/tutorials/faq-chatbot-setup",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      difficulty: "Beginner",
      timeEstimate: "15 minutes",
    },
    {
      title: "Multi-language Support",
      description:
        "Configure your chatbot to support multiple languages for international users.",
      icon: Globe,
      href: "/docs/tutorials/multi-language-support",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      difficulty: "Advanced",
      timeEstimate: "45 minutes",
    },
  ];

  return (
    <>
      <SEO
        title="Tutorials | ChatterWise Documentation"
        description="Step-by-step tutorials for building different types of chatbots with ChatterWise, including customer support bots, lead generation bots, FAQ bots, and more."
        canonicalUrl="/docs/tutorials"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="ChatterWise tutorials, chatbot tutorials, customer support bot, lead generation bot, FAQ chatbot, multi-language chatbot"
      />
      <ScrollToTop />

      <div className="mx-auto h-lvh px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[{ name: "Tutorials", href: "/docs/tutorials" }]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Tutorials
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
            <p>
              Our tutorials provide step-by-step guidance for building different
              types of chatbots with ChatterWise. Each tutorial focuses on a
              specific use case and walks you through the entire process from
              planning to deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-8">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <Link
                  to={tutorial.href}
                  className="flex flex-col md:flex-row md:items-center"
                >
                  <div className="flex items-start mb-4 md:mb-0 md:mr-6">
                    <div className={`p-3 ${tutorial.color} rounded-xl mr-4`}>
                      <tutorial.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {tutorial.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {tutorial.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Difficulty: {tutorial.difficulty}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        Time: {tutorial.timeEstimate}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4 text-primary-600 dark:text-primary-400 font-medium whitespace-nowrap">
                    View Tutorial →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Request a Tutorial
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don't see a tutorial for your specific use case? Let us know what
              you'd like to learn, and we'll consider adding it to our
              documentation.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Request a Tutorial
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default TutorialsPage;

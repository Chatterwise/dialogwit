import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Bot,
  Database,
  Globe,
  MessageSquare,
  BarChart3,
  Shield,
  Code,
  Puzzle,
  Users,
  Sparkles,
  Cpu,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// ScrollToTop component (for auto-scroll to top on navigation)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// GoBackButton component
const GoBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-8"
    >
      Go Back
    </button>
  );
};

const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Chatbots",
      description:
        "Create intelligent chatbots powered by advanced language models like GPT-3.5 and GPT-4. Our chatbots understand context, remember conversations, and provide accurate responses.",
      icon: Bot,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Knowledge Base Integration",
      description:
        "Train your chatbots with your own content. Upload documents, add text, or connect to your existing knowledge base to create chatbots that know your business inside and out.",
      icon: Database,
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Multi-Channel Deployment",
      description:
        "Deploy your chatbots anywhere your customers are. Integrate with your website, Slack, Discord, Microsoft Teams, and more with just a few clicks.",
      icon: Globe,
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      title: "Customizable Templates",
      description:
        "Choose from a variety of beautiful, responsive chat templates designed for different industries and use cases. Customize colors, themes, and positioning to match your brand.",
      icon: Puzzle,
      color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    },
    {
      title: "Advanced Analytics",
      description:
        "Gain insights into how your chatbots are performing with comprehensive analytics. Track conversations, user satisfaction, response times, and more.",
      icon: BarChart3,
      color:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Enterprise Security",
      description:
        "Keep your data safe with enterprise-grade security features. Role-based access control, audit logs, and data encryption ensure your information stays protected.",
      icon: Shield,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    },
    {
      title: "Developer API",
      description:
        "Access all ChatterWise features programmatically with our comprehensive API. Build custom integrations, automate workflows, and extend functionality.",
      icon: Code,
      color:
        "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Webhooks & Integrations",
      description:
        "Connect your chatbots to your existing tools and workflows with webhooks and integrations. Get notified of important events and automate actions.",
      icon: Zap,
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
    {
      title: "Team Collaboration",
      description:
        "Work together to build and improve your chatbots. Share access, collaborate on knowledge base content, and track changes with version history.",
      icon: Users,
      color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
    },
    {
      title: "Retrieval-Augmented Generation",
      description:
        "Our advanced RAG pipeline combines the power of large language models with your specific knowledge base, ensuring accurate and contextually relevant responses.",
      icon: Cpu,
      color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Conversation Memory",
      description:
        "Chatbots remember the context of conversations, allowing for natural, flowing interactions that feel human-like and personalized to each user.",
      icon: MessageSquare,
      color: "bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400",
    },
    {
      title: "Continuous Improvement",
      description:
        "Our platform learns from interactions and feedback, constantly improving response quality and accuracy over time.",
      icon: Sparkles,
      color:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoBackButton />
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Features
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover all the powerful features that make ChatterWise the leading
            platform for building AI-powered chatbots
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
            >
              <div
                className={`p-3 ${feature.color} rounded-xl inline-block mb-4`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-16 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to experience these features?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-3xl mx-auto">
              Start building your AI-powered chatbots today and transform how
              you interact with your customers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/auth"
                className="px-8 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md"
              >
                Get Started Free
              </a>
              <a
                href="/documentation"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturesPage;

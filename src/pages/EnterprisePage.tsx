import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Shield,
  Users,
  Zap,
  Clock,
  Server,
  Lock,
  FileText,
  CheckCircle,
  MessageSquare,
  Bot,
} from "lucide-react";

const EnterprisePage: React.FC = () => {
  const features = [
    {
      title: "Dedicated Infrastructure",
      description: "Private, isolated infrastructure for maximum performance and security",
      icon: Server,
    },
    {
      title: "Advanced Security",
      description: "Enterprise-grade security with SSO, role-based access control, and data encryption",
      icon: Shield,
    },
    {
      title: "Unlimited Chatbots",
      description: "Create and deploy as many chatbots as your organization needs",
      icon: Bot,
    },
    {
      title: "Priority Support",
      description: "24/7 dedicated support with guaranteed response times",
      icon: MessageSquare,
    },
    {
      title: "Custom Integrations",
      description: "Tailored integrations with your existing systems and workflows",
      icon: Zap,
    },
    {
      title: "SLA Guarantees",
      description: "99.9% uptime guarantee with financial backing",
      icon: Clock,
    },
    {
      title: "User Management",
      description: "Comprehensive user management with custom roles and permissions",
      icon: Users,
    },
    {
      title: "Data Residency",
      description: "Choose where your data is stored to meet compliance requirements",
      icon: Lock,
    },
  ];

  const industries = [
    {
      name: "Financial Services",
      description: "Secure chatbots for banking, insurance, and financial advisory services",
      icon: "💰",
    },
    {
      name: "Healthcare",
      description: "HIPAA-compliant solutions for patient support and medical information",
      icon: "🏥",
    },
    {
      name: "Government",
      description: "Secure, compliant chatbots for citizen services and internal operations",
      icon: "🏛️",
    },
    {
      name: "Education",
      description: "Support for students, faculty, and administrative staff",
      icon: "🎓",
    },
    {
      name: "Retail",
      description: "Enhance customer experience and support for large retail operations",
      icon: "🛍️",
    },
    {
      name: "Manufacturing",
      description: "Streamline operations and support for complex manufacturing processes",
      icon: "🏭",
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">ChatterWise Enterprise</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Advanced AI chatbot solutions tailored for large organizations with enterprise-grade security, scalability,
            and support
          </p>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 rounded-2xl p-8 text-white shadow-xl mb-16"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Enterprise-Grade AI for Your Organization</h2>
              <p className="text-primary-100 mb-6">
                Deploy powerful AI chatbots across your organization with the security, scalability, and control your
                enterprise demands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md text-center"
                >
                  Contact Sales
                </a>
                <a
                  href="#features"
                  className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Building2 className="h-48 w-48 text-white/20" />
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div id="features" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Enterprise Features</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to deploy AI chatbots at scale across your organization
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Industries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Industries We Serve</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Tailored solutions for enterprise needs across various sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{industry.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{industry.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Trusted by Enterprises</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See what our enterprise customers have to say about ChatterWise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-300 italic mb-6">
                "ChatterWise has transformed our customer support operations. We've reduced response times by 75% while
                maintaining high customer satisfaction scores. The enterprise features like SSO and role-based access
                control made it easy to deploy across our organization."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">John Doe</h4>
                  <p className="text-gray-500 dark:text-gray-400">CTO, Global Financial Services Inc.</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <p className="text-gray-600 dark:text-gray-300 italic mb-6">
                "The security and compliance features of ChatterWise Enterprise were key factors in our decision. We
                needed a solution that could meet our strict regulatory requirements while providing cutting-edge AI
                capabilities. ChatterWise delivered on all fronts."
              </p>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  JS
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Jane Smith</h4>
                  <p className="text-gray-500 dark:text-gray-400">CISO, Healthcare Systems Corporation</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          id="contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact Our Enterprise Team</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get in touch with our enterprise sales team to learn how ChatterWise can help your organization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="Tell us about your needs"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-md"
                >
                  Contact Sales
                </button>
              </form>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Enterprise Benefits</h3>
              <ul className="space-y-4">
                {[
                  "Dedicated account manager and support team",
                  "Custom onboarding and training",
                  "Service Level Agreements (SLAs)",
                  "Custom development and integrations",
                  "Advanced security and compliance features",
                  "Volume discounts and flexible billing",
                  "Early access to new features",
                  "Quarterly business reviews",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Prefer to talk?</h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Schedule a call with our enterprise team to discuss your specific needs.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Schedule a Demo
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnterprisePage;
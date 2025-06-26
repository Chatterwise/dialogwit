import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Target,
  Heart,
  Globe,
  Bot,
  Sparkles,
  Rocket,
  Users,
} from "lucide-react";

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

const AboutUsPage: React.FC = () => {
  const team = [
    {
      name: "Miguel Rubio",
      role: "Co-Founder",
      bio: "Passionate about building accessible technology that solves real-world problems.",
      avatar: "MR",
      color: "bg-blue-500",
    },
    {
      name: "Gabriel Martinez",
      role: "Co-Founder",
      bio: "Dedicated to making AI simple and powerful for everyone.",
      avatar: "GM",
      color: "bg-purple-500",
    },
  ];

  const values = [
    {
      title: "Customer First",
      description:
        "We're obsessed with solving real problems for our customers and helping them succeed.",
      icon: Heart,
    },
    {
      title: "Innovation",
      description:
        "We push the boundaries of what's possible with AI to create better experiences.",
      icon: Sparkles,
    },
    {
      title: "Accessibility",
      description:
        "We believe advanced AI should be accessible to businesses of all sizes.",
      icon: Users,
    },
    {
      title: "Transparency",
      description:
        "We're open about how our technology works and the limitations of AI.",
      icon: Globe,
    },
  ];

  const timeline = [
    {
      year: "2025",
      title: "ChatterWise Founded",
      description:
        "Miguel and Gabriel built the first prototype of ChatterWise at the Bolt.new hackathon.",
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
            About ChatterWise
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We are on a mission to make AI-powered conversations accessible to
            everyone—starting with a simple idea at a hackathon.
          </p>
        </motion.div>

        {/* Mission and Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              To empower businesses and individuals with easy-to-use AI
              chatbots, making advanced technology simple and accessible.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Our Vision
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              A world where anyone can create intelligent chatbots—no coding
              required—to transform how we communicate online.
            </p>
          </div>
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Story
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  ChatterWise began as a passion project at the Bolt.new
                  hackathon. What started as a weekend experiment quickly turned
                  into something bigger.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We—Miguel Rubio and Gabriel Martinez—are the founders behind
                  ChatterWise. United by a shared vision to make AI chatbot
                  technology simple and accessible, we built the first version
                  of ChatterWise in just a few days.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Today, we continue to develop and improve ChatterWise, driven
                  by our belief that everyone should be able to harness the
                  power of AI—no technical expertise required.
                </p>
              </div>
              <div className="flex justify-center">
                <Bot className="h-64 w-64 text-primary-200 dark:text-primary-900" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Team
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the founders behind ChatterWise
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`h-16 w-16 ${member.color} rounded-full flex items-center justify-center text-white font-bold text-xl mr-4`}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-primary-600 dark:text-primary-400">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-200 dark:bg-primary-800"></div>
              <div className="space-y-12">
                {timeline.map((event, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-0 mt-1 -ml-2">
                      <div className="h-4 w-4 rounded-full bg-primary-500 dark:bg-primary-400 ring-4 ring-white dark:ring-gray-800"></div>
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                          {event.year}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-3">
                          {event.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;

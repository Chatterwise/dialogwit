import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Award,
  Zap,
  Heart,
  Globe,
  MessageSquare,
  Bot,
  Sparkles,
  Rocket,
  Briefcase,
  GraduationCap,
} from "lucide-react";

const AboutUsPage: React.FC = () => {
  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Co-Founder",
      bio: "Former AI research scientist with a passion for making advanced AI accessible to businesses of all sizes.",
      avatar: "AJ",
      color: "bg-blue-500",
    },
    {
      name: "Sophia Chen",
      role: "CTO & Co-Founder",
      bio: "Machine learning expert with 10+ years of experience building conversational AI systems.",
      avatar: "SC",
      color: "bg-purple-500",
    },
    {
      name: "Marcus Williams",
      role: "Head of Product",
      bio: "Product leader focused on creating intuitive, powerful tools that solve real business problems.",
      avatar: "MW",
      color: "bg-green-500",
    },
    {
      name: "Priya Patel",
      role: "VP of Engineering",
      bio: "Engineering leader with expertise in building scalable, secure cloud platforms.",
      avatar: "PP",
      color: "bg-red-500",
    },
    {
      name: "David Kim",
      role: "Head of AI Research",
      bio: "PhD in Natural Language Processing with a focus on context-aware conversational systems.",
      avatar: "DK",
      color: "bg-yellow-500",
    },
    {
      name: "Emily Rodriguez",
      role: "VP of Customer Success",
      bio: "Customer experience expert dedicated to helping businesses get the most out of ChatterWise.",
      avatar: "ER",
      color: "bg-pink-500",
    },
  ];

  const values = [
    {
      title: "Customer First",
      description: "We're obsessed with solving real problems for our customers and helping them succeed.",
      icon: Heart,
    },
    {
      title: "Innovation",
      description: "We push the boundaries of what's possible with AI to create better experiences.",
      icon: Sparkles,
    },
    {
      title: "Accessibility",
      description: "We believe advanced AI should be accessible to businesses of all sizes.",
      icon: Users,
    },
    {
      title: "Transparency",
      description: "We're open about how our technology works and the limitations of AI.",
      icon: Globe,
    },
  ];

  const timeline = [
    {
      year: "2023",
      title: "ChatterWise Founded",
      description: "Alex and Sophia founded ChatterWise with a mission to make advanced AI chatbots accessible to all businesses.",
    },
    {
      year: "2023",
      title: "Seed Funding",
      description: "Raised $5M in seed funding to build the first version of the ChatterWise platform.",
    },
    {
      year: "2024",
      title: "Beta Launch",
      description: "Launched the beta version of ChatterWise with 100 early customers.",
    },
    {
      year: "2024",
      title: "Series A Funding",
      description: "Raised $20M in Series A funding to scale the platform and expand the team.",
    },
    {
      year: "2025",
      title: "Enterprise Launch",
      description: "Launched ChatterWise Enterprise with advanced security and compliance features.",
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanded to Europe and Asia with new offices in London and Singapore.",
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About ChatterWise</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to transform how businesses communicate with their customers through the power of AI
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300">
              To democratize access to advanced AI technology by providing businesses of all sizes with powerful,
              easy-to-use chatbot solutions that transform how they communicate with their customers.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-600 dark:text-gray-300">
              A world where every business can provide exceptional, personalized customer experiences through intelligent
              conversational AI that understands context, learns continuously, and delivers real value.
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  ChatterWise was founded in 2023 by Alex Johnson and Sophia Chen, who met while working on conversational
                  AI research at a leading tech company. They shared a vision of making advanced AI chatbot technology
                  accessible to businesses of all sizes, not just tech giants with massive resources.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Frustrated by the complexity and cost of existing solutions, they set out to build a platform that
                  combined state-of-the-art AI capabilities with an intuitive interface that anyone could use, regardless
                  of technical expertise.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Today, ChatterWise powers thousands of chatbots across industries, from small businesses to Fortune 500
                  companies, helping them provide exceptional customer experiences, automate routine tasks, and gain
                  valuable insights from customer conversations.
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the talented team behind ChatterWise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400">{member.role}</p>
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Journey</h2>
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white ml-3">{event.title}</h3>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Join Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.7 }}
          className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-primary-100 mb-8 max-w-3xl mx-auto">
              We're always looking for talented individuals who are passionate about AI and want to make a difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#"
                className="px-8 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-md"
              >
                <Briefcase className="h-5 w-5 mr-2 inline-block" />
                View Open Positions
              </a>
              <a
                href="#"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                <GraduationCap className="h-5 w-5 mr-2 inline-block" />
                Internship Program
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;
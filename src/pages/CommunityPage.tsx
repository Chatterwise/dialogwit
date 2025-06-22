import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  BookOpen,
  Github,
  Twitter,
  Slack,
  Youtube,
  Calendar,
  Award,
  Heart,
  Star,
} from "lucide-react";

const CommunityPage: React.FC = () => {
  const upcomingEvents = [
    {
      title: "ChatterWise Community Meetup",
      date: "June 15, 2025",
      time: "1:00 PM - 2:30 PM EST",
      location: "Virtual",
      description: "Join us for our monthly community meetup to discuss the latest features and share tips.",
    },
    {
      title: "Building Enterprise Chatbots Workshop",
      date: "June 22, 2025",
      time: "11:00 AM - 1:00 PM EST",
      location: "Virtual",
      description: "Learn how to build and deploy enterprise-grade chatbots with advanced security features.",
    },
    {
      title: "ChatterWise Developer Conference",
      date: "July 10-12, 2025",
      time: "9:00 AM - 5:00 PM EST",
      location: "New York City + Virtual",
      description: "Our annual developer conference featuring workshops, talks, and networking opportunities.",
    },
  ];

  const communitySpotlights = [
    {
      name: "Sarah Johnson",
      role: "Community Champion",
      contribution: "Created comprehensive tutorials for healthcare chatbots",
      avatar: "SJ",
      color: "bg-blue-500",
    },
    {
      name: "Michael Chen",
      role: "Plugin Developer",
      contribution: "Developed the popular Salesforce integration plugin",
      avatar: "MC",
      color: "bg-green-500",
    },
    {
      name: "Priya Patel",
      role: "Knowledge Base Expert",
      contribution: "Shared best practices for organizing large knowledge bases",
      avatar: "PP",
      color: "bg-purple-500",
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">ChatterWise Community</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of developers, businesses, and AI enthusiasts building the future of conversational AI
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { label: "Community Members", value: "10,000+", icon: Users },
            { label: "Forum Posts", value: "25,000+", icon: MessageSquare },
            { label: "Knowledge Articles", value: "500+", icon: BookOpen },
            { label: "Open Source Projects", value: "50+", icon: Github },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center"
            >
              <stat.icon className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Join the Community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Join the Conversation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                platform: "Discord",
                description: "Chat with community members and get real-time help",
                icon: MessageSquare,
                color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
                link: "#",
              },
              {
                platform: "GitHub",
                description: "Contribute to open source projects and extensions",
                icon: Github,
                color: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
                link: "#",
              },
              {
                platform: "Twitter",
                description: "Follow us for news, tips, and community highlights",
                icon: Twitter,
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                link: "#",
              },
              {
                platform: "Slack",
                description: "Join our Slack workspace for team collaboration",
                icon: Slack,
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                link: "#",
              },
            ].map((platform) => (
              <a
                key={platform.platform}
                href={platform.link}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`p-3 ${platform.color} rounded-full inline-block mb-4`}>
                  <platform.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{platform.platform}</h3>
                <p className="text-gray-600 dark:text-gray-400">{platform.description}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {event.date} • {event.time}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-500">{event.location}</span>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    Register →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Community Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Community Spotlight</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communitySpotlights.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`h-12 w-12 ${member.color} rounded-full flex items-center justify-center text-white font-bold mr-4`}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{member.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{member.contribution}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Community Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Developer Forum",
                description: "Ask questions, share knowledge, and connect with other developers",
                icon: MessageSquare,
                link: "#",
              },
              {
                title: "YouTube Tutorials",
                description: "Watch step-by-step tutorials and best practices videos",
                icon: Youtube,
                link: "#",
              },
              {
                title: "Community Blog",
                description: "Read articles, case studies, and success stories from the community",
                icon: BookOpen,
                link: "#",
              },
            ].map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl inline-block mb-4">
                  <resource.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{resource.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Contribute */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800 mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ways to Contribute</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              There are many ways to contribute to the ChatterWise community and help make it even better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Share Your Knowledge",
                description: "Write tutorials, answer questions, or create templates for the community",
                icon: BookOpen,
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
              },
              {
                title: "Open Source Contributions",
                description: "Contribute to our open source projects, report bugs, or suggest features",
                icon: Github,
                color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
              },
              {
                title: "Become a Champion",
                description: "Join our community champions program and help others succeed",
                icon: Award,
                color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
              },
            ].map((way, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`p-3 ${way.color} rounded-xl inline-block mb-4`}>
                  <way.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{way.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{way.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center"
        >
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community Newsletter</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Stay up to date with the latest news, events, and resources from the ChatterWise community
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
              />
              <button className="px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-md">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              We'll never share your email. Unsubscribe at any time.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;
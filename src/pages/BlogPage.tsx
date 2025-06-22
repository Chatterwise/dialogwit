import React from "react";
import { motion } from "framer-motion";
import { Calendar, User, Clock, Tag, ChevronRight, Search } from "lucide-react";

const BlogPage: React.FC = () => {
  const featuredPost = {
    title: "Building Enterprise-Grade Chatbots with RAG Technology",
    excerpt:
      "Learn how Retrieval-Augmented Generation (RAG) is transforming enterprise chatbots by combining the power of large language models with your specific knowledge base.",
    author: "Sarah Johnson",
    date: "May 15, 2025",
    readTime: "8 min read",
    category: "Technology",
    image: "https://images.pexels.com/photos/7567557/pexels-photo-7567557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  };

  const posts = [
    {
      title: "5 Ways to Optimize Your Chatbot's Knowledge Base",
      excerpt:
        "Discover proven strategies to organize and optimize your chatbot's knowledge base for better accuracy and performance.",
      author: "Michael Chen",
      date: "May 10, 2025",
      readTime: "6 min read",
      category: "Best Practices",
      image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      title: "The Future of Customer Support: AI Chatbots in 2025",
      excerpt:
        "Explore how AI chatbots are revolutionizing customer support and what to expect in the coming years.",
      author: "Emily Rodriguez",
      date: "May 5, 2025",
      readTime: "5 min read",
      category: "Industry Trends",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      title: "Case Study: How FinTech Corp Reduced Support Costs by 60%",
      excerpt:
        "Learn how a leading fintech company implemented ChatterWise to dramatically reduce their customer support costs.",
      author: "David Kim",
      date: "April 28, 2025",
      readTime: "7 min read",
      category: "Case Study",
      image: "https://images.pexels.com/photos/7567535/pexels-photo-7567535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      title: "Securing Your AI Chatbot: Best Practices for Enterprise",
      excerpt:
        "Implement these security best practices to ensure your enterprise chatbot meets the highest security standards.",
      author: "Priya Patel",
      date: "April 22, 2025",
      readTime: "9 min read",
      category: "Security",
      image: "https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      title: "Integrating ChatterWise with Your CRM: A Complete Guide",
      excerpt:
        "Follow this step-by-step guide to seamlessly integrate your ChatterWise chatbots with popular CRM platforms.",
      author: "James Wilson",
      date: "April 15, 2025",
      readTime: "10 min read",
      category: "Tutorials",
      image: "https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      title: "Measuring Chatbot ROI: Key Metrics for Success",
      excerpt:
        "Learn which metrics matter most when evaluating the ROI of your AI chatbot implementation.",
      author: "Lisa Thompson",
      date: "April 8, 2025",
      readTime: "7 min read",
      category: "Analytics",
      image: "https://images.pexels.com/photos/7567616/pexels-photo-7567616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

  const categories = [
    "All",
    "Technology",
    "Best Practices",
    "Industry Trends",
    "Case Studies",
    "Tutorials",
    "Security",
    "Analytics",
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">ChatterWise Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Insights, tutorials, and news about AI chatbots and conversational intelligence
          </p>
        </motion.div>

        {/* Search and Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    category === "All"
                      ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div
                className="h-64 lg:h-auto bg-cover bg-center"
                style={{ backgroundImage: `url(${featuredPost.image})` }}
              ></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                  <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {featuredPost.author.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{featuredPost.author}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        {featuredPost.date}
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3 mr-1" />
                        {featuredPost.readTime}
                      </div>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
                  >
                    Read More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Recent Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image})` }}
                ></div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold mr-2 text-xs">
                        {post.author.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
                        <p className="text-gray-500 dark:text-gray-400">{post.date}</p>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                    >
                      Read
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-md"
            >
              View All Articles
            </a>
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Get the latest articles, tutorials, and news about AI chatbots and conversational intelligence delivered
              straight to your inbox.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white bg-white/10 placeholder-white/60 text-white border border-white/20"
                />
                <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-primary-200 mt-3">
                We'll never share your email. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;
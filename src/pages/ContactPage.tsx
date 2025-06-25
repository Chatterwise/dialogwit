import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Send,
  CheckCircle,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
    }, 1000);
  };

  const offices = [
    {
      city: "San Francisco",
      address: "123 Market Street, Suite 400, San Francisco, CA 94105",
      phone: "+1 (415) 555-1234",
      email: "sf@chatterwise.io",
      hours: "9:00 AM - 5:00 PM PST",
    },
    {
      city: "New York",
      address: "456 Madison Avenue, 8th Floor, New York, NY 10022",
      phone: "+1 (212) 555-5678",
      email: "nyc@chatterwise.io",
      hours: "9:00 AM - 5:00 PM EST",
    },
    {
      city: "London",
      address: "10 Finsbury Square, London, EC2A 1AF, UK",
      phone: "+44 20 7123 4567",
      email: "london@chatterwise.io",
      hours: "9:00 AM - 5:00 PM GMT",
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Have questions or need help? We're here for you. Reach out to our
            team and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              title: "Chat With Us",
              description:
                "Get immediate help from our support team through live chat",
              icon: MessageSquare,
              action: "Start Chat",
              link: "#chat",
              color:
                "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            },
            {
              title: "Email Us",
              description: "Send us an email and we'll respond within 24 hours",
              icon: Mail,
              action: "support@chatterwise.io",
              link: "mailto:support@chatterwise.io",
              color:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
            },
            {
              title: "Call Us",
              description: "Speak directly with our customer support team",
              icon: Phone,
              action: "+1 (800) 555-0123",
              link: "tel:+18005550123",
              color:
                "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
            },
          ].map((option) => (
            <div
              key={option.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
            >
              <div
                className={`p-3 ${option.color} rounded-xl inline-block mb-4`}
              >
                <option.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {option.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {option.description}
              </p>
              <a
                href={option.link}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {option.action} →
              </a>
            </div>
          ))}
        </motion.div>

        {/* Contact Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send Us a Message
            </h2>
            {formSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Thank you for reaching out. We'll get back to you as soon as
                  possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-900"
                    placeholder="Your message..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-md flex items-center justify-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </button>
              </form>
            )}
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="h-96 bg-gray-200 dark:bg-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-primary-500 dark:text-primary-400" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  Interactive map would be displayed here in a production
                  environment
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Office Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Offices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {office.city}
                </h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{office.address}</p>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{office.phone}</p>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{office.email}</p>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{office.hours}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Connect With Us
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Follow us on social media to stay updated with the latest news,
            features, and community events
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                name: "Twitter",
                icon: Twitter,
                link: "#",
                color: "bg-blue-500 hover:bg-blue-600",
              },
              {
                name: "LinkedIn",
                icon: Linkedin,
                link: "#",
                color: "bg-blue-700 hover:bg-blue-800",
              },
              {
                name: "GitHub",
                icon: Github,
                link: "#",
                color:
                  "bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600",
              },
              {
                name: "Website",
                icon: Globe,
                link: "#",
                color: "bg-green-600 hover:bg-green-700",
              },
            ].map((social) => (
              <a
                key={social.name}
                href={social.link}
                className={`p-4 ${social.color} text-white rounded-full transition-colors`}
                aria-label={social.name}
              >
                <social.icon className="h-6 w-6" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;

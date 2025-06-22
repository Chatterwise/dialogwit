import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, FileText, Lock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const LegalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "cookies" | "security">("privacy");
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter((i) => i !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  const privacyFaqs = [
    {
      question: "What personal information do you collect?",
      answer:
        "We collect information that you provide directly to us, such as your name, email address, and any other information you choose to provide. We also collect certain information automatically when you use our services, including IP address, device information, and usage data.",
    },
    {
      question: "How do you use my personal information?",
      answer:
        "We use your personal information to provide and improve our services, communicate with you, and comply with legal obligations. We may also use your information for research and analytics purposes to better understand how users interact with our platform.",
    },
    {
      question: "Do you share my personal information with third parties?",
      answer:
        "We may share your personal information with service providers who perform services on our behalf, with your consent, or as required by law. We do not sell your personal information to third parties.",
    },
    {
      question: "How do you protect my personal information?",
      answer:
        "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, disclosure, alteration, and destruction. These measures include encryption, access controls, and regular security assessments.",
    },
    {
      question: "What are my privacy rights?",
      answer:
        "Depending on your location, you may have the right to access, correct, delete, or restrict the processing of your personal information. You may also have the right to data portability and to withdraw your consent at any time.",
    },
  ];

  const termsFaqs = [
    {
      question: "What are the terms of using ChatterWise?",
      answer:
        "By using ChatterWise, you agree to abide by our Terms of Service, which govern your access to and use of our platform. These terms include your responsibilities, limitations of liability, and dispute resolution procedures.",
    },
    {
      question: "What are the usage restrictions?",
      answer:
        "You may not use ChatterWise for any illegal or unauthorized purpose, including but not limited to violating any laws, infringing on intellectual property rights, or sending spam. You also may not attempt to probe, scan, or test the vulnerability of our systems.",
    },
    {
      question: "What happens if I violate the terms?",
      answer:
        "If you violate our Terms of Service, we may suspend or terminate your access to ChatterWise. We may also take appropriate legal action, including seeking monetary damages or an injunction.",
    },
    {
      question: "Can the terms change over time?",
      answer:
        "Yes, we may modify the Terms of Service at any time. We will notify you of any material changes by posting the new terms on our website or sending you an email. Your continued use of ChatterWise after such modifications constitutes your acceptance of the updated terms.",
    },
    {
      question: "What about intellectual property rights?",
      answer:
        "ChatterWise and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of any content you upload to our platform.",
    },
  ];

  const cookiesFaqs = [
    {
      question: "What cookies do you use?",
      answer:
        "We use essential cookies that are necessary for the functioning of our website, as well as analytical cookies that help us understand how users interact with our site. We may also use marketing cookies to deliver personalized content and advertisements.",
    },
    {
      question: "Can I opt out of cookies?",
      answer:
        "Yes, you can manage your cookie preferences through our cookie consent manager. You can choose to accept or reject non-essential cookies. You can also configure your browser to block all cookies, but this may affect your experience on our website.",
    },
    {
      question: "How long do cookies stay on my device?",
      answer:
        "The duration of cookies on your device depends on the type of cookie. Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device until they expire or you delete them.",
    },
    {
      question: "Do you use third-party cookies?",
      answer:
        "Yes, we use third-party cookies from services like Google Analytics to help us analyze how users use our website. These third parties may also use cookies for their own purposes, such as to personalize advertisements.",
    },
    {
      question: "How do I delete cookies?",
      answer:
        "You can delete cookies through your browser settings. The process varies depending on the browser you use. Most browsers also allow you to prevent the setting of cookies in the first place.",
    },
  ];

  const securityFaqs = [
    {
      question: "How do you secure my data?",
      answer:
        "We implement industry-standard security measures to protect your data, including encryption in transit and at rest, access controls, regular security assessments, and continuous monitoring for suspicious activities.",
    },
    {
      question: "Do you have a bug bounty program?",
      answer:
        "Yes, we have a responsible disclosure program for security researchers. If you discover a security vulnerability, please report it to security@chatterwise.ai. We offer rewards for eligible reports based on the severity and impact of the vulnerability.",
    },
    {
      question: "How do you handle data breaches?",
      answer:
        "In the event of a data breach, we will promptly notify affected users and relevant authorities as required by law. We will also take immediate steps to mitigate the impact and prevent future breaches.",
    },
    {
      question: "Are you compliant with security standards?",
      answer:
        "Yes, we comply with various security standards and regulations, including SOC 2, ISO 27001, and GDPR. We regularly undergo third-party audits to ensure our compliance with these standards.",
    },
    {
      question: "How can I report a security concern?",
      answer:
        "If you have a security concern or want to report a potential security issue, please contact our security team at security@chatterwise.ai. We take all security reports seriously and will investigate promptly.",
    },
  ];

  const getFaqs = () => {
    switch (activeTab) {
      case "privacy":
        return privacyFaqs;
      case "terms":
        return termsFaqs;
      case "cookies":
        return cookiesFaqs;
      case "security":
        return securityFaqs;
      default:
        return privacyFaqs;
    }
  };

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Legal Information</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our commitment to privacy, security, and legal compliance
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: "privacy", label: "Privacy Policy", icon: Lock },
              { id: "terms", label: "Terms of Service", icon: FileText },
              { id: "cookies", label: "Cookie Policy", icon: AlertTriangle },
              { id: "security", label: "Security", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl text-sm font-medium flex items-center ${
                  activeTab === tab.id
                    ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: May 1, 2025
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-12"
        >
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300">
            {activeTab === "privacy" && (
              <>
                <h2>Privacy Policy</h2>
                <p>
                  At ChatterWise, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our platform.
                </p>
                <h3>Information We Collect</h3>
                <p>
                  We collect information that you provide directly to us, such as your name, email address, and any other
                  information you choose to provide. We also collect certain information automatically when you use our
                  services, including IP address, device information, and usage data.
                </p>
                <h3>How We Use Your Information</h3>
                <p>
                  We use your personal information to provide and improve our services, communicate with you, and comply
                  with legal obligations. We may also use your information for research and analytics purposes to better
                  understand how users interact with our platform.
                </p>
                <h3>Information Sharing</h3>
                <p>
                  We may share your personal information with service providers who perform services on our behalf, with
                  your consent, or as required by law. We do not sell your personal information to third parties.
                </p>
                <h3>Data Security</h3>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, disclosure, alteration, and destruction. These measures include
                  encryption, access controls, and regular security assessments.
                </p>
                <h3>Your Rights</h3>
                <p>
                  Depending on your location, you may have the right to access, correct, delete, or restrict the
                  processing of your personal information. You may also have the right to data portability and to
                  withdraw your consent at any time.
                </p>
              </>
            )}

            {activeTab === "terms" && (
              <>
                <h2>Terms of Service</h2>
                <p>
                  These Terms of Service govern your access to and use of ChatterWise's platform. By using our services,
                  you agree to be bound by these terms.
                </p>
                <h3>Acceptable Use</h3>
                <p>
                  You may use ChatterWise only for lawful purposes and in accordance with these Terms of Service. You
                  agree not to use ChatterWise:
                </p>
                <ul>
                  <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                  <li>To transmit, or procure the sending of, any advertising or promotional material</li>
                  <li>To impersonate or attempt to impersonate ChatterWise, a ChatterWise employee, another user, or any other person or entity</li>
                  <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                </ul>
                <h3>Intellectual Property</h3>
                <p>
                  ChatterWise and its original content, features, and functionality are owned by us and are protected by
                  international copyright, trademark, patent, trade secret, and other intellectual property laws. You
                  retain ownership of any content you upload to our platform.
                </p>
                <h3>Termination</h3>
                <p>
                  We may terminate or suspend your access to ChatterWise immediately, without prior notice or liability,
                  for any reason whatsoever, including without limitation if you breach the Terms of Service.
                </p>
                <h3>Limitation of Liability</h3>
                <p>
                  In no event shall ChatterWise, nor its directors, employees, partners, agents, suppliers, or affiliates,
                  be liable for any indirect, incidental, special, consequential, or punitive damages, including without
                  limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
                <h3>Changes to Terms</h3>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will
                  provide notice of any material changes by posting the new Terms on our website or sending you an email.
                </p>
              </>
            )}

            {activeTab === "cookies" && (
              <>
                <h2>Cookie Policy</h2>
                <p>
                  This Cookie Policy explains how ChatterWise uses cookies and similar technologies to recognize you when
                  you visit our website. It explains what these technologies are and why we use them, as well as your
                  rights to control our use of them.
                </p>
                <h3>What Are Cookies?</h3>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device when you visit a
                  website. Cookies are widely used by website owners in order to make their websites work, or to work
                  more efficiently, as well as to provide reporting information.
                </p>
                <h3>Types of Cookies We Use</h3>
                <p>We use the following types of cookies:</p>
                <ul>
                  <li>
                    <strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly
                    and cannot be switched off in our systems.
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so
                    we can measure and improve the performance of our site.
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced
                    functionality and personalization.
                  </li>
                  <li>
                    <strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising
                    partners to build a profile of your interests.
                  </li>
                </ul>
                <h3>Managing Cookies</h3>
                <p>
                  Most web browsers allow you to control cookies through their settings preferences. However, if you
                  limit the ability of websites to set cookies, you may worsen your overall user experience, since it
                  will no longer be personalized to you.
                </p>
                <h3>Changes to This Cookie Policy</h3>
                <p>
                  We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or
                  for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy
                  regularly to stay informed about our use of cookies and related technologies.
                </p>
              </>
            )}

            {activeTab === "security" && (
              <>
                <h2>Security Policy</h2>
                <p>
                  At ChatterWise, security is a top priority. We are committed to protecting your data and ensuring the
                  security of our platform. This Security Policy outlines the measures we take to safeguard your
                  information.
                </p>
                <h3>Data Protection</h3>
                <p>
                  We implement industry-standard security measures to protect your data, including encryption in transit
                  and at rest, access controls, regular security assessments, and continuous monitoring for suspicious
                  activities.
                </p>
                <h3>Infrastructure Security</h3>
                <p>
                  Our infrastructure is hosted on secure cloud providers that maintain compliance with various security
                  standards. We implement network security measures, including firewalls, intrusion detection systems,
                  and regular vulnerability scanning.
                </p>
                <h3>Access Control</h3>
                <p>
                  We follow the principle of least privilege, ensuring that employees only have access to the data and
                  systems necessary for their job functions. We implement multi-factor authentication, strong password
                  policies, and regular access reviews.
                </p>
                <h3>Security Compliance</h3>
                <p>
                  We comply with various security standards and regulations, including SOC 2, ISO 27001, and GDPR. We
                  regularly undergo third-party audits to ensure our compliance with these standards.
                </p>
                <h3>Incident Response</h3>
                <p>
                  We have a comprehensive incident response plan in place to address security incidents promptly and
                  effectively. In the event of a data breach, we will notify affected users and relevant authorities as
                  required by law.
                </p>
                <h3>Security Updates</h3>
                <p>
                  We regularly update our systems and applications to address security vulnerabilities. We also conduct
                  security awareness training for our employees to ensure they understand and follow security best
                  practices.
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {getFaqs().map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {expandedFaqs.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {expandedFaqs.includes(index) && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Have More Questions?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about our privacy policy, terms of service, or security practices, please don't
              hesitate to contact us.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white rounded-xl font-semibold hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-md"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Our Legal Team
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalPage;
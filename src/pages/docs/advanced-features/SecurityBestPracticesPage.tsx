import React from "react";
import { motion } from "framer-motion";
import { Key, AlertTriangle, CheckCircle } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";

const SecurityBestPracticesPage: React.FC = () => {
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
      {
        "@type": "ListItem",
        position: 3,
        name: "Security Best Practices",
        item: "https://chatterwise.io/docs/advanced-features/security-best-practices",
      },
    ],
  };

  return (
    <>
      <SEO
        title="Security Best Practices | ChatterWise Documentation"
        description="Learn how to secure your ChatterWise chatbot implementation with our comprehensive security best practices guide. Protect your data and users with these essential security measures."
        canonicalUrl="/docs/advanced-features/security-best-practices"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="chatbot security, API key security, data protection, webhook security, rate limiting, access control, secure integration"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[
            { name: "Advanced Features", href: "/docs/advanced-features" },
            {
              name: "Security Best Practices",
              href: "/docs/advanced-features/security-best-practices",
            },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Security Best Practices
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Security is a critical aspect of any chatbot implementation. This
              guide outlines best practices for securing your ChatterWise
              chatbot and protecting your data and users.
            </p>

            <h2>API Key Security</h2>
            <p>
              Your ChatterWise API keys provide access to your account and
              chatbots. Protecting these keys is essential:
            </p>

            <div className="not-prose">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 my-8">
                <div className="flex items-center mb-4">
                  <Key className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    API Key Best Practices
                  </h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Never expose API keys in client-side code
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        API keys should always be kept server-side. Never
                        include them in JavaScript that runs in the browser.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Use environment variables
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Store API keys in environment variables rather than
                        hardcoding them in your application.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Implement key rotation
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Regularly rotate your API keys to limit the impact of
                        potential exposure.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Use different keys for different environments
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use separate API keys for development, staging, and
                        production environments.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        Limit API key permissions
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Use scoped API keys with the minimum permissions
                        necessary for your use case.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 my-8">
              <h3 className="text-red-800 dark:text-red-300 font-semibold mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Common Security Mistakes
              </h3>
              <ul className="space-y-2 text-red-700 dark:text-red-400">
                <li>Including API keys in client-side JavaScript</li>
                <li>Committing API keys to public repositories</li>
                <li>Using the same API key across multiple applications</li>
                <li>Not revoking compromised API keys immediately</li>
                <li>Sharing API keys with unauthorized team members</li>
              </ul>
            </div>

            <h2>Secure Integration</h2>
            <p>
              When integrating ChatterWise with your website or application,
              follow these security practices:
            </p>

            <h3>Website Integration</h3>
            <ul>
              <li>
                <strong>Use a proxy server:</strong> Instead of including your
                API key in the client-side code, set up a proxy server that
                makes API calls on behalf of your frontend.
                <pre className="bg-gray-800 text-green-600  p-3 rounded-lg text-sm">
                  {`// Server-side code (Node.js example)
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.chatterwise.io/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${process.env.CHATTERWISE_API_KEY}\`
      },
      body: JSON.stringify({
        botId: req.body.botId,
        message: req.body.message
      })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with ChatterWise' });
  }
});`}
                </pre>
              </li>
              <li>
                <strong>Implement CORS properly:</strong> Configure your server
                to only allow requests from trusted domains.
              </li>
              <li>
                <strong>Use HTTPS:</strong> Always use HTTPS to encrypt data in
                transit.
              </li>
            </ul>

            <h3>Webhook Security</h3>
            <ul>
              <li>
                <strong>Verify webhook signatures:</strong> Always verify that
                webhook requests are coming from ChatterWise by checking the
                signature.
              </li>
              <li>
                <strong>Use HTTPS for webhook endpoints:</strong> Ensure your
                webhook endpoint uses HTTPS to encrypt data in transit.
              </li>
              <li>
                <strong>Implement timeouts:</strong> Set appropriate timeouts
                for webhook processing to prevent resource exhaustion.
              </li>
            </ul>

            <h2>Data Protection</h2>
            <p>
              Protecting user data is crucial for maintaining trust and
              complying with regulations:
            </p>

            <h3>Sensitive Information Handling</h3>
            <ul>
              <li>
                <strong>Configure data retention policies:</strong> Set
                appropriate data retention periods for chat logs and user
                information.
              </li>
              <li>
                <strong>Implement PII detection:</strong> Use ChatterWise's PII
                detection feature to identify and handle personally identifiable
                information appropriately.
                <pre className="bg-gray-800 text-green-600 p-3 rounded-lg text-sm">
                  {`// Enable PII detection in your chatbot settings
{
  "pii_detection": {
    "enabled": true,
    "action": "redact", // Options: "redact", "reject", "log"
    "types": ["email", "phone", "credit_card", "ssn"]
  }
}`}
                </pre>
              </li>
              <li>
                <strong>Use data encryption:</strong> Ensure that sensitive data
                is encrypted both in transit and at rest.
              </li>
            </ul>

            <h3>Compliance Considerations</h3>
            <ul>
              <li>
                <strong>GDPR compliance:</strong> Implement mechanisms for data
                subject access requests and the right to be forgotten.
              </li>
              <li>
                <strong>CCPA compliance:</strong> Provide clear privacy notices
                and options for users to opt out of data collection.
              </li>
              <li>
                <strong>HIPAA compliance:</strong> If handling healthcare
                information, ensure your implementation meets HIPAA
                requirements.
              </li>
            </ul>

            <h2>Access Control</h2>
            <p>
              Properly managing access to your ChatterWise account and chatbots
              is essential for security:
            </p>

            <h3>User Management</h3>
            <ul>
              <li>
                <strong>Implement role-based access control:</strong> Assign
                appropriate roles to team members based on their
                responsibilities.
              </li>
              <li>
                <strong>Regularly audit user access:</strong> Periodically
                review who has access to your ChatterWise account and revoke
                access for users who no longer need it.
              </li>
              <li>
                <strong>Enable two-factor authentication:</strong> Require 2FA
                for all users with access to your ChatterWise account.
              </li>
            </ul>

            <h3>API Access Control</h3>
            <ul>
              <li>
                <strong>Create scoped API keys:</strong> Use API keys with the
                minimum permissions necessary for each integration.
              </li>
              <li>
                <strong>Implement IP restrictions:</strong> Restrict API access
                to specific IP addresses or ranges.
                <pre className="bg-gray-800 text-green-600 p-3 rounded-lg text-sm">
                  {`// Configure IP restrictions for your API key
{
  "ip_restrictions": {
    "enabled": true,
    "allowed_ips": ["203.0.113.1", "203.0.113.0/24"]
  }
}`}
                </pre>
              </li>
            </ul>

            <h2>Rate Limiting and Abuse Prevention</h2>
            <p>Protect your chatbot from abuse and ensure fair usage:</p>

            <h3>Rate Limiting</h3>
            <ul>
              <li>
                <strong>Configure rate limits:</strong> Set appropriate rate
                limits for your chatbot to prevent abuse.
                <pre className="bg-gray-800 text-green-600 p-3 rounded-lg text-sm">
                  {`// Configure rate limits
{
  "rate_limits": {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "requests_per_day": 10000
  }
}`}
                </pre>
              </li>
              <li>
                <strong>Implement gradual backoff:</strong> Use exponential
                backoff for retry attempts to prevent overwhelming your systems.
              </li>
            </ul>

            <h3>Abuse Prevention</h3>
            <ul>
              <li>
                <strong>Monitor for suspicious activity:</strong> Set up alerts
                for unusual patterns of usage.
              </li>
              <li>
                <strong>Implement CAPTCHA for public chatbots:</strong> Use
                CAPTCHA challenges to prevent bot abuse on public-facing
                chatbots.
              </li>
              <li>
                <strong>Filter inappropriate content:</strong> Use ChatterWise's
                content filtering features to prevent misuse.
              </li>
            </ul>

            <h2>Monitoring and Logging</h2>
            <p>Maintain visibility into your chatbot's security posture:</p>

            <h3>Security Monitoring</h3>
            <ul>
              <li>
                <strong>Enable audit logging:</strong> Track all administrative
                actions in your ChatterWise account.
              </li>
              <li>
                <strong>Set up security alerts:</strong> Configure alerts for
                suspicious activities like multiple failed login attempts.
              </li>
              <li>
                <strong>Regularly review logs:</strong> Periodically review
                security logs to identify potential issues.
              </li>
            </ul>

            <h3>Incident Response</h3>
            <ul>
              <li>
                <strong>Develop an incident response plan:</strong> Have a plan
                in place for responding to security incidents.
              </li>
              <li>
                <strong>Test your response plan:</strong> Regularly practice
                your incident response procedures.
              </li>
              <li>
                <strong>Document lessons learned:</strong> After any security
                incident, document what happened and how to prevent similar
                incidents in the future.
              </li>
            </ul>

            <h2>Enterprise Security Features</h2>
            <p>
              ChatterWise offers additional security features for enterprise
              customers:
            </p>

            <ul>
              <li>
                <strong>Single Sign-On (SSO):</strong> Integrate with your
                existing identity provider using SAML or OAuth.
              </li>
              <li>
                <strong>Dedicated Infrastructure:</strong> Run ChatterWise on
                dedicated infrastructure for enhanced security and compliance.
              </li>
              <li>
                <strong>Custom Data Residency:</strong> Choose where your data
                is stored to meet regulatory requirements.
              </li>
              <li>
                <strong>Advanced Audit Logging:</strong> Get detailed logs of
                all actions and access to your ChatterWise account.
              </li>
              <li>
                <strong>Custom Security Reviews:</strong> Work with our security
                team to address your specific security requirements.
              </li>
            </ul>

            <p>
              To learn more about these features, please{" "}
              <Link
                to="/enterprise"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                contact our enterprise sales team
              </Link>
              .
            </p>

            <h2>Security Checklist</h2>
            <p>
              Use this checklist to ensure you've implemented the key security
              measures for your ChatterWise integration:
            </p>

            <div className="not-prose">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 my-8">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Security Checklist
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      API keys are stored securely and not exposed in
                      client-side code
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      All communications use HTTPS
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Webhook signatures are verified
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Rate limiting is configured appropriately
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      User access is regularly reviewed and updated
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Two-factor authentication is enabled for all users
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      PII detection and handling is configured
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Security monitoring and alerting is in place
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Incident response plan is documented and tested
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 mt-0.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-900 dark:text-white">
                      Data retention policies are implemented
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <h2>Next Steps</h2>
            <p>
              Now that you understand how to secure your ChatterWise
              implementation, you might want to explore:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/api-reference"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/tutorials/customer-support-bot"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Building a Customer Support Bot
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/advanced-features/webhooks"
              className="inline-flex items-center px-4 py-2  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous: Webhooks
            </Link>
            <Link
              to="/docs/tutorials/customer-support-bot"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Building a Customer Support Bot
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SecurityBestPracticesPage;

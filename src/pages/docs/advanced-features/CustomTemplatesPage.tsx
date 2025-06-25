import React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { useState } from "react";

const CustomTemplatesPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
        name: "Custom Templates",
        item: "https://chatterwise.io/docs/advanced-features/custom-templates",
      },
    ],
  };

  const templateComponentCode = `import React from 'react'
import { ChatTemplate } from './ChatTemplate'

interface CustomChatProps {
  botId: string
  apiUrl?: string
  apiKey?: string
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  theme?: 'light' | 'dark'
}

export const CustomChat = (props: CustomChatProps) => {
  return (
    <ChatTemplate
      {...props}
      template="custom"
      botName="My Custom Assistant"
      welcomeMessage="Welcome to my custom chatbot! How can I help you today?"
      placeholder="Type your message..."
      className="animate-in fade-in-up duration-400"
    />
  )
}`;

  const cssCustomizationCode = `:root {
  --chatterwise-primary-color: #3B82F6;
  --chatterwise-secondary-color: #6366F1;
  --chatterwise-background-color: #FFFFFF;
  --chatterwise-text-color: #1F2937;
  --chatterwise-border-radius: 12px;
  --chatterwise-font-family: 'Inter', sans-serif;
  --chatterwise-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Custom message bubbles */
.chatterwise-user-message {
  background: linear-gradient(to right, var(--chatterwise-primary-color), var(--chatterwise-secondary-color));
  color: white;
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  max-width: 80%;
  margin-left: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chatterwise-bot-message {
  background-color: #F3F4F6;
  color: #1F2937;
  border-radius: 16px 16px 16px 4px;
  padding: 12px 16px;
  max-width: 80%;
  margin-right: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}`;

  return (
    <>
      <SEO
        title="Custom Templates | ChatterWise Documentation"
        description="Learn how to create and customize chat templates for your ChatterWise chatbot. Personalize your chatbot's appearance with custom CSS, components, and themes."
        canonicalUrl="/docs/advanced-features/custom-templates"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="custom chatbot templates, chat UI customization, chatbot design, CSS customization, React chat components, chatbot themes"
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <DocBreadcrumbs
          items={[
            { name: "Advanced Features", href: "/docs/advanced-features" },
            {
              name: "Custom Templates",
              href: "/docs/advanced-features/custom-templates",
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
            Custom Templates
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              ChatterWise offers a variety of pre-built templates for your
              chatbot, but you can also create custom templates to match your
              brand perfectly. This guide will show you how to customize your
              chatbot's appearance using CSS, React components, or our template
              system.
            </p>

            <h2>Using Pre-built Templates</h2>
            <p>
              Before diving into custom templates, let's review the pre-built
              templates available in ChatterWise:
            </p>

            <div className="not-prose">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Modern
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sleek gradient design with rounded corners
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="h-24 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Minimal
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clean and simple interface
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="h-24 bg-gradient-to-r from-pink-400 to-rose-400 rounded-lg mb-3"></div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Bubble
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Playful bubble-style messages
                  </p>
                </div>
              </div>
            </div>

            <p>
              To use a pre-built template, simply select it in your chatbot
              settings or specify it in your integration code:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`<script src="https://cdn.chatterwise.io/widget.js" 
        data-bot-id="your-bot-id"
        data-template="modern"
        async></script>`}
            </pre>

            <h2>CSS Customization</h2>
            <p>
              You can customize the appearance of any template using CSS
              variables and custom styles:
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {cssCustomizationCode}
              </pre>
              <button
                onClick={() => copyToClipboard(cssCustomizationCode, "css")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "css" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <p>
              Add these CSS variables to your website's stylesheet to customize
              the chatbot's appearance. You can also target specific elements
              using the provided CSS classes.
            </p>

            <h3>Applying Custom CSS</h3>
            <p>There are several ways to apply your custom CSS:</p>

            <ol>
              <li>
                <strong>Add to your website's stylesheet:</strong> Include the
                CSS in your main stylesheet
              </li>
              <li>
                <strong>Inline in the script tag:</strong> Use the{" "}
                <code>data-custom-css</code> attribute
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
                  {`<script src="https://cdn.chatterwise.io/widget.js" 
        data-bot-id="your-bot-id"
        data-custom-css="https://your-website.com/path/to/custom-chatbot.css"
        async></script>`}
                </pre>
              </li>
              <li>
                <strong>In the ChatterWise dashboard:</strong> Add custom CSS in
                your chatbot's appearance settings
              </li>
            </ol>

            <h2>Creating Custom React Templates</h2>
            <p>
              For React applications, you can create fully custom templates by
              extending our base components:
            </p>

            <h3>Step 1: Install the ChatterWise React Package</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm">
              npm install @chatterwise/react
            </pre>

            <h3>Step 2: Create a Custom Template Component</h3>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {templateComponentCode}
              </pre>
              <button
                onClick={() =>
                  copyToClipboard(templateComponentCode, "template")
                }
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "template" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <h3>Step 3: Use Your Custom Template</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`import { CustomChat } from './components/CustomChat';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <CustomChat
        botId="your-bot-id"
        apiKey="your-api-key"
        theme="light"
      />
    </div>
  );
}`}
            </pre>

            <h2>Advanced Customization with the Template System</h2>
            <p>
              For complete control, you can create a custom template from
              scratch using our template system:
            </p>

            <h3>Step 1: Create a Template Definition</h3>
            <p>
              Create a template definition that specifies the styling and
              behavior of your template:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`// customTemplate.js
export const customTemplate = {
  name: 'custom',
  container: 'rounded-2xl shadow-2xl border-2 border-indigo-500',
  header: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-2xl',
  message: {
    user: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl rounded-br-md',
    bot: 'bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md'
  },
  input: 'border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500',
  button: 'bg-indigo-600 text-white rounded-xl hover:bg-indigo-700',
  animations: {
    container: 'animate-in zoom-in-95 duration-300',
    message: 'animate-in slide-in-from-bottom-4 duration-200'
  }
}`}
            </pre>

            <h3>Step 2: Register Your Template</h3>
            <p>Register your template with the ChatterWise system:</p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`import { registerTemplate } from '@chatterwise/react';
import { customTemplate } from './customTemplate';

// Register your custom template
registerTemplate(customTemplate);

// Now you can use it in your components
function App() {
  return (
    <div>
      <h1>My Website</h1>
      <ChatWidget
        botId="your-bot-id"
        apiKey="your-api-key"
        template="custom"
      />
    </div>
  );
}`}
            </pre>

            <h2>Customizing Specific Elements</h2>

            <h3>Header Customization</h3>
            <p>To customize just the header of your chatbot:</p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`.chatterwise-header {
  background: linear-gradient(to right, #4F46E5, #7C3AED);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.chatterwise-header-title {
  font-weight: 600;
  font-size: 16px;
  color: white;
}`}
            </pre>

            <h3>Message Bubble Customization</h3>
            <p>To customize the message bubbles:</p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`.chatterwise-user-message {
  background: linear-gradient(to right, #4F46E5, #7C3AED);
  color: white;
  border-radius: 16px 16px 4px 16px;
  padding: 12px 16px;
  max-width: 80%;
  margin-left: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chatterwise-bot-message {
  background-color: #F3F4F6;
  color: #1F2937;
  border-radius: 16px 16px 16px 4px;
  padding: 12px 16px;
  max-width: 80%;
  margin-right: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}`}
            </pre>

            <h2>Responsive Design</h2>
            <p>
              All ChatterWise templates are responsive by default, but you can
              further customize the responsive behavior:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`/* Mobile styles */
@media (max-width: 640px) {
  .chatterwise-container {
    width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  .chatterwise-messages {
    height: calc(100% - 120px) !important;
  }
}

/* Tablet styles */
@media (min-width: 641px) and (max-width: 1024px) {
  .chatterwise-container {
    width: 400px !important;
    height: 600px !important;
  }
}`}
            </pre>

            <h2>Best Practices for Custom Templates</h2>
            <ul>
              <li>
                <strong>Maintain Accessibility:</strong> Ensure your custom
                template maintains good contrast ratios and keyboard navigation
              </li>
              <li>
                <strong>Test on Multiple Devices:</strong> Verify that your
                template works well on desktop, tablet, and mobile
              </li>
              <li>
                <strong>Keep Performance in Mind:</strong> Avoid excessive
                animations or large images that could slow down your website
              </li>
              <li>
                <strong>Maintain Brand Consistency:</strong> Use colors and
                fonts that match your website's branding
              </li>
              <li>
                <strong>Consider Dark Mode:</strong> If your website supports
                dark mode, ensure your template does too
              </li>
            </ul>

            <h2>Template Gallery</h2>
            <p>
              Looking for inspiration? Check out our{" "}
              <Link
                to="/templates"
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Template Gallery
              </Link>{" "}
              for examples of beautiful, customized chatbot templates.
            </p>

            <h2>Next Steps</h2>
            <p>
              Now that you know how to customize your chatbot's appearance, you
              might want to explore:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/advanced-features/webhooks"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Webhooks
                </Link>
              </li>
              <li>
                <Link
                  to="/docs/advanced-features/security-best-practices"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Security Best Practices
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/docs/integrations/wordpress-integration"
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
              Previous: WordPress Integration
            </Link>
            <Link
              to="/docs/advanced-features/webhooks"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Webhooks
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

export default CustomTemplatesPage;

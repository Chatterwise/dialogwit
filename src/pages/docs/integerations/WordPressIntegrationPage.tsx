import React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { SEO } from "../../../components/SEO";
import { DocBreadcrumbs } from "../../../components/DocBreadcrumbs";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ScrollToTop } from "../../../components/utils/ScrollToTop";

const WordPressIntegrationPage: React.FC = () => {
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
        name: "Integrations",
        item: "https://chatterwise.io/docs/integrations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "WordPress Integration",
        item: "https://chatterwise.io/docs/integrations/wordpress-integration",
      },
    ],
  };

  const shortcodeExample = `<!-- WordPress Shortcode -->
[chatbot id="your-bot-id" template="modern" theme="light"]

<!-- Or use PHP in your theme -->
<?php echo do_shortcode('[chatbot id="your-bot-id"]'); ?>`;

  const phpExample = `<?php
/**
 * Add ChatterWise chatbot to footer
 */
function add_chatterwise_chatbot() {
    ?>
    <script src="https://cdn.chatterwise.io/widget.js" 
            data-bot-id="your-bot-id"
            data-api-key="your-api-key"
            data-theme="light"
            data-position="bottom-right"
            data-template="modern"
            async></script>
    <?php
}
add_action('wp_footer', 'add_chatterwise_chatbot');
?>`;

  return (
    <>
      {/* Ensure that the page scrolls to the top when the page is loaded */}
      <ScrollToTop />
      <SEO
        title="WordPress Integration | ChatterWise Documentation"
        description="Learn how to integrate your ChatterWise chatbot with WordPress. Step-by-step guide to add an AI chatbot to your WordPress site using our plugin or custom code."
        canonicalUrl="/docs/integrations/wordpress-integration"
        schemaType="BreadcrumbList"
        schemaData={breadcrumbSchema}
        keywords="WordPress integration, WordPress chatbot, AI WordPress plugin, ChatterWise WordPress, website chat plugin, WordPress chat widget"
      />

      <div className="mx-auto px-10 py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <DocBreadcrumbs
          items={[
            { name: "Integrations", href: "/docs/integrations" },
            {
              name: "WordPress Integration",
              href: "/docs/integrations/wordpress-integration",
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
            WordPress Integration
          </h1>

          <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
            <p>
              Integrating your ChatterWise chatbot with WordPress is easy and
              can be done in multiple ways. This guide will walk you through the
              process of adding your chatbot to your WordPress site using our
              plugin or custom code.
            </p>

            <h2>Method 1: Using the ChatterWise WordPress Plugin</h2>
            <p>
              The easiest way to add your chatbot to your WordPress site is by
              using our official plugin:
            </p>

            <h3>Step 1: Install the Plugin</h3>
            <ol>
              <li>Log in to your WordPress admin dashboard</li>
              <li>{`Go to Plugins > Add New`}</li>
              <li>Search for "ChatterWise AI Chatbot"</li>
              <li>Click "Install Now" and then "Activate"</li>
            </ol>

            <h3>Step 2: Configure the Plugin</h3>
            <ol>
              <li>{`In your WordPress admin dashboard, go to Settings > ChatterWise`}</li>
              <li>
                Enter your ChatterWise API Key (found in your ChatterWise
                account settings)
              </li>
              <li>Select the chatbot you want to add to your site</li>
              <li>
                Configure the appearance settings:
                <ul>
                  <li>Position (bottom-right, bottom-left, etc.)</li>
                  <li>Theme (light or dark)</li>
                  <li>Primary color</li>
                  <li>Template style</li>
                </ul>
              </li>
              <li>Save your changes</li>
            </ol>

            <p>Your chatbot should now appear on your WordPress site!</p>

            <h2>Method 2: Using Shortcodes</h2>
            <p>
              If you want more control over where your chatbot appears, you can
              use shortcodes:
            </p>

            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {shortcodeExample}
              </pre>
              <button
                onClick={() => copyToClipboard(shortcodeExample, "shortcode")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "shortcode" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <p>
              You can add this shortcode to any post, page, or widget area where
              shortcodes are supported.
            </p>

            <h3>Shortcode Attributes</h3>
            <p>The shortcode supports the following attributes:</p>
            <ul>
              <li>
                <code>id</code> (required): Your chatbot ID
              </li>
              <li>
                <code>template</code>: The template style (modern, minimal,
                bubble, etc.)
              </li>
              <li>
                <code>theme</code>: <code>light</code> or <code>dark</code>
              </li>
              <li>
                <code>position</code>: <code>bottom-right</code>,{" "}
                <code>bottom-left</code>, <code>top-right</code>,{" "}
                <code>top-left</code>, <code>inline</code>
              </li>
              <li>
                <code>color</code>: Hex color code for the primary color
              </li>
              <li>
                <code>title</code>: The title displayed in the chat header
              </li>
              <li>
                <code>welcome</code>: The welcome message
              </li>
            </ul>

            <h2>Method 3: Using Custom Code</h2>
            <p>
              If you prefer to add the chatbot using custom code, you can add
              the JavaScript widget directly to your theme:
            </p>

            <h3>Option 1: Add to theme's functions.php</h3>
            <div className="not-prose bg-gray-900 rounded-lg p-4 my-6 relative">
              <pre className="text-gray-100 text-sm font-mono overflow-x-auto">
                {phpExample}
              </pre>
              <button
                onClick={() => copyToClipboard(phpExample, "php")}
                className="absolute top-3 right-3 p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                aria-label="Copy code"
              >
                {copiedCode === "php" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <p>
              Add this code to your theme's <code>functions.php</code> file or a
              custom plugin.
            </p>

            <h3>Option 2: Add to theme's footer.php</h3>
            <p>
              Alternatively, you can add the script tag directly to your theme's{" "}
              <code>footer.php</code> file:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`<script src="https://cdn.chatterwise.io/widget.js" 
        data-bot-id="your-bot-id"
        data-api-key="your-api-key"
        data-theme="light"
        data-position="bottom-right"
        data-template="modern"
        async></script>`}
            </pre>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-8">
              <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-3">
                Child Theme Recommendation
              </h3>
              <p className="text-blue-700 dark:text-blue-400 mb-0">
                If you're modifying theme files directly, we recommend using a
                child theme to ensure your changes aren't lost when the theme is
                updated.
              </p>
            </div>

            <h2>Advanced WordPress Integration</h2>

            <h3>Conditional Loading</h3>
            <p>
              You might want to load the chatbot only on specific pages or for
              specific users:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`<?php
/**
 * Add ChatterWise chatbot conditionally
 */
function add_conditional_chatterwise_chatbot() {
    // Only load on specific pages
    if (is_page('contact') || is_page('support')) {
        ?>
        <script src="https://cdn.chatterwise.io/widget.js" 
                data-bot-id="your-bot-id"
                data-api-key="your-api-key"
                async></script>
        <?php
    }
}
add_action('wp_footer', 'add_conditional_chatterwise_chatbot');
?>`}
            </pre>

            <h3>WooCommerce Integration</h3>
            <p>
              For WooCommerce stores, you can customize the chatbot based on the
              current product:
            </p>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
              {`<?php
/**
 * Add product-aware ChatterWise chatbot
 */
function add_woocommerce_chatterwise_chatbot() {
    if (is_product()) {
        global $product;
        $product_name = $product->get_name();
        $product_id = $product->get_id();
        ?>
        <script src="https://cdn.chatterwise.io/widget.js" 
                data-bot-id="your-bot-id"
                data-api-key="your-api-key"
                data-context='{"product_id": "<?php echo $product_id; ?>", "product_name": "<?php echo esc_js($product_name); ?>"}'
                async></script>
        <?php
    } else {
        ?>
        <script src="https://cdn.chatterwise.io/widget.js" 
                data-bot-id="your-bot-id"
                data-api-key="your-api-key"
                async></script>
        <?php
    }
}
add_action('wp_footer', 'add_woocommerce_chatterwise_chatbot');
?>`}
            </pre>

            <h2>Troubleshooting</h2>

            <h3>Plugin Conflicts</h3>
            <p>
              If you're experiencing issues with the ChatterWise plugin, it
              might be due to conflicts with other plugins. Try the following:
            </p>
            <ol>
              <li>Temporarily deactivate other chat or support plugins</li>
              <li>
                Check if your caching plugin is preventing the chatbot from
                loading (you may need to exclude the ChatterWise scripts from
                caching)
              </li>
              <li>
                Disable JavaScript optimization plugins temporarily to see if
                they're causing issues
              </li>
            </ol>

            <h3>Theme Compatibility</h3>
            <p>
              Some WordPress themes might have CSS that conflicts with the
              chatbot widget. If you notice styling issues:
            </p>
            <ol>
              <li>Try changing the template style in your chatbot settings</li>
              <li>
                Add custom CSS to your theme to fix specific styling issues
              </li>
              <li>
                Contact our support team for assistance with your specific theme
              </li>
            </ol>

            <h2>Next Steps</h2>
            <p>
              Now that you've integrated your chatbot with WordPress, you might
              want to explore advanced features:
            </p>

            <ul>
              <li>
                <Link
                  to="/docs/advanced-features/custom-templates"
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Custom Templates
                </Link>
              </li>
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
              to="/docs/integrations/discord-integration"
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
              Previous: Discord Integration
            </Link>
            <Link
              to="/docs/advanced-features/custom-templates"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
            >
              Next: Custom Templates
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

export default WordPressIntegrationPage;

import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useTranslation } from "../../hooks/useTranslation";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center">
              <Logo className="h-12 w-52" />
            </div>
            <p className="mt-4 text-gray-400">{t("footer_tagline")}</p>
            <div className="mt-4 flex space-x-4">
              {/* Social icons */}
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* Twitter */}
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 ..."></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* GitHub */}
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" d="M12 2C6.477 2 ..."></path>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* LinkedIn */}
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 ..."></path>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer_product")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="features"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_features")}
                </Link>
              </li>
              <li>
                <Link
                  to="pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_pricing")}
                </Link>
              </li>
              <li>
                <Link
                  to="docs/integrations"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_integrations")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer_resources")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="documentation"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_documentation")}
                </Link>
              </li>
              <li>
                <Link
                  to="api-reference"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_api_reference")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("footer_company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_about")}
                </Link>
              </li>
              <li>
                <Link
                  to="contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {t("footer_contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">{t("footer_copyright")}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://www.iubenda.com/privacy-policy/16849142"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t("footer_privacy")}
            </a>
            <a
              href="https://www.iubenda.com/terms-and-conditions/16849142"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t("footer_terms")}
            </a>
            <a
              href="https://www.iubenda.com/privacy-policy/16849142/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              {t("footer_cookies")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

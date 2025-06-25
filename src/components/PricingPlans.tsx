import React, { useEffect, useState } from "react";
import { Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { useStripe } from "../hooks/useStripe";
import { stripeConfig } from "../stripe-config";
import { useLocation, useNavigate } from "react-router-dom";

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
      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-8 dark:bg-primary-700 dark:hover:bg-primary-800"
    >
      Go Back
    </button>
  );
};

// FAQ Accordion Item
const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-gray-900 dark:text-white"
      >
        <span>{question}</span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
          {answer}
        </p>
      )}
    </div>
  );
};

const PricingPlans: React.FC = () => {
  const { createCheckoutSession, isLoading } = useStripe();
  const handleSubscribe = async (priceId: string) => {
    try {
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case "Chatterwise Free":
        return (
          <Sparkles className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        );
      case "Chatterwise Starter":
        return <Zap className="w-8 h-8 text-blue-500 dark:text-blue-400" />;
      case "Chatterwise Growth":
        return (
          <Crown className="w-8 h-8 text-purple-500 dark:text-purple-400" />
        );
      case "Chatterwise Business":
        return (
          <Building2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        );
      default:
        return (
          <Sparkles className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div className="py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GoBackButton />
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start building AI-powered chatbots today. Upgrade or downgrade at
            any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stripeConfig.products.map((plan) => (
            <div
              key={plan.priceId}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900/30"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name.replace("Chatterwise ", "")}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      /{plan.interval}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                    Usage Limits
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Tokens/month:</span>
                      <span className="font-medium">
                        {formatNumber(plan.limits.tokens_per_month)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documents:</span>
                      <span className="font-medium">
                        {plan.limits.max_documents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chatbots:</span>
                      <span className="font-medium">
                        {plan.limits.max_chatbots}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>API calls/min:</span>
                      <span className="font-medium">
                        {plan.limits.api_requests_per_minute}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={isLoading || plan.price === 0}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                      : plan.price === 0
                      ? "bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : plan.price === 0 ? (
                    "Current Plan"
                  ) : (
                    `Get Started - $${plan.price}/${plan.interval}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <FaqItem
              question="Can I change plans anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing."
            />
            <FaqItem
              question="What happens if I exceed my limits?"
              answer="We'll notify you when you're approaching your limits. You can purchase add-ons or upgrade your plan to continue using the service."
            />
            <FaqItem
              question="Do you offer refunds?"
              answer="We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied."
            />
            <FaqItem
              question="Is there a free trial?"
              answer="Yes! All new users start with our Free plan. You can upgrade anytime to access more features and higher limits."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;

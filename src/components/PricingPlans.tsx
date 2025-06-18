import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Zap,
  Loader,
  CreditCard,
  Users,
  MessageCircle,
  Mail,
} from "lucide-react";
import { useStripeSubscription } from "../hooks/useStripe";
import { products, getProductByPriceId, formatPrice } from "../stripe-config";
import { useCreateCheckout } from "../hooks/useStripe";

export const PricingPlans = () => {
  const createCheckout = useCreateCheckout();
  const { data: subscription } = useStripeSubscription();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const product = subscription?.price_id
    ? getProductByPriceId(subscription.price_id)
    : null;

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      const { url } = await createCheckout.mutateAsync({
        priceId,
        mode: "subscription",
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      });
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  // Calculate yearly prices (15% discount)
  const getYearlyPrice = (monthlyPrice: number) =>
    Math.round(monthlyPrice * 12 * 0.85);
  const getMonthlyEquivalent = (yearlyPrice: number) =>
    Math.round(yearlyPrice / 12);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 transition-colors duration-500`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Choose the perfect plan for your chatbot needs
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`relative w-32 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`relative w-32 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === "yearly"
                  ? "bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Free Plan */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Free
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 h-12">
                Try out basic features with limited usage
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  $0
                </span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <Link
                to="/auth"
                className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Features included:
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />1 Chatbot
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                      10,000 Tokens/mo
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      3,000 Emails/mo
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Basic templates
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt=0.5 flex-shrink-0" />
                  <span className="text-sm text-gray=600 dark:text-gray-400">
                    Community support
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Paid Plans */}
          {products.map((productItem) => {
            const isPopular = productItem.name === "Growth";
            const isCurrent = product?.id === productItem.id;
            const isLoading = loadingPriceId === productItem.priceId;
            const displayPrice =
              billingCycle === "yearly"
                ? getYearlyPrice(productItem.price)
                : productItem.price;
            const monthlyEquivalent =
              billingCycle === "yearly"
                ? getMonthlyEquivalent(getYearlyPrice(productItem.price))
                : null;

            // Plan-specific features
            const chatbots =
              productItem.name === "Starter"
                ? 2
                : productItem.name === "Growth"
                ? 5
                : 20;
            const tokens =
              productItem.name === "Starter"
                ? "50,000"
                : productItem.name === "Growth"
                ? "200,000"
                : "1,000,000";
            const emails =
              productItem.name === "Starter"
                ? "50,000"
                : productItem.name === "Growth"
                ? "100,000"
                : "500,000";

            return (
              <div
                key={productItem.id}
                className={`relative rounded-2xl border ${
                  isPopular
                    ? "border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-900/30"
                    : "border-gray-200 dark:border-gray-700"
                } bg-white dark:bg-gray-800 p-8 shadow-sm ${
                  isPopular ? "lg:scale-105 z-10" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary-600 text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {productItem.name}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 h-12">
                    {productItem.description}
                  </p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {billingCycle === "yearly" ? "/year" : "/month"}
                    </span>
                    {billingCycle === "yearly" && monthlyEquivalent && (
                      <p className="mt=1 text-sm text-green-600">
                        ${monthlyEquivalent}/mo (15% off)
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleSubscribe(productItem.priceId)}
                    disabled={isCurrent || isLoading}
                    className={`mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium transition-colors ${
                      isCurrent
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : isPopular
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Features included:
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {chatbots} Chatbots
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr=3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                          {tokens} Tokens/mo
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {emails} Emails/mo
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {productItem.name === "Starter"
                          ? "Standard templates"
                          : "Premium templates"}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {productItem.name === "Starter"
                          ? "Email support"
                          : "Priority support"}
                      </span>
                    </li>
                    {productItem.name !== "Starter" && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Advanced analytics
                        </span>
                      </li>
                    )}
                    {productItem.name === "Business" && (
                      <>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Custom branding
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Dedicated account manager
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray=200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                What happens when I reach my usage limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                When you reach your usage limits, you'll be notified and given
                the option to upgrade to a higher plan. Your chatbots will
                continue to function, but new messages may be queued until the
                next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray=200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                Can I change plans at any time?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade your plan at any time. When you upgrade,
                you'll be charged the prorated amount for the remainder of your
                billing cycle. Downgrades take effect at the end of your current
                billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray=800 rounded-lg shadow-sm border border-gray=200 dark:border-gray=700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray=100 mb-3">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray=400">
                Yes, all new accounts start with a 14-day free trial of the
                Growth plan features. No credit card is required to start your
                trial.
              </p>
            </div>
            <div className="bg-white dark:bg-gray=800 rounded-lg shadow-sm border border-gray=200 dark:border-gray=700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray=100 mb-3">
                How do I cancel my subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray=400">
                You can cancel your subscription at any time from your account
                settings. After cancellation, your plan will remain active until
                the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray=100 mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray=400 mb-8">
            Choose the plan that's right for you and start building amazing
            chatbots today.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/auth"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Trial
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px=6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

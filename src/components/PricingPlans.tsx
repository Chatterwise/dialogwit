import React, { useState } from "react";
import { Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { useStripe } from "../hooks/useStripe";
import { stripeConfig } from "../stripe-config";

const PricingPlans: React.FC = () => {
  const { createCheckoutSession, isLoading } = useStripe();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

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
        return <Sparkles className="w-8 h-8 text-gray-500" />;
      case "Chatterwise Starter":
        return <Zap className="w-8 h-8 text-blue-500" />;
      case "Chatterwise Growth":
        return <Crown className="w-8 h-8 text-purple-500" />;
      case "Chatterwise Business":
        return <Building2 className="w-8 h-8 text-indigo-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-gray-500" />;
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
    <div className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start building AI-powered chatbots today. Upgrade or downgrade at
            any time.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setBillingInterval("month")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingInterval === "month"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("year")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingInterval === "year"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Yearly
                <span className="ml-1 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stripeConfig.products.map((plan) => (
            <div
              key={plan.priceId}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-blue-300"
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name.replace("Chatterwise ", "")}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">/{plan.interval}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                    Usage Limits
                  </h4>
                  <div className="space-y-2 text-xs text-gray-600">
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
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-gray-800"
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

        {/* Add-ons Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Add-ons & Upgrades
            </h3>
            <p className="text-gray-600">
              Enhance your plan with additional features and capacity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {stripeConfig.addOns.map((addon) => (
              <div
                key={addon.priceId}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {addon.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      {addon.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${addon.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {addon.mode === "subscription" ? "/month" : "one-time"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {addon.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(addon.priceId)}
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Add ${addon.name} - $${addon.price}`
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we'll prorate the billing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                What happens if I exceed my limits?
              </h4>
              <p className="text-gray-600 text-sm">
                We'll notify you when you're approaching your limits. You can
                purchase add-ons or upgrade your plan to continue using the
                service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee for all paid plans.
                Contact support if you're not satisfied.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600 text-sm">
                Yes! All new users start with our Free plan. You can upgrade
                anytime to access more features and higher limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;

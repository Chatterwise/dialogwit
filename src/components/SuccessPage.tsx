import React, { useEffect } from "react";
import { CheckCircle, ArrowRight, CreditCard, Zap } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useBilling } from "../hooks/useBilling";

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refetch } = useBilling();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Refetch billing data to get updated subscription info
    const timer = setTimeout(() => {
      refetch();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for subscribing to ChatterWise. Your account has been
            upgraded and you now have access to all the features of your new
            plan.
          </p>

          {/* Features Unlocked */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-500 mr-2" />
              What's Next?
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Create unlimited chatbots</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Access to advanced AI models</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>Priority customer support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              to="/billing"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View Billing Details
            </Link>
          </div>

          {/* Session Info */}
          {sessionId && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Session ID: {sessionId.slice(-8)}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help getting started?{" "}
            <a
              href="mailto:support@chatterwise.ai"
              className="text-blue-500 hover:text-blue-600"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

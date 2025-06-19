import React from "react";
import { XCircle, ArrowLeft, HelpCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 mb-8">
            Your payment was cancelled and no charges were made to your account.
            You can try again anytime or continue using ChatterWise with your
            current plan.
          </p>

          {/* What You Can Do */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-500 mr-2" />
              What would you like to do?
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Continue with your current plan</p>
              <p>• Try a different payment method</p>
              <p>• Contact support for assistance</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/pricing"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              Try Again
            </Link>

            <Link
              to="/dashboard"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Need Help?
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              If you're experiencing issues with payment or have questions about
              our plans, we're here to help.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@chatterwise.ai"
                className="block text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Email Support
              </a>
              <a
                href="/pricing"
                className="block text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                View All Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;

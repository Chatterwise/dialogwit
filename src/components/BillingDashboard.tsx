import React, { useState } from 'react'
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Download,
  Settings,
  Zap,
  Users,
  MessageCircle,
  Database,
  ExternalLink,
  Mail
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { 
  useUserSubscription, 
  useSubscriptionPlans, 
  useCreateCheckout, 
  useCustomerPortal,
  isOnTrial,
  getTrialDaysRemaining,
  isTrialExpiringSoon,
  formatPrice,
  calculateYearlySavings,
  SubscriptionPlan
} from '../hooks/useBilling'
import { useStripeSubscription, useStripeOrders } from '../hooks/useStripe'
import { formatPrice as formatStripePrice } from '../stripe-config'

export const BillingDashboard = () => {
  const { user } = useAuth()
  const { data: subscriptionData, isLoading: subscriptionLoading } = useUserSubscription(user?.id || '')
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans()
  const { data: stripeSubscription } = useStripeSubscription()
  const { data: orders = [] } = useStripeOrders()
  const createCheckout = useCreateCheckout()
  const customerPortal = useCustomerPortal()

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [portalError, setPortalError] = useState<string | null>(null)

  const subscription = subscriptionData?.subscription
  const usage = subscriptionData?.usage || []

  const handleUpgrade = async (planId: string) => {
    try {
      const checkoutUrl = await createCheckout.mutateAsync({
        planId,
        billingCycle
      })
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Failed to create checkout:', error)
      alert('Failed to start upgrade process. Please try again.')
    }
  }

  const handleManageBilling = async () => {
    try {
      setPortalError(null)
      const portalUrl = await customerPortal.mutateAsync()
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      setPortalError('Failed to create customer portal session. Please try again.')
    }
  }

  const getCurrentUsage = (metricName: string) => {
    const usageRecord = usage.find(u => u.metric_name === metricName)
    return usageRecord?.metric_value || 0
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const currentPlan = subscription?.subscription_plans
  const trialDaysRemaining = getTrialDaysRemaining(subscription)
  const onTrial = isOnTrial(subscription)
  const trialExpiringSoon = isTrialExpiringSoon(subscription)

  // Get plan limits based on subscription status
  const getPlanLimits = () => {
    if (currentPlan) {
      return currentPlan.limits
    }
    
    // Default to free plan limits
    return {
      chatbots: 1,
      messages_per_month: 10000,
      knowledge_base_items: 10,
      api_calls_per_month: 1000,
      emails_per_month: 3000
    }
  }

  const planLimits = getPlanLimits()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
            Billing & Usage
          </h1>
          <p className="text-gray-600">
            Manage your subscription and monitor usage across all features.
          </p>
        </div>
        <div className="flex space-x-3">
          {stripeSubscription && stripeSubscription.subscription_id && (
            <button
              onClick={handleManageBilling}
              disabled={customerPortal.isPending}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {customerPortal.isPending ? 'Loading...' : 'Manage Billing'}
            </button>
          )}
          <Link
            to="/pricing"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            View Plans
          </Link>
        </div>
      </div>

      {/* Error message */}
      {portalError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-red-700">{portalError}</p>
              <p className="text-sm text-red-700 mt-1">
                This may happen if you don't have an active subscription yet. Try upgrading to a paid plan first.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status */}
      <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Subscription Status</h3>
          </div>
          {stripeSubscription && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              stripeSubscription.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
              stripeSubscription.subscription_status === 'trialing' ? 'bg-blue-100 text-blue-800' :
              stripeSubscription.subscription_status === 'past_due' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {stripeSubscription.subscription_status === 'active' ? 'Active' :
               stripeSubscription.subscription_status === 'trialing' ? 'Trial' :
               stripeSubscription.subscription_status === 'past_due' ? 'Past Due' :
               stripeSubscription.subscription_status || 'Free'}
            </span>
          )}
        </div>

        {stripeSubscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">
                {stripeSubscription.subscription_status === 'trialing' ? 'Trial' : 
                 stripeSubscription.price_id ? 'Premium' : 'Free'}
              </h4>
              {stripeSubscription.subscription_status === 'trialing' ? (
                <p className="text-gray-600 mt-1">Free trial of premium features</p>
              ) : (
                <p className="text-gray-600 mt-1">
                  {stripeSubscription.price_id ? 'Premium subscription with advanced features' : 'Basic free plan'}
                </p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Subscription Details</h5>
              {stripeSubscription.subscription_status === 'trialing' ? (
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Trial ends {stripeSubscription.current_period_end ? 
                      new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString() : 
                      'soon'}
                  </span>
                </div>
              ) : stripeSubscription.subscription_id ? (
                <div className="space-y-1">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Renews {stripeSubscription.current_period_end ? 
                        new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString() : 
                        'N/A'}
                    </span>
                  </div>
                  {stripeSubscription.payment_method_brand && stripeSubscription.payment_method_last4 && (
                    <div className="flex items-center text-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span>
                        {stripeSubscription.payment_method_brand.toUpperCase()} ending in {stripeSubscription.payment_method_last4}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Free plan active</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end">
              {stripeSubscription.subscription_status === 'trialing' ? (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Before Trial Ends
                </button>
              ) : !stripeSubscription.subscription_id ? (
                <Link
                  to="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Link>
              ) : (
                <button
                  onClick={handleManageBilling}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Active Subscription</h3>
            <p className="text-gray-500 mb-6">Choose a plan to get started with premium features.</p>
            <Link
              to="/pricing"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Usage Overview */}
      <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Usage Overview</h3>
          </div>
          <span className="text-sm text-gray-500">Current billing period</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chatbots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Chatbots</span>
              </div>
              <span className="text-sm text-gray-500">
                {getCurrentUsage('chatbots')}/{planLimits.chatbots === -1 ? '∞' : planLimits.chatbots}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                style={{ 
                  width: `${planLimits.chatbots === -1 ? 0 : getUsagePercentage(getCurrentUsage('chatbots'), planLimits.chatbots)}%` 
                }}
              />
            </div>
          </div>

          {/* Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Tokens</span>
              </div>
              <span className="text-sm text-gray-500">
                {getCurrentUsage('tokens_per_month')}/{planLimits.messages_per_month === -1 ? '∞' : planLimits.messages_per_month.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-green-500"
                style={{ 
                  width: `${planLimits.messages_per_month === -1 ? 0 : getUsagePercentage(getCurrentUsage('tokens_per_month'), planLimits.messages_per_month)}%` 
                }}
              />
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">KB Items</span>
              </div>
              <span className="text-sm text-gray-500">
                {getCurrentUsage('knowledge_base_items')}/{planLimits.knowledge_base_items === -1 ? '∞' : planLimits.knowledge_base_items}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-purple-500"
                style={{ 
                  width: `${planLimits.knowledge_base_items === -1 ? 0 : getUsagePercentage(getCurrentUsage('knowledge_base_items'), planLimits.knowledge_base_items)}%` 
                }}
              />
            </div>
          </div>

          {/* Emails */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Emails</span>
              </div>
              <span className="text-sm text-gray-500">
                {getCurrentUsage('emails_per_month')}/{planLimits.emails_per_month === -1 ? '∞' : planLimits.emails_per_month.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-orange-500"
                style={{ 
                  width: `${planLimits.emails_per_month === -1 ? 0 : getUsagePercentage(getCurrentUsage('emails_per_month'), planLimits.emails_per_month)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={!stripeSubscription?.subscription_id || customerPortal.isPending}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Invoices
          </button>
        </div>

        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Subscription Payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatStripePrice(order.amount_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No Payment History</h3>
            <p className="text-gray-500">
              Your payment history will appear here once you subscribe to a plan.
            </p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Choose Your Plan</h3>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* Billing Toggle */}
              <div className="mt-4 flex items-center justify-center">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Yearly
                    <span className="ml-1 text-green-600 font-semibold">Save 15%</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(plan => plan.name !== 'free_trial').map((plan) => {
                  const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
                  const monthlyPrice = billingCycle === 'yearly' ? plan.price_yearly / 12 : plan.price_monthly
                  const isCurrentPlan = currentPlan?.id === plan.id
                  const isPopular = plan.name === 'pro'

                  return (
                    <div
                      key={plan.id}
                      className={`relative border rounded-2xl p-6 ${
                        isPopular ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'
                      } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-primary-600 text-white px-3 py-1 text-sm font-medium rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900">{plan.display_name}</h4>
                        <p className="text-gray-600 mt-2">{plan.description}</p>
                        
                        <div className="mt-4">
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(monthlyPrice)}
                          </span>
                          <span className="text-gray-600">/month</span>
                          {billingCycle === 'yearly' && (
                            <div className="text-sm text-green-600 font-medium">
                              Save {calculateYearlySavings(plan.price_monthly, plan.price_yearly)}% annually
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isCurrentPlan || createCheckout.isPending}
                          className={`w-full mt-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isCurrentPlan
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : isPopular
                              ? 'bg-primary-600 text-white hover:bg-primary-700'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {isCurrentPlan ? 'Current Plan' : createCheckout.isPending ? 'Loading...' : 'Upgrade'}
                        </button>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="text-sm font-medium text-gray-900">Features:</div>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {plan.limits.chatbots === -1 ? 'Unlimited' : plan.limits.chatbots} chatbots
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {plan.limits.messages_per_month === -1 ? 'Unlimited' : plan.limits.messages_per_month.toLocaleString()} tokens/month
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {plan.limits.emails_per_month === -1 ? 'Unlimited' : plan.limits.emails_per_month.toLocaleString()} emails/month
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {plan.limits.knowledge_base_items === -1 ? 'Unlimited' : plan.limits.knowledge_base_items} KB items
                          </li>
                          {plan.features.priority_support && (
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              Priority support
                            </li>
                          )}
                          {plan.features.custom_branding && (
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              Custom branding
                            </li>
                          )}
                          {plan.features.webhooks && (
                            <li className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              Webhooks
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
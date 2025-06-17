import React from 'react'
import { CheckCircle, Clock, AlertTriangle, XCircle, CreditCard, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStripeSubscription } from '../hooks/useStripe'
import { getProductByPriceId, formatPrice } from '../stripe-config'

export const SubscriptionStatus = () => {
  const { data: subscription, isLoading } = useStripeSubscription()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Free Plan</h3>
              <p className="text-sm text-gray-500">Limited features and usage</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Zap className="h-4 w-4 mr-1" />
            Upgrade
          </Link>
        </div>
      </div>
    )
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null
  
  const getStatusIcon = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return 'text-green-700'
      case 'trialing':
        return 'text-blue-700'
      case 'past_due':
        return 'text-yellow-700'
      case 'canceled':
        return 'text-red-700'
      default:
        return 'text-gray-700'
    }
  }

  const getStatusText = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Past Due'
      case 'canceled':
        return 'Canceled'
      case 'incomplete':
        return 'Incomplete'
      case 'incomplete_expired':
        return 'Expired'
      case 'unpaid':
        return 'Unpaid'
      case 'paused':
        return 'Paused'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              {product ? product.name : 'Subscription'}
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
              {product && ` • ${formatPrice(product.price)}/month`}
            </p>
          </div>
        </div>
        
        {subscription.current_period_end && (
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {subscription.cancel_at_period_end ? 'Ends' : 'Renews'}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {subscription.payment_method_brand && subscription.payment_method_last4 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Payment method: {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
          </p>
        </div>
      )}
    </div>
  )
}
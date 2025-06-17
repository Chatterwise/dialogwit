import React, { useState } from 'react'
import { Check, Zap, Loader, CreditCard, Users, MessageCircle, Database, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products, formatPrice } from '../stripe-config'
import { useCreateCheckout, useSubscriptionStatus } from '../hooks/useStripe'

export const PricingPlans = () => {
  const createCheckout = useCreateCheckout()
  const { subscription, hasActiveSubscription } = useSubscriptionStatus()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId)
    
    try {
      const { url } = await createCheckout.mutateAsync({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`,
      })
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoadingPriceId(null)
    }
  }

  const isCurrentPlan = (priceId: string) => {
    return subscription?.price_id === priceId
  }

  // Calculate yearly prices (15% discount)
  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85)
  }

  // Calculate monthly equivalent of yearly price
  const getMonthlyEquivalent = (yearlyPrice: number) => {
    return Math.round(yearlyPrice / 12)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Choose the perfect plan for your chatbot needs
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-white rounded-lg p-1 flex shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative w-32 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative w-32 py-2 text-sm font-medium rounded-md transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-primary-100 text-primary-800' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Free Plan */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Free</h3>
              <p className="mt-2 text-gray-600 h-12">Try out basic features with limited usage</p>
              
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>

              <Link
                to="/auth"
                className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Features included:</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      1 Chatbot
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                      10,000 Tokens/mo
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                      3,000 Emails/mo
                    </span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Basic templates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Community support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Paid Plans */}
          {products.map((product, index) => {
            const isPopular = product.name === 'Growth' // Middle plan is popular
            const isCurrent = isCurrentPlan(product.priceId)
            const isLoading = loadingPriceId === product.priceId
            
            // Calculate prices based on billing cycle
            const displayPrice = billingCycle === 'yearly' 
              ? getYearlyPrice(product.price) 
              : product.price
            
            const monthlyEquivalent = billingCycle === 'yearly'
              ? getMonthlyEquivalent(getYearlyPrice(product.price))
              : null

            // Plan-specific features
            const chatbots = product.name === 'Starter' ? 2 : 
                            product.name === 'Growth' ? 5 : 20
            
            const tokens = product.name === 'Starter' ? '50,000' : 
                          product.name === 'Growth' ? '200,000' : '1,000,000'
            
            const emails = product.name === 'Starter' ? '50,000' : 
                          product.name === 'Growth' ? '100,000' : '500,000'

            return (
              <div
                key={product.id}
                className={`relative rounded-2xl border ${
                  isPopular
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200'
                } bg-white p-8 shadow-sm ${isPopular ? 'lg:scale-105 z-10' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-primary-600 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-gray-600 h-12">{product.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-gray-600">
                      {billingCycle === 'yearly' ? '/year' : '/month'}
                    </span>
                    
                    {billingCycle === 'yearly' && monthlyEquivalent && (
                      <p className="mt-1 text-sm text-green-600">
                        ${monthlyEquivalent}/mo (15% off)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={isCurrent || isLoading}
                    className={`mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPopular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Features included:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {chatbots} Chatbots
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                          {tokens} Tokens/mo
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {emails} Emails/mo
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {product.name === 'Starter' ? 'Standard templates' : 'Premium templates'}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {product.name === 'Starter' ? 'Email support' : 'Priority support'}
                      </span>
                    </li>
                    {product.name !== 'Starter' && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">Advanced analytics</span>
                      </li>
                    )}
                    {product.name === 'Business' && (
                      <>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Custom branding</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">Dedicated account manager</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">What happens when I reach my usage limits?</h3>
              <p className="text-gray-600">
                When you reach your usage limits, you'll be notified and given the option to upgrade to a higher plan. Your chatbots will continue to function, but new messages may be queued until the next billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Can I change plans at any time?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade your plan at any time. When you upgrade, you'll be charged the prorated amount for the remainder of your billing cycle. Downgrades take effect at the end of your current billing cycle.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes, all new accounts start with a 14-day free trial of the Growth plan features. No credit card is required to start your trial.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">How do I cancel my subscription?</h3>
              <p className="text-gray-600">
                You can cancel your subscription at any time from your account settings. After cancellation, your plan will remain active until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that's right for you and start building amazing chatbots today.
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
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
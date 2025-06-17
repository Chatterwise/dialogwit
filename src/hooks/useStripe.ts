import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface StripeSubscription {
  customer_id: string
  subscription_id: string | null
  subscription_status: string
  price_id: string | null
  current_period_start: number | null
  current_period_end: number | null
  cancel_at_period_end: boolean
  payment_method_brand: string | null
  payment_method_last4: string | null
}

export interface StripeOrder {
  customer_id: string
  order_id: number
  checkout_session_id: string
  payment_intent_id: string
  amount_subtotal: number
  amount_total: number
  currency: string
  payment_status: string
  order_status: string
  order_date: string
}

export const useStripeSubscription = () => {
  return useQuery({
    queryKey: ['stripe-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle()

      if (error) throw error
      return data as StripeSubscription | null
    },
  })
}

export const useStripeOrders = () => {
  return useQuery({
    queryKey: ['stripe-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false })

      if (error) throw error
      return data as StripeOrder[]
    },
  })
}

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: async ({
      priceId,
      mode,
      successUrl,
      cancelUrl,
    }: {
      priceId: string
      mode: 'payment' | 'subscription'
      successUrl?: string
      cancelUrl?: string
    }) => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            mode,
            success_url: successUrl || `${window.location.origin}/success`,
            cancel_url: cancelUrl || `${window.location.origin}/cancel`,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      return data
    },
  })
}

export const useSubscriptionStatus = () => {
  const { data: subscription } = useStripeSubscription()
  
  const isActive = subscription?.subscription_status === 'active'
  const isTrialing = subscription?.subscription_status === 'trialing'
  const isPastDue = subscription?.subscription_status === 'past_due'
  const isCanceled = subscription?.subscription_status === 'canceled'
  
  const hasActiveSubscription = isActive || isTrialing
  
  return {
    subscription,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    hasActiveSubscription,
  }
}
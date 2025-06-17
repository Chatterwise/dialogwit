import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  features: Record<string, any>
  limits: Record<string, any>
  usage_limits: UsageLimit[]
}

export interface UsageLimit {
  id: string
  plan_id: string
  metric_name: string
  limit_value: number
  overage_price: number
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_start?: string
  trial_end?: string
  canceled_at?: string
  cancel_at_period_end: boolean
  subscription_plans: SubscriptionPlan
}

export interface UsageTracking {
  id: string
  user_id: string
  metric_name: string
  metric_value: number
  period_start: string
  period_end: string
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscription_plans'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/plans`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans')
      }

      const data = await response.json()
      return data.plans as SubscriptionPlan[]
    },
  })
}

export const useUserSubscription = (userId: string) => {
  return useQuery({
    queryKey: ['user_subscription', userId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/subscription`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }

      const data = await response.json()
      return {
        subscription: data.subscription as UserSubscription | null,
        usage: data.usage as UsageTracking[]
      }
    },
    enabled: !!userId,
  })
}

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string, billingCycle: 'monthly' | 'yearly' }) => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      return data.checkout_url
    },
  })
}

export const useCustomerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create customer portal session')
      }

      const data = await response.json()
      return data.portal_url
    },
  })
}

// Cache for usage check results
const usageCheckCache: Record<string, {result: any, timestamp: number}> = {};
const CACHE_TTL = 60000; // 1 minute cache TTL

export const useUsageCheck = () => {
  return useMutation({
    mutationFn: async (metricName: string) => {
      // Check cache first
      const cacheKey = metricName;
      const cachedData = usageCheckCache[cacheKey];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        console.log(`Using cached usage check for ${metricName}`);
        return cachedData.result;
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/usage-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          metric_name: metricName,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to check usage'
        
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = `Failed to check usage: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      // Cache the result
      usageCheckCache[cacheKey] = {
        result: data.usage_check,
        timestamp: now
      };
      
      return data.usage_check
    },
  })
}

export const useTrackUsage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ metricName, increment = 1 }: { metricName: string, increment?: number }) => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/track-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          metric_name: metricName,
          increment,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to track usage')
      }

      // Invalidate cache for this metric
      delete usageCheckCache[metricName];

      return await response.json()
    },
    onSuccess: () => {
      // Invalidate subscription data to refresh usage
      queryClient.invalidateQueries({ queryKey: ['user_subscription'] })
    },
  })
}

// Helper function to check if user is on trial
export const isOnTrial = (subscription: UserSubscription | null): boolean => {
  if (!subscription) return false
  return subscription.status === 'trialing' && 
         subscription.trial_end && 
         new Date(subscription.trial_end) > new Date()
}

// Helper function to get trial days remaining
export const getTrialDaysRemaining = (subscription: UserSubscription | null): number => {
  if (!subscription || !subscription.trial_end) return 0
  
  const trialEnd = new Date(subscription.trial_end)
  const now = new Date()
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

// Helper function to check if trial is expiring soon
export const isTrialExpiringSoon = (subscription: UserSubscription | null, days = 3): boolean => {
  if (!isOnTrial(subscription)) return false
  return getTrialDaysRemaining(subscription) <= days
}

// Helper function to format price
export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}

// Helper function to calculate yearly savings
export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const yearlyMonthly = monthlyPrice * 12
  return Math.round(((yearlyMonthly - yearlyPrice) / yearlyMonthly) * 100)
}
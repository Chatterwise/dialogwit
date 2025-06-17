import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useUsageCheck, useTrackUsage } from './useBilling'
import { useSubscriptionStatus } from './useStripe'

export const useChatbotLimits = () => {
  const { user } = useAuth()
  const usageCheck = useUsageCheck()
  const trackUsage = useTrackUsage()
  const { hasActiveSubscription, subscription } = useSubscriptionStatus()

  // Check if user can create more chatbots
  const checkChatbotLimit = async (): Promise<boolean> => {
    if (!user) return false
    
    try {
      const result = await usageCheck.mutateAsync('chatbots')
      return result.allowed
    } catch (error) {
      console.error('Failed to check chatbot limit:', error)
      return false
    }
  }

  // Track chatbot creation
  const trackChatbotCreation = async (): Promise<boolean> => {
    if (!user) return false
    
    try {
      // First check if we're allowed to create more chatbots
      const checkResult = await usageCheck.mutateAsync('chatbots')
      
      if (!checkResult.allowed) {
        return false
      }
      
      // Track the usage
      await trackUsage.mutateAsync({
        metricName: 'chatbots',
        increment: 1
      })
      
      return true
    } catch (error) {
      console.error('Failed to track chatbot creation:', error)
      return false
    }
  }

  // Get current chatbot limit from subscription
  const getChatbotLimit = (): number => {
    if (!subscription) return 1 // Free tier default
    
    // Get the plan from the subscription
    const planId = subscription.price_id
    
    // Return limit based on plan
    switch (planId) {
      case 'price_1RauldPTUKauYAQ6vsSK6qU6': // Starter
        return 2
      case 'price_1RaumJPTUKauYAQ6wMuBtA9g': // Growth
        return 5
      case 'price_1RaunBPTUKauYAQ6Ig3ai8Ms': // Business
        return 20
      default:
        return 1 // Free tier
    }
  }

  return {
    checkChatbotLimit,
    trackChatbotCreation,
    getChatbotLimit,
    isLoading: usageCheck.isPending || trackUsage.isPending,
    hasActiveSubscription
  }
}
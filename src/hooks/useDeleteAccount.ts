import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const useDeleteAccount = () => {
  const { signOut } = useAuth()

  return useMutation({
    mutationFn: async (userId: string) => {
      // First, cancel any active subscriptions via Stripe
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/billing/cancel-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.warn('Subscription cancellation warning:', errorData)
          // Continue with account deletion even if subscription cancellation fails
        }
      } catch (error) {
        console.warn('Failed to cancel subscription:', error)
        // Continue with account deletion even if subscription cancellation fails
      }

      // Delete user data from all tables
      // This relies on cascade delete in the database
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Finally, delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authError) throw authError

      // Sign out the user
      await signOut()

      return { success: true }
    }
  })
}
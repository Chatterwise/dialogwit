import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useAuthEmail = () => {
  const sendConfirmationEmail = useMutation({
    mutationFn: async ({ email, confirmUrl }: { email: string, confirmUrl: string }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/confirm-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, confirmUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send confirmation email');
      }

      return await response.json();
    },
  });

  const sendPasswordResetEmail = useMutation({
    mutationFn: async ({ email, resetUrl }: { email: string, resetUrl: string }) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send password reset email');
      }

      return await response.json();
    },
  });

  const confirmEmail = useMutation({
    mutationFn: async (token: string) => {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });

      if (error) {
        throw error;
      }

      return { success: true };
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ token, password }: { token: string, password: string }) => {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    },
  });

  return {
    sendConfirmationEmail,
    sendPasswordResetEmail,
    confirmEmail,
    resetPassword,
  };
};
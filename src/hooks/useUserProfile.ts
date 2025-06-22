import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useToast } from '../lib/toastStore'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company: string | null
  timezone: string | null
  created_at: string
  updated_at: string
}

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['user_profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      return data as UserProfile | null
    },
    enabled: !!userId
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UserProfile>;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as UserProfile;
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_profile", data.id] });
      toast.success("Profile updated successfully.");
    },

    onError: (error: Error) => {
      console.error("Update failed:", error);
      toast.error("Failed to update profile. Please try again.");
    },
  });
};
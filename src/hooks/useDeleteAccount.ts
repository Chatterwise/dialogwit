import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useToast } from "../lib/toastStore";

export const useDeleteAccount = () => {
  const { signOut } = useAuth();
  const toast = useToast();

  return useMutation({
    mutationFn: async () => {
      const session = (await supabase.auth.getSession()).data.session;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      await signOut();
      return { success: true };
    },

    onSuccess: () => {
      toast.success("Your account has been deleted successfully.");
    },

    onError: (error: Error) => {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete your account. Please try again.");
    },
  });
};

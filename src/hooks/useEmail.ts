import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { fetchWithRetry } from "../lib/http";
import { useAuth } from "./useAuth";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailSettings {
  enable_notifications: boolean;
  daily_digest: boolean;
  weekly_report: boolean;
  chatbot_alerts: boolean;
  marketing_emails: boolean;
}

export const useEmail = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sendEmail = useMutation({
    mutationFn: async (options: SendEmailOptions) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(options),
          timeoutMs: 15000,
          retries: 1,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      return await response.json();
    },
  });

  const sendWelcomeEmail = useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/welcome`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          timeoutMs: 15000,
          retries: 1,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send welcome email");
      }

      return await response.json();
    },
  });

  const sendNewChatbotEmail = useMutation({
    mutationFn: async ({
      chatbotId,
      chatbotName,
    }: {
      chatbotId: string;
      chatbotName: string;
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email/new-chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ chatbotId, chatbotName }),
          timeoutMs: 15000,
          retries: 1,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send new chatbot email");
      }

      return await response.json();
    },
  });

  const getEmailSettings = useQuery({
    queryKey: ["email-settings", user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          timeoutMs: 15000,
          retries: 1,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get email settings");
      }

      const data = await response.json();
      return data.settings as EmailSettings;
    },
    enabled: !!user,
  });

  const updateEmailSettings = useMutation({
    mutationFn: async (settings: EmailSettings) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(settings),
          timeoutMs: 15000,
          retries: 1,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update email settings");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings", user?.id] });
    },
  });

  return {
    sendEmail,
    sendWelcomeEmail,
    sendNewChatbotEmail,
    getEmailSettings: getEmailSettings.data,
    isLoadingSettings: getEmailSettings.isLoading,
    updateEmailSettings,
    refetchSettings: () =>
      queryClient.invalidateQueries({ queryKey: ["email-settings", user?.id] }),
  };
};

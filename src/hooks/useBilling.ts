import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_start: string | null;
  trial_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

interface Usage {
  tokens_used: number;
  chatbots_created: number;
  documents_uploaded: number;
  api_requests: number;
  emails_sent: number;
}

interface UseBillingReturn {
  subscription: Subscription | null;
  invoices: Invoice[] | null;
  usage: Usage | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useBilling = (): UseBillingReturn => {
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (
            name,
            display_name,
            features,
            limits
          )
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          plan_name: data.subscription_plans?.name || "free",
        };
      }

      return {
        id: "",
        user_id: user.id,
        plan_id: "",
        plan_name: "free",
        stripe_customer_id: "",
        stripe_subscription_id: "",
        status: "free",
        current_period_start: "",
        current_period_end: "",
        trial_start: null,
        trial_end: null,
        canceled_at: null,
        cancel_at_period_end: false,
        metadata: {},
        created_at: "",
        updated_at: "",
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Not authenticated");

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      const { data: usageData, error: usageErr } = await supabase
        .from("usage_tracking")
        .select("metric_name, metric_value")
        .eq("user_id", user.id)
        .gte("period_start", startOfMonth.toISOString())
        .lte("period_end", endOfMonth.toISOString());

      if (usageErr) {
        console.error("Usage tracking error:", usageErr);
      }

      const { count: chatbotsCount, error: chatbotsError } = await supabase
        .from("chatbots")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (chatbotsError) {
        console.error("Chatbots count error:", chatbotsError);
      }

      const chatbotIdsResp = await supabase
        .from("chatbots")
        .select("id")
        .eq("user_id", user.id);

      const chatbotIds = chatbotIdsResp.data?.map((c) => c.id) || [];

      let documentsCount = 0;

      if (chatbotIds.length > 0) {
        const { count, error } = await supabase
          .from("knowledge_base")
          .select("id", { count: "exact", head: true })
          .in("chatbot_id", chatbotIds);

        if (error) {
          console.error("Documents count error:", error);
        } else {
          documentsCount = count || 0;
        }
      }

      const usageMap = new Map();
      usageData?.forEach((item) => {
        usageMap.set(item.metric_name, item.metric_value);
      });

      return {
        tokens_used:
          usageMap.get("chat_tokens_per_month") ||
          usageMap.get("embedding_tokens_per_month") ||
          0,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: documentsCount,
        api_requests: usageMap.get("api_requests_per_minute") || 0,
        emails_sent: usageMap.get("emails_per_month") || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  const refetch = () => {
    refetchSubscription();
    refetchInvoices();
    refetchUsage();
  };

  return {
    subscription: subscription || null,
    invoices: invoices || null,
    usage: usage || null,
    isLoading: subscriptionLoading || invoicesLoading || usageLoading,
    error: subscriptionError || invoicesError || usageError,
    refetch,
  };
};

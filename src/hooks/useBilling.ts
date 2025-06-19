import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

//useBilling fetches and manages subscription/usage data from your database

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
  // Fetch subscription data
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subscription_plans (
            name,
            display_name,
            features,
            limits
          )
        `
        )
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // Transform the data to include plan_name
      if (data) {
        return {
          ...data,
          plan_name: data.subscription_plans?.name || "free",
        };
      }

      // Return default free plan if no subscription exists
      return {
        id: "",
        user_id: session.user.id,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch invoices
  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch usage data
  const {
    data: usage,
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // Get current month's usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Fetch usage tracking data
      const { data: usageData, error: usageError } = await supabase
        .from("usage_tracking")
        .select("metric_name, metric_value")
        .eq("user_id", session.user.id)
        .gte("period_start", startOfMonth.toISOString())
        .lte("period_end", endOfMonth.toISOString());

      if (usageError) {
        console.error("Usage tracking error:", usageError);
      }

      // Fetch chatbots count
      const { count: chatbotsCount, error: chatbotsError } = await supabase
        .from("chatbots")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (chatbotsError) {
        console.error("Chatbots count error:", chatbotsError);
      }

      // Fetch documents count
      const { count: documentsCount, error: documentsError } = await supabase
        .from("knowledge_base")
        .select("id", { count: "exact", head: true })
        .in(
          "chatbot_id",
          await supabase
            .from("chatbots")
            .select("id")
            .eq("user_id", session.user.id)
            .then(({ data }) => data?.map((c) => c.id) || [])
        );

      if (documentsError) {
        console.error("Documents count error:", documentsError);
      }

      // Process usage data
      const usageMap = new Map();
      usageData?.forEach((item) => {
        usageMap.set(item.metric_name, item.metric_value);
      });

      return {
        tokens_used:
          usageMap.get("tokens_per_month") ||
          usageMap.get("embedding_tokens_per_month") ||
          0,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: documentsCount || 0,
        api_requests: usageMap.get("api_requests_per_minute") || 0,
        emails_sent: usageMap.get("emails_per_month") || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
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

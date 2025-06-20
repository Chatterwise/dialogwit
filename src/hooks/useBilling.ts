import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useBilling = () => {
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
        .order("updated_at", { ascending: false }) // <-- selecciona el más reciente
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const plan = data.subscription_plans || {};
        return {
          ...data,
          plan_name: plan.name || "free",
          display_name: plan.display_name || "Free",
          features: plan.features || {},
          limits: plan.limits || {},
          metadata: data.metadata || {},
        };
      }

      return {
        id: "",
        user_id: user.id,
        plan_id: "",
        plan_name: "free",
        customer_id: "",
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
        features: {},
        limits: {},
        display_name: "Free",
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) throw new Error("Not authenticated");

      const { data, error: fetchErr } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const usageQuery = useQuery({
    queryKey: ["usage"],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) throw new Error("Not authenticated");

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const { data: usageData } = await supabase
        .from("usage_tracking")
        .select("metric_name, metric_value")
        .eq("user_id", user.id)
        .gte("period_start", startOfMonth.toISOString())
        .lte("period_end", endOfMonth.toISOString());

      const { count: chatbotsCount } = await supabase
        .from("chatbots")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: chatbotIdsData } = await supabase
        .from("chatbots")
        .select("id")
        .eq("user_id", user.id);

      const chatbotIds = chatbotIdsData?.map(c => c.id) || [];

      let documentsCount = 0;
      if (chatbotIds.length > 0) {
        const { count } = await supabase
          .from("knowledge_base")
          .select("id", { count: "exact", head: true })
          .in("chatbot_id", chatbotIds);
        documentsCount = count || 0;
      }

      const usageMap = new Map();
      usageData?.forEach((u) => usageMap.set(u.metric_name, u.metric_value));

      return {
        tokens_used: usageMap.get("chat_tokens_per_month") || 0,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: documentsCount,
        api_requests: usageMap.get("api_requests_per_minute") || 0,
        emails_sent: usageMap.get("emails_per_month") || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    subscription: subscriptionQuery.data || null,
    invoices: invoicesQuery.data || null,
    usage: usageQuery.data || null,
    isLoading:
      subscriptionQuery.isLoading ||
      invoicesQuery.isLoading ||
      usageQuery.isLoading,
    error:
      subscriptionQuery.error ||
      invoicesQuery.error ||
      usageQuery.error ||
      null,
    refetch: () => {
      subscriptionQuery.refetch();
      invoicesQuery.refetch();
      usageQuery.refetch();
    },
  };
};

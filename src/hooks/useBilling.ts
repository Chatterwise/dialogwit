import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useBilling = () => {
  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans (*)")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const plan = data?.subscription_plans || {};
      return {
        ...data,
        plan_name: plan.name || "free",
        display_name: plan.display_name || "Free",
        features: plan.features || {},
        limits: plan.limits || {},
        metadata: data?.metadata || {},
      };
    },
    staleTime: 5 * 60 * 1000,
  });

const usageQuery = useQuery({
  queryKey: ["usage", subscriptionQuery.data?.id],
  queryFn: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

        const subId = subscriptionQuery.data?.id;
    if (!user || !subId) return null;

  const now = new Date();
  now.setUTCHours(0, 0, 0, 0); // clear time part

const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString(); // '2025-06-01T00:00:00.000Z'
const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString(); // '2025-07-01T00:00:00.000Z'

    console.log("🔍 Filtering with:", {
      userId: user.id,
      subId,
      start,
      end,
    });

const { data: usageData } = await supabase
  .from("usage_tracking")
  .select("metric_name, metric_value")
.eq("user_id", user.id)
.eq("subscription_id", subId)
.gte("period_start", start)
.lt("period_start", end)
//.lt("period_start", next); // where `next` = 2025-07-01

    console.log("✅ usageData raw from Supabase:", usageData);
    const { count: chatbotsCount } = await supabase
      .from("chatbots")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: chatbotIds } = await supabase
      .from("chatbots")
      .select("id")
      .eq("user_id", user.id);

    const chatbotIdsArray = chatbotIds?.map((c) => c.id) || [];

    let documentsCount = 0;
    if (chatbotIdsArray.length > 0) {
      const { count } = await supabase
        .from("knowledge_base")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", chatbotIdsArray);
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
  enabled: !!subscriptionQuery.data?.id,
  staleTime: 2 * 60 * 1000,
});


  // ✅ Force refetch when subscription is ready
  useEffect(() => {
    if (subscriptionQuery.data?.id) {
      usageQuery.refetch();
    }
  }, [subscriptionQuery.data?.id, usageQuery]);

  return {
    subscription: subscriptionQuery.data || null,
    usage: usageQuery.data || null,
    isLoading: subscriptionQuery.isLoading || usageQuery.isLoading,
    error: subscriptionQuery.error || usageQuery.error,
  };
};

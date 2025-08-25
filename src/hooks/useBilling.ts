import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const DEBUG_BILLING = true;

export const useBilling = () => {
  // Get current user once and gate all queries on that
  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user ?? null;
    },
    staleTime: 60_000,
  });

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', userQuery.data?.id],
    enabled: !!userQuery.data, // run for any authenticated user
    queryFn: async () => {
      const user = userQuery.data!;
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans (*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // Graceful free-plan fallback if no row
      const plan = data?.subscription_plans || {};
      return {
        ...data,
        plan_name: plan.name || 'free',
        display_name: plan.display_name || 'Free',
        features: plan.features || {},
        limits: plan.limits || {},
        metadata: data?.metadata || {}
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const usageQuery = useQuery({
    queryKey: ['usage', userQuery.data?.id, subscriptionQuery.data?.plan_name],
    enabled: !!userQuery.data && subscriptionQuery.status !== 'loading',
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const user = userQuery.data!;
      const planTokens = subscriptionQuery.data?.limits?.tokens_per_month ?? 10000;

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

      const { data: usageData, error: usageErr } = await supabase
        .from('usage_tracking')
        .select('metric_name, metric_value, usage_source, period_start')
        .eq('user_id', user.id)
        .gte('period_start', start)
        .lt('period_start', end);

      if (usageErr) throw usageErr;

      let chatTokensUsed = 0;
      let trainingTokensUsed = 0;
      const usageMap = new Map<string, number>();

      (usageData ?? []).forEach((u) => {
        if (u.metric_name === 'chat_tokens_per_month' && u.usage_source === 'chat') {
          chatTokensUsed += u.metric_value;
        }
        if (u.metric_name === 'training_tokens_per_month' && u.usage_source === 'training') {
          trainingTokensUsed += u.metric_value;
        }
        const key = `${u.metric_name}:${u.usage_source}`;
        usageMap.set(key, (usageMap.get(key) || 0) + u.metric_value);
      });

      const tokensUsed = chatTokensUsed + trainingTokensUsed;

      const { data: rolledOverData, error: rolloverErr } = await supabase
        .from('token_rollovers')
        .select('tokens_rolled_over')
        .eq('user_id', user.id);

      if (rolloverErr) throw rolloverErr;

      const rolledOver =
        (rolledOverData ?? []).reduce(
          (sum, row) => sum + (row.tokens_rolled_over || 0),
          0
        ) || 0;

      const availableTokens = Math.max(0, planTokens + rolledOver - tokensUsed);

      const { count: chatbotsCount, error: botsErr } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (botsErr) throw botsErr;

      if (DEBUG_BILLING) {
        console.log('📊 Tokens used:', tokensUsed);
        console.log('📦 Rolled-over Tokens:', rolledOver);
        console.log('💰 Available Tokens:', availableTokens);
        console.log('💬 Chat Tokens Used:', chatTokensUsed);
        console.log('📚 Training Tokens Used:', trainingTokensUsed);
      }

      return {
        tokens_used: tokensUsed,
        chat_tokens_used: chatTokensUsed,
        training_tokens_used: trainingTokensUsed,
        rolled_over: rolledOver,
        available_tokens: availableTokens,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: 0,
        api_requests: usageMap.get('api_requests_per_minute:chat') || 0,
        emails_sent: usageMap.get('emails_per_month:chat') || 0,
      };
    },
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices', userQuery.data?.id],
    enabled: !!userQuery.data,
    queryFn: async () => {
      const user = userQuery.data!;
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    subscription: subscriptionQuery.data || null,
    usage: usageQuery.data || null,
    invoices: invoicesQuery.data || [],
    isLoading:
      userQuery.isLoading ||
      subscriptionQuery.isLoading ||
      usageQuery.isLoading ||
      invoicesQuery.isLoading,
    error: userQuery.error || subscriptionQuery.error || usageQuery.error || invoicesQuery.error,
  };
};

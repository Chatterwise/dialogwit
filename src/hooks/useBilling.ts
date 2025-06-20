import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const DEBUG_BILLING = true;

export const useBilling = () => {
  const subscriptionQuery = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans (*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

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
    staleTime: 300000,
  });

  const usageQuery = useQuery({
    queryKey: ['usage', subscriptionQuery.data?.id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const subId = subscriptionQuery.data?.id || null;
      const planTokens = subscriptionQuery.data?.limits?.tokens_per_month || 10000;

      if (!user) {
        return {
          tokens_used: 0,
          rolled_over: 0,
          available_tokens: 10000,
          chatbots_created: 0,
          documents_uploaded: 0,
          api_requests: 0,
          emails_sent: 0
        };
      }

      const start = '2025-06-01T00:00:00Z';
      const end = '2025-07-01T00:00:00Z';

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('metric_name, metric_value')
        .eq('user_id', user.id)
        .eq('subscription_id', subId)
        .gte('period_start', start)
        .lt('period_start', end);

      const usageMap = new Map();
      usageData?.forEach((u) => {
        if (DEBUG_BILLING) console.log('🔑 usage metric:', u.metric_name, 'value:', u.metric_value);
        usageMap.set(u.metric_name, u.metric_value);
      });

      const tokensUsed = usageMap.get('chat_tokens_per_month') || 0;

      const { data: rolledOverData } = await supabase
        .from('token_rollovers')
        .select('tokens_rolled_over')
        .eq('user_id', user.id)
        .eq('subscription_id', subId);

      const rolledOver = rolledOverData?.reduce((sum, row) => sum + (row.tokens_rolled_over || 0), 0) || 0;
      const availableTokens = planTokens + rolledOver - tokensUsed;

      const { count: chatbotsCount } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        tokens_used: tokensUsed,
        rolled_over: rolledOver,
        available_tokens: availableTokens,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: 0,
        api_requests: usageMap.get('api_requests_per_minute') || 0,
        emails_sent: usageMap.get('emails_per_month') || 0
      };
    },
    enabled: !!subscriptionQuery.data?.id,
    staleTime: 120000,
  });

  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 300000,
  });

  useEffect(() => {
    if (subscriptionQuery.data?.id !== undefined) usageQuery.refetch();
  }, [subscriptionQuery.data?.id]);

  return {
    subscription: subscriptionQuery.data || null,
    usage: usageQuery.data || null,
    invoices: invoicesQuery.data || [],
    isLoading: subscriptionQuery.isLoading || usageQuery.isLoading || invoicesQuery.isLoading,
    error: subscriptionQuery.error || usageQuery.error || invoicesQuery.error,
  };
};
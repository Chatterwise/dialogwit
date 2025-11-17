import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const DEBUG_BILLING = true;

type Json = Record<string, any> | null;

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: string | null;
  current_period_start: string | null; // ISO
  current_period_end: string | null;   // ISO
  metadata: Json;
  // Plan snapshot fields on subscription (as your sample shows)
  name?: string | null;
  display_name?: string | null;
  description?: string | null;
  features?: Json;
  limits?: Json; // { tokens_per_month?: number, ... }
  // If you still do an explicit join, this will be present:
  subscription_plans?: {
    name?: string | null;
    display_name?: string | null;
    features?: Json;
    limits?: Json;
  } | null;
};

const TOKENS_PER_CHAT = 5_000_000 / 12_000;

export const useBilling = () => {
  // 1) Auth
  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user ?? null;
    },
    staleTime: 60_000,
  });

  // 2) Subscription (+ plan info if joined)
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', userQuery.data?.id],
    enabled: !!userQuery.data, // only when logged in
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const user = userQuery.data!;
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans (*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return data as unknown as SubscriptionRow;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Helper to resolve limits/features/display safely from either snapshot or joined plan.
  const resolvePlanInfo = (sub: SubscriptionRow | null) => {
    const snapLimits = (sub?.limits ?? {}) as Record<string, any>;
    const joinLimits = (sub?.subscription_plans?.limits ?? {}) as Record<string, any>;
    const limits = { ...joinLimits, ...snapLimits };

    const snapFeatures = (sub?.features ?? {}) as Record<string, any>;
    const joinFeatures = (sub?.subscription_plans?.features ?? {}) as Record<string, any>;
    const features = { ...joinFeatures, ...snapFeatures };

    const planName =
      sub?.name ||
      sub?.subscription_plans?.name ||
      'free';

    const displayName =
      sub?.display_name ||
      sub?.subscription_plans?.display_name ||
      'Free';

    const tokensPerMonth =
      Number(limits.tokens_per_month ?? 10000);

    return {
      plan_name: planName,
      display_name: displayName,
      features,
      limits: { ...limits, tokens_per_month: tokensPerMonth },
      metadata: sub?.metadata ?? {},
    };
  };

  // 3) Usage (anniversary window if present, else calendar month)
  const usageQuery = useQuery({
    queryKey: ['usage', userQuery.data?.id, subscriptionQuery.data?.id],
    enabled: !!userQuery.data && subscriptionQuery.isSuccess,
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const user = userQuery.data!;
      const sub = subscriptionQuery.data ?? null;

      const plan = resolvePlanInfo(sub);
      const planTokens = Number(plan.limits.tokens_per_month ?? 10000);

      let startISO: string;
      let endISO: string;

      if (sub?.current_period_start && sub?.current_period_end) {
        startISO = new Date(sub.current_period_start).toISOString();
        endISO = new Date(sub.current_period_end).toISOString();
      } else {
        const now = new Date();
        startISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        endISO = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      }

      const { data: usageData, error: usageErr } = await supabase
        .from('usage_tracking')
        .select('metric_name, metric_value, usage_source, period_start')
        .eq('user_id', user.id)
        .gte('period_start', startISO)
        .lt('period_start', endISO);

      if (usageErr) throw usageErr;

      let chatTokensUsed = 0;
      let trainingTokensUsed = 0;
      const usageMap = new Map<string, number>();

      (usageData ?? []).forEach((u) => {
        const metric = u.metric_name;
        const src = u.usage_source;

        if (metric === 'chat_tokens_per_month' && src === 'chat') {
          chatTokensUsed += u.metric_value;
        }
        if (metric === 'training_tokens_per_month' && src === 'training') {
          trainingTokensUsed += u.metric_value;
        }

        const key = `${metric}:${src}`;
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

      const estimatedChatsAvailable = Math.max(
        0,
        Math.floor(availableTokens / TOKENS_PER_CHAT)
      );
      const estimatedChatsUsed = Math.floor(tokensUsed / TOKENS_PER_CHAT);
      const estimatedChatsTotal = estimatedChatsAvailable + estimatedChatsUsed;
      const chatsMessage = `Approx. ${estimatedChatsAvailable.toLocaleString()} chats remaining this period.`;

      const { count: chatbotsCount, error: botsErr } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (botsErr) throw botsErr;

      if (DEBUG_BILLING) {
        console.log('📅 Window:', { startISO, endISO });
        console.log('📊 Tokens used:', tokensUsed);
        console.log('📦 Rolled-over Tokens:', rolledOver);
        console.log('💰 Available Tokens:', availableTokens);
        console.log('💬 Chat Tokens Used:', chatTokensUsed);
        console.log('📚 Training Tokens Used:', trainingTokensUsed);
        console.log('💬 Chats (est):', {
          total: estimatedChatsTotal,
          used: estimatedChatsUsed,
          available: estimatedChatsAvailable,
        });
      }

      return {
        plan,
        window: { startISO, endISO },
        tokens_used: tokensUsed,
        chat_tokens_used: chatTokensUsed,
        training_tokens_used: trainingTokensUsed,
        rolled_over: rolledOver,
        available_tokens: availableTokens,
        estimated_chats_total: estimatedChatsTotal,
        estimated_chats_used: estimatedChatsUsed,
        estimated_chats_available: estimatedChatsAvailable,
        chats_message: chatsMessage,
        chatbots_created: chatbotsCount || 0,
        documents_uploaded: 0,
        api_requests: usageMap.get('api_requests_per_minute:chat') || 0,
        emails_sent: usageMap.get('emails_per_month:chat') || 0,
      };
    },
  });

  // 4) Invoices
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
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const subscription = (() => {
    const sub = subscriptionQuery.data ?? null;
    const plan = resolvePlanInfo(sub);
    return {
      ...(sub || {}),
      plan_name: plan.plan_name,
      display_name: plan.display_name,
      features: plan.features,
      limits: plan.limits,
      metadata: plan.metadata,
    };
  })();

  return {
    subscription: subscription || null,
    usage: usageQuery.data || null,
    invoices: invoicesQuery.data || [],
    isLoading:
      userQuery.isLoading ||
      subscriptionQuery.isLoading ||
      usageQuery.isLoading ||
      invoicesQuery.isLoading,
    error:
      userQuery.error ||
      subscriptionQuery.error ||
      usageQuery.error ||
      invoicesQuery.error,
  };
};

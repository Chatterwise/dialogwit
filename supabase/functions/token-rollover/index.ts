import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (_req) => {
  const today = new Date();
  const periodStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const periodEnd = new Date(today.getFullYear(), today.getMonth(), 1);

  const startStr = periodStart.toISOString().slice(0, 10);
  const endStr = periodEnd.toISOString().slice(0, 10);

  // Get all active subscriptions from the previous month
  const { data: subscriptions, error: subError } = await supabase
    .from('user_subscriptions')
    .select('id, user_id, plan_id, subscription_plans(limits)')
    .neq('status', 'canceled');

  if (subError) return new Response(JSON.stringify({ error: subError.message }), { status: 500 });

  for (const sub of subscriptions) {
    const limit = sub.subscription_plans?.limits?.tokens_per_month ?? 0;
    if (limit === 0) continue;

    const { data: usageData } = await supabase
      .from('usage_tracking')
      .select('metric_value')
      .eq('subscription_id', sub.id)
      .eq('user_id', sub.user_id)
      .eq('metric_name', 'chat_tokens_per_month')
      .gte('period_start', startStr)
      .lt('period_end', endStr)
      .maybeSingle();

    const used = usageData?.metric_value ?? 0;
    const unused = limit - used;

    if (unused <= 0) continue;

    // Skip if already rolled over
    const { count } = await supabase
      .from('token_rollovers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', sub.user_id)
      .eq('subscription_id', sub.id)
      .eq('rollover_month', endStr);

    if (count && count > 0) continue;

    const insert = await supabase.from('token_rollovers').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      tokens_rolled: unused,
      rollover_month: endStr,
      created_at: new Date().toISOString(),
    });

    if (insert.error) {
      console.error(`❌ Error rolling over for user ${sub.user_id}: ${insert.error.message}`);
    }
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
});

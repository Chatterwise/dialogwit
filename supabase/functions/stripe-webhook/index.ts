// stripe-webhook.ts (last working version)
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-04-10',
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0'
  }
});
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*'
};
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response('ok', {
    headers: corsHeaders
  });
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  let event;
  if (signature) {
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'));
    } catch (err) {
      console.error('❌ Webhook signature verification failed.', err.message);
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400,
        headers: corsHeaders
      });
    }
  } else {
    try {
      event = JSON.parse(body);
      console.log('⚠️ No signature — assuming test mode. Event type:', event.type);
    } catch  {
      return new Response(`Invalid JSON payload`, {
        status: 400,
        headers: corsHeaders
      });
    }
  }
  if (![
    'customer.subscription.created',
    'customer.subscription.updated'
  ].includes(event.type)) {
    console.log(`ℹ️ Ignored event type: ${event.type}`);
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: corsHeaders
    });
  }
  const subscription = event.data.object;
  if (!subscription || !subscription.customer || !subscription.items?.data?.[0]?.price?.id) {
    console.error('❌ Invalid subscription data:', subscription);
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: corsHeaders
    });
  }
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0].price.id;
  const currentPeriodStart = new Date(subscription.items.data[0].current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.items.data[0].current_period_end * 1000);
  let { data: stripeCustomer } = await supabase.from('stripe_customers').select('user_id').eq('customer_id', customerId).single();
  if (!stripeCustomer?.user_id) {
    const userIdFromMetadata = subscription.metadata?.user_id;
    if (!userIdFromMetadata) {
      console.error('❌ Missing user_id in metadata');
      return new Response(JSON.stringify({
        received: true
      }), {
        headers: corsHeaders
      });
    }
    await supabase.from('stripe_customers').insert({
      customer_id: customerId,
      user_id: userIdFromMetadata,
      created_at: new Date().toISOString()
    });
    stripeCustomer = {
      user_id: userIdFromMetadata
    };
  }
  const userId = stripeCustomer.user_id;
  const { data: plan } = await supabase.from('subscription_plans').select('id, limits').eq('stripe_price_id_monthly', priceId).single();
  const planId = plan?.id;
  await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    plan_id: planId,
    status: subscription.status,
    current_period_start: currentPeriodStart.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });
  const { data: userSubRecord } = await supabase.from('user_subscriptions').select('id').eq('user_id', userId).eq('stripe_subscription_id', subscription.id).maybeSingle();
  const userSubscriptionId = userSubRecord?.id;
  await supabase.from('stripe_subscriptions').upsert({
    customer_id: customerId,
    subscription_id: subscription.id,
    price_id: priceId,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    status: subscription.status
  });
  const rolloverStart = new Date(currentPeriodStart);
  rolloverStart.setMonth(rolloverStart.getMonth() - 1);
  const rolloverEnd = currentPeriodStart;
  const { data: existingRollover } = await supabase.from('token_rollovers').select('id').eq('user_id', userId).eq('from_period_start', currentPeriodStart.toISOString()).maybeSingle();
  if (!existingRollover) {
    const { data: usage } = await supabase.from('usage_tracking').select('metric_value').eq('user_id', userId).eq('subscription_id', subscription.id).eq('metric_name', 'chat_tokens_per_month').gte('period_start', rolloverStart.toISOString()).lt('period_end', rolloverEnd.toISOString()).maybeSingle();
    const used = usage?.metric_value || 0;
    const rolloverLimit = plan?.limits?.tokens_per_month || 0;
    const rollover = Math.max(0, rolloverLimit - used);
    console.log('📊 Usage in last period:', used);
    console.log('🎯 Plan limit:', rolloverLimit);
    console.log('📥 Calculated rollover amount:', rollover);
    if (rollover > 0 && userSubscriptionId) {
      await supabase.from('token_rollovers').insert({
        user_id: userId,
        subscription_id: userSubscriptionId,
        tokens_rolled_over: rollover,
        from_period_start: currentPeriodStart.toISOString(),
        from_period_end: currentPeriodEnd.toISOString()
      });
    }
  }
  return new Response(JSON.stringify({
    received: true
  }), {
    headers: corsHeaders
  });
});

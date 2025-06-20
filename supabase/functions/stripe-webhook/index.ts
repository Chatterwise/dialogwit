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
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET'));
  } catch (err) {
    console.error('❌ Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
      headers: corsHeaders
    });
  }
  const subscription = event.data.object;
  const customerId = subscription.customer;
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    // 1. Find user_id from stripe_customers
    let { data: stripeCustomer } = await supabase.from('stripe_customers').select('user_id').eq('customer_id', customerId).single();
    // 2. Recover stripe_customer entry if needed
    if (!stripeCustomer || !stripeCustomer.user_id) {
      const userId = subscription.metadata?.user_id ?? null;
      if (!userId) {
        console.error('❌ No stripe_customers entry and user_id missing in metadata:', customerId);
        return new Response(JSON.stringify({
          received: true
        }), {
          headers: corsHeaders
        });
      }
      const { error: insertError } = await supabase.from('stripe_customers').insert({
        customer_id: customerId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      if (insertError) {
        console.error('❌ Could not insert stripe_customer:', insertError.message);
        return new Response(JSON.stringify({
          received: true
        }), {
          headers: corsHeaders
        });
      }
      console.log(`✅ Recovered and inserted stripe_customers entry for ${userId}`);
      stripeCustomer = {
        user_id: userId
      };
    }
    // 3. Match plan
    const { data: plan } = await supabase.from('subscription_plans').select('id').eq('stripe_price_id_monthly', subscription.items.data[0].price.id).single();
    if (!plan) {
      console.error('❌ No plan matched for price ID:', subscription.items.data[0].price.id);
      return new Response(JSON.stringify({
        received: true
      }), {
        headers: corsHeaders
      });
    }
    // 4. Prepare data
    console.log('📦 Subscription ID:', subscription.id);
    const subscriptionData = {
      user_id: stripeCustomer.user_id,
      stripe_subscription_id: subscription.id,
      plan_id: plan.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      // payment_method_brand: subscription.default_payment_method?.card?.brand ?? null,
      // payment_method_last4: subscription.default_payment_method?.card?.last4 ?? null,
      updated_at: new Date().toISOString()
    };
    // 5. Upsert user_subscriptions (replaces insert/update)
    const { error: upsertError, data: upsertResult } = await supabase.from('user_subscriptions').upsert(subscriptionData, {
      onConflict: 'user_id'
    });
    console.log('🔄 Upsert result:', upsertResult);
    if (upsertError) {
      console.error('❌ Upsert error:', upsertError.message);
    } else {
      console.log(`✅ Upserted user_subscriptions for ${stripeCustomer.user_id}`);
    }
    // 6. Update stripe_subscriptions
    await supabase.from('stripe_subscriptions').upsert({
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0].price.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_method_brand: subscription.default_payment_method?.card?.brand ?? null,
      payment_method_last4: subscription.default_payment_method?.card?.last4 ?? null,
      status: subscription.status
    });
  }
  return new Response(JSON.stringify({
    received: true
  }), {
    headers: corsHeaders
  });
});

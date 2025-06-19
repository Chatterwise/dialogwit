import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0'
  }
});
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
Deno.serve(async (req)=>{
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204
      });
    }
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405
      });
    }
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', {
        status: 400
      });
    }
    const body = await req.text();
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, {
        status: 400
      });
    }
    EdgeRuntime.waitUntil(handleEvent(event));
    return Response.json({
      received: true
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return Response.json({
      error: error.message
    }, {
      status: 500
    });
  }
});
async function handleEvent(event) {
  const stripeData = event?.data?.object ?? {};
  if (!stripeData || !('customer' in stripeData)) return;
  const customerId = stripeData.customer;
  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
    return;
  }
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }
  let isSubscription = true;
  if (event.type === 'checkout.session.completed') {
    const { mode } = stripeData;
    isSubscription = mode === 'subscription';
    console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
  }
  const { mode, payment_status } = stripeData;
  if (isSubscription) {
    console.info(`Starting subscription sync for customer: ${customerId}`);
    await syncCustomerFromStripe(customerId);
  } else if (mode === 'payment' && payment_status === 'paid') {
    try {
      const { id: checkout_session_id, payment_intent, amount_subtotal, amount_total, currency } = stripeData;
      const { error: orderError } = await supabase.from('stripe_orders').insert({
        checkout_session_id,
        payment_intent_id: payment_intent,
        customer_id: customerId,
        amount_subtotal,
        amount_total,
        currency,
        payment_status,
        status: 'completed'
      });
      if (orderError) {
        console.error('Error inserting order:', orderError);
        return;
      }
      console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
    } catch (error) {
      console.error('Error processing one-time payment:', error);
    }
  }
}
async function syncCustomerFromStripe(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: [
        'data.default_payment_method'
      ]
    });
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert({
        customer_id: customerId,
        subscription_status: 'not_started'
      }, {
        onConflict: 'customer_id'
      });
      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }
    const subscription = subscriptions.data[0];
    // Update stripe_subscriptions table
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert({
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0].price.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      ...subscription.default_payment_method && typeof subscription.default_payment_method !== 'string' ? {
        payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
        payment_method_last4: subscription.default_payment_method.card?.last4 ?? null
      } : {},
      status: subscription.status
    }, {
      onConflict: 'customer_id'
    });
    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    // NEW: Update user_subscriptions table
    await updateUserSubscription(customerId, subscription);
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
// NEW: Function to update user_subscriptions table
async function updateUserSubscription(customerId, subscription) {
  try {
    // Get user_id from user_subscriptions table instead of stripe_customers
    const { data: userSubData, error: userSubError } = await supabase.from('user_subscriptions').select('user_id').eq('stripe_customer_id', customerId).single();
    if (userSubError || !userSubData) {
      throw new Error(`User not found for customer ${customerId}: ${userSubError?.message}`);
    }
    const userId = userSubData.user_id;
    const priceId = subscription.items.data[0].price.id;
    // Get plan id from subscription_plans table
    const { data: planData, error: planError } = await supabase.from('subscription_plans').select('id').or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`).single();
    if (planError || !planData) {
      throw new Error(`Plan not found for price ID ${priceId}: ${planError?.message}`);
    }
    const planId = planData.id;
    // Upsert user_subscriptions table
    const { error: userSubErrorUpsert } = await supabase.from('user_subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
    }, {
      onConflict: 'user_id'
    });
    if (userSubErrorUpsert) {
      throw new Error(`Failed to update user subscription: ${userSubErrorUpsert.message}`);
    }
    console.info(`Successfully updated user subscription for user: ${userId}`);
  } catch (error) {
    console.error(`Failed to update user subscription: ${error.message}`);
    throw error;
  }
}

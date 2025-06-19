import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts';
import { authenticateRequest, AuthenticationError } from '../_shared/middleware/authentication.ts';
import { AuditLogger } from '../_shared/middleware/auditLogging.ts';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
});
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  const url = new URL(req.url);
  const path = url.pathname.replace('/billing', '');
  // Enhanced logging for debugging
  console.log('Billing function called:', {
    path,
    method: req.method
  });
  console.log('Environment check:', {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceRoleKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    supabaseUrl: Deno.env.get('SUPABASE_URL')?.substring(0, 20) + '...'
  });
  let supabaseClient;
  try {
    supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    console.log('Supabase client created successfully');
  } catch (clientError) {
    console.error('Failed to create Supabase client:', clientError);
    return createErrorResponse('Database connection failed', 500);
  }
  const auditLogger = new AuditLogger(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  try {
    // Webhook endpoint (no auth required)
    if (path === '/webhook' && req.method === 'POST') {
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        return createErrorResponse('Missing stripe signature', 400);
      }
      const body = await req.text();
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') || '');
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return createErrorResponse('Invalid signature', 400);
      }
      // Handle the event
      switch(event.type){
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionEvent(event, supabaseClient, auditLogger);
          break;
        case 'invoice.payment_succeeded':
        case 'invoice.payment_failed':
          await handleInvoiceEvent(event, supabaseClient, auditLogger);
          break;
        case 'customer.created':
        case 'customer.updated':
          await handleCustomerEvent(event, supabaseClient, auditLogger);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      return createSuccessResponse({
        received: true
      });
    }
    // All other endpoints require authentication
    let authContext;
    try {
      authContext = await authenticateRequest(req, Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      console.log('Authentication successful for user:', authContext.userId);
    } catch (error) {
      console.error('Authentication failed:', error);
      if (error instanceof AuthenticationError) {
        return createErrorResponse('Unauthorized', 401);
      }
      throw error;
    }
    // Get subscription plans
    if (path === '/plans' && req.method === 'GET') {
      const { data: plans, error } = await supabaseClient.from('subscription_plans').select(`
          *,
          usage_limits(*)
        `).eq('is_active', true).order('sort_order');
      if (error) throw error;
      await auditLogger.logAction(authContext.userId, 'view_subscription_plans', 'billing', undefined, {}, clientIP, userAgent, true);
      return createSuccessResponse({
        plans
      });
    }
    // Get current subscription
    if (path === '/subscription' && req.method === 'GET') {
      const { data: subscription, error } = await supabaseClient.from('user_subscriptions').select(`
          *,
          subscription_plans(*)
        `).eq('user_id', authContext.userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      // Get current usage
      const { data: usage } = await supabaseClient.from('usage_tracking').select('*').eq('user_id', authContext.userId).gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
      return createSuccessResponse({
        subscription: subscription || null,
        usage: usage || []
      });
    }
    // Create checkout session
    if (path === '/create-checkout' && req.method === 'POST') {
      const body = await req.json();
      const { plan_id, billing_cycle = 'monthly' } = body;
      // Get plan details
      const { data: plan, error: planError } = await supabaseClient.from('subscription_plans').select('*').eq('id', plan_id).single();
      if (planError || !plan) {
        return createErrorResponse('Plan not found', 404);
      }
      // Get or create Stripe customer
      let customerId = await getOrCreateStripeCustomer(authContext.userId, supabaseClient);
      const priceId = billing_cycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;
      if (!priceId) {
        return createErrorResponse('Price not configured for this plan', 400);
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: [
          'card'
        ],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/dashboard`,
        metadata: {
          user_id: authContext.userId,
          plan_id: plan_id
        }
      });
      await auditLogger.logAction(authContext.userId, 'create_checkout_session', 'billing', plan_id, {
        plan_name: plan.name,
        billing_cycle
      }, clientIP, userAgent, true);
      return createSuccessResponse({
        checkout_url: session.url
      });
    }
    // Create customer portal session
    if (path === '/customer-portal' && req.method === 'POST') {
      // Use maybeSingle instead of single to handle cases where no subscription exists
      const { data: subscription } = await supabaseClient.from('user_subscriptions').select('stripe_customer_id').eq('user_id', authContext.userId).maybeSingle();
      if (!subscription?.stripe_customer_id) {
        // If no subscription exists, create a Stripe customer
        const customerId = await getOrCreateStripeCustomer(authContext.userId, supabaseClient);
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${req.headers.get('origin')}/dashboard`
        });
        await auditLogger.logAction(authContext.userId, 'access_customer_portal', 'billing', undefined, {}, clientIP, userAgent, true);
        return createSuccessResponse({
          portal_url: session.url
        });
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${req.headers.get('origin')}/dashboard`
      });
      await auditLogger.logAction(authContext.userId, 'access_customer_portal', 'billing', undefined, {}, clientIP, userAgent, true);
      return createSuccessResponse({
        portal_url: session.url
      });
    }
    // Get usage limits
    if (path === '/usage-check' && req.method === 'POST') {
      console.log('Processing usage-check request');
      const body = await req.json();
      const { metric_name } = body;
      if (!metric_name) {
        return createErrorResponse('metric_name is required', 400);
      }
      console.log('Checking usage for:', {
        userId: authContext.userId,
        metric_name
      });
      try {
        // Test database connection first
        const { data: testData, error: testError } = await supabaseClient.from('users').select('id').eq('id', authContext.userId).single();
        if (testError) {
          console.error('Database connection test failed:', testError);
          return createErrorResponse(`Database connection failed: ${testError.message}`, 500);
        }
        console.log('Database connection test successful');
        // Try the RPC call with enhanced error handling
        const { data, error } = await supabaseClient.rpc('check_usage_limit', {
          p_user_id: authContext.userId,
          p_metric_name: metric_name
        });
        if (error) {
          console.error('RPC check_usage_limit error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          // Return a more specific error message
          return createErrorResponse(`Usage check failed: ${error.message || 'Database RPC error'}`, 500);
        }
        console.log('Usage check successful:', data);
        return createSuccessResponse({
          usage_check: data
        });
      } catch (rpcError) {
        console.error('RPC call exception:', {
          error: rpcError,
          message: rpcError?.message,
          stack: rpcError?.stack
        });
        // Handle specific fetch errors
        if (rpcError?.message?.includes('fetch')) {
          return createErrorResponse('Database connection failed - please check network connectivity', 500);
        }
        return createErrorResponse(`Usage check failed: ${rpcError?.message || 'Unknown RPC error'}`, 500);
      }
    }
    // Track usage
    if (path === '/track-usage' && req.method === 'POST') {
      const body = await req.json();
      const { metric_name, increment = 1 } = body;
      const { error } = await supabaseClient.rpc('increment_usage', {
        p_user_id: authContext.userId,
        p_metric_name: metric_name,
        p_increment: increment
      });
      if (error) throw error;
      return createSuccessResponse({
        success: true
      });
    }
    return createErrorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('Billing error:', {
      error,
      message: error?.message,
      stack: error?.stack,
      path,
      method: req.method
    });
    return createErrorResponse('Internal server error', 500);
  }
});
async function getOrCreateStripeCustomer(userId, supabaseClient) {
  // Check if customer already exists
  const { data: subscription } = await supabaseClient.from('user_subscriptions').select('stripe_customer_id').eq('user_id', userId).maybeSingle();
  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }
  // Get user email
  const { data: user } = await supabaseClient.from('users').select('email, full_name').eq('id', userId).single();
  // Create Stripe customer with fallback for name
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.full_name || user.email || 'Customer',
    metadata: {
      user_id: userId
    }
  });
  // Upsert subscription record to ensure it exists with the stripe_customer_id
  await supabaseClient.from('user_subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customer.id
  }, {
    onConflict: 'user_id'
  });
  return customer.id;
}
async function handleSubscriptionEvent(event, supabaseClient, auditLogger) {
  const subscription = event.data.object;
  const customerId = subscription.customer;
  // Get user ID from customer
  const { data: userSub } = await supabaseClient.from('user_subscriptions').select('user_id, id').eq('stripe_customer_id', customerId).single();
  if (!userSub) {
    console.error('User subscription not found for customer:', customerId);
    return;
  }
  // Update subscription status
  const updates = {
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end
  };
  if (subscription.canceled_at) {
    updates.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }
  if (subscription.trial_end) {
    updates.trial_end = new Date(subscription.trial_end * 1000).toISOString();
  }
  await supabaseClient.from('user_subscriptions').update(updates).eq('id', userSub.id);
  // Log billing event
  await supabaseClient.from('billing_events').insert({
    user_id: userSub.user_id,
    subscription_id: userSub.id,
    event_type: event.type,
    event_data: event.data.object,
    stripe_event_id: event.id,
    processed: true
  });
  await auditLogger.logAction(userSub.user_id, 'subscription_updated', 'billing', userSub.id, {
    event_type: event.type,
    status: subscription.status
  }, 'stripe-webhook', 'stripe-webhook', true);
}
async function handleInvoiceEvent(event, supabaseClient, auditLogger) {
  const invoice = event.data.object;
  const customerId = invoice.customer;
  // Get user ID from customer
  const { data: userSub } = await supabaseClient.from('user_subscriptions').select('user_id, id').eq('stripe_customer_id', customerId).single();
  if (!userSub) return;
  // Store invoice record
  await supabaseClient.from('invoices').upsert({
    user_id: userSub.user_id,
    subscription_id: userSub.id,
    stripe_invoice_id: invoice.id,
    amount_paid: invoice.amount_paid,
    amount_due: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status,
    invoice_pdf: invoice.invoice_pdf,
    period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
    period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null
  }, {
    onConflict: 'stripe_invoice_id'
  });
  await auditLogger.logAction(userSub.user_id, 'invoice_processed', 'billing', userSub.id, {
    event_type: event.type,
    invoice_status: invoice.status,
    amount: invoice.amount_paid
  }, 'stripe-webhook', 'stripe-webhook', true);
}
async function handleCustomerEvent(event, supabaseClient, auditLogger) {
  const customer = event.data.object;
  // Log customer event
  await supabaseClient.from('billing_events').insert({
    event_type: event.type,
    event_data: event.data.object,
    stripe_event_id: event.id,
    processed: true
  });
}

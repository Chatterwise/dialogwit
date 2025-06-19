import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts';
import { authenticateRequest, AuthenticationError } from '../_shared/middleware/authentication.ts';
import { AuditLogger } from '../_shared/middleware/auditLogging.ts';
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
});
// Enhanced logging function
function logError(context, error, additionalData) {
  console.error(`[CUSTOMER_PORTAL_ERROR] ${context}:`, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    additionalData,
    timestamp: new Date().toISOString()
  });
}
function logInfo(context, data) {
  console.log(`[CUSTOMER_PORTAL_INFO] ${context}:`, {
    data,
    timestamp: new Date().toISOString()
  });
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const auditLogger = new AuditLogger(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  logInfo('Request received', {
    method: req.method,
    url: req.url,
    clientIP,
    userAgent,
    headers: Object.fromEntries(req.headers.entries())
  });
  try {
    // Authenticate request
    let authContext1;
    try {
      logInfo('Starting authentication');
      authContext1 = await authenticateRequest(req, Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
      logInfo('Authentication successful', {
        userId: authContext1.userId
      });
    } catch (error) {
      logError('Authentication failed', error);
      if (error instanceof AuthenticationError) {
        return createErrorResponse('Unauthorized', 401, {
          error: error.message
        });
      }
      throw error;
    }
    // Check environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      logError('Missing STRIPE_SECRET_KEY environment variable');
      return createErrorResponse('Stripe configuration error', 500, {
        error: 'Payment service not properly configured'
      });
    }
    logInfo('Fetching user subscription', {
      userId: authContext1.userId
    });
    // Use maybeSingle instead of single to handle cases where no subscription exists
    const { data: subscription, error: subscriptionError } = await supabaseClient.from('user_subscriptions').select('stripe_customer_id').eq('user_id', authContext1.userId).maybeSingle();
    if (subscriptionError) {
      logError('Database error fetching subscription', subscriptionError, {
        userId: authContext1.userId
      });
      return createErrorResponse('Database error', 500, {
        error: 'Failed to fetch subscription data',
        details: subscriptionError.message
      });
    }
    logInfo('Subscription query result', {
      hasSubscription: !!subscription,
      hasStripeCustomerId: !!subscription?.stripe_customer_id,
      userId: authContext1.userId
    });
    let customerId;
    if (!subscription?.stripe_customer_id) {
      logInfo('No existing Stripe customer, creating new one', {
        userId: authContext1.userId
      });
      // If no subscription exists, create a Stripe customer
      try {
        customerId = await getOrCreateStripeCustomer(authContext1.userId, supabaseClient);
        logInfo('Successfully created/retrieved Stripe customer', {
          userId: authContext1.userId,
          customerId
        });
      } catch (error) {
        logError('Failed to create/retrieve Stripe customer', error, {
          userId: authContext1.userId
        });
        return createErrorResponse('Failed to create customer', 500, {
          error: 'Could not create or retrieve customer account',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    } else {
      customerId = subscription.stripe_customer_id;
      logInfo('Using existing Stripe customer', {
        userId: authContext1.userId,
        customerId
      });
    }
    // Create Stripe billing portal session
    logInfo('Creating Stripe billing portal session', {
      customerId
    });
    const returnUrl = `${req.headers.get('origin')}/billing`;
    logInfo('Portal return URL', {
      returnUrl
    });
    let session;
    try {
      session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });
      logInfo('Stripe billing portal session created successfully', {
        sessionId: session.id,
        customerId,
        returnUrl: session.return_url
      });
    } catch (stripeError) {
      logError('Stripe API error creating billing portal session', stripeError, {
        customerId,
        returnUrl,
        stripeErrorType: stripeError.type,
        stripeErrorCode: stripeError.code
      });
      return createErrorResponse('Stripe service error', 503, {
        error: 'Failed to create billing portal session',
        details: stripeError.message,
        code: stripeError.code,
        type: stripeError.type
      });
    }
    // Log successful audit event
    try {
      await auditLogger.logAction(authContext1.userId, 'access_customer_portal', 'billing', session.id, {
        customerId,
        returnUrl
      }, clientIP, userAgent, true);
      logInfo('Audit log recorded successfully');
    } catch (auditError) {
      logError('Failed to log audit event', auditError);
    // Don't fail the request if audit logging fails
    }
    logInfo('Returning successful response', {
      portalUrl: session.url,
      sessionId: session.id
    });
    return createSuccessResponse({
      portal_url: session.url
    });
  } catch (error) {
    logError('Unexpected error in customer portal function', error, {
      userId: authContext?.userId,
      requestUrl: req.url,
      requestMethod: req.method
    });
    // Log failed audit event
    try {
      await auditLogger.logAction(authContext?.userId, 'access_customer_portal_failed', 'billing', undefined, {
        error: error instanceof Error ? error.message : String(error)
      }, clientIP, userAgent, false, error instanceof Error ? error.message : String(error));
    } catch (auditError) {
      logError('Failed to log failed audit event', auditError);
    }
    return createErrorResponse('Internal server error', 500, {
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});
async function getOrCreateStripeCustomer(userId, supabaseClient) {
  logInfo('Starting getOrCreateStripeCustomer', {
    userId
  });
  try {
    // Check if customer already exists
    const { data: subscription, error: subscriptionError } = await supabaseClient.from('user_subscriptions').select('stripe_customer_id').eq('user_id', userId).maybeSingle();
    if (subscriptionError) {
      logError('Database error checking existing subscription', subscriptionError, {
        userId
      });
      throw new Error(`Database error: ${subscriptionError.message}`);
    }
    if (subscription?.stripe_customer_id) {
      logInfo('Found existing Stripe customer ID', {
        userId,
        customerId: subscription.stripe_customer_id
      });
      return subscription.stripe_customer_id;
    }
    // Get user email and details
    logInfo('Fetching user details for Stripe customer creation', {
      userId
    });
    const { data: user, error: userError } = await supabaseClient.from('users').select('email, full_name').eq('id', userId).single();
    if (userError) {
      logError('Database error fetching user details', userError, {
        userId
      });
      throw new Error(`Failed to fetch user details: ${userError.message}`);
    }
    if (!user) {
      logError('User not found in database', null, {
        userId
      });
      throw new Error('User not found');
    }
    logInfo('User details retrieved', {
      userId,
      email: user.email,
      hasFullName: !!user.full_name
    });
    // Create Stripe customer with fallback for name
    const customerData = {
      email: user.email,
      name: user.full_name || user.email || 'Customer',
      metadata: {
        user_id: userId
      }
    };
    logInfo('Creating Stripe customer', {
      userId,
      customerData
    });
    let customer;
    try {
      customer = await stripe.customers.create(customerData);
      logInfo('Stripe customer created successfully', {
        userId,
        customerId: customer.id,
        email: customer.email
      });
    } catch (stripeError) {
      logError('Stripe API error creating customer', stripeError, {
        userId,
        customerData,
        stripeErrorType: stripeError.type,
        stripeErrorCode: stripeError.code
      });
      throw new Error(`Stripe customer creation failed: ${stripeError.message}`);
    }
    // Upsert subscription record to ensure it exists with the stripe_customer_id
    logInfo('Upserting subscription record', {
      userId,
      customerId: customer.id
    });
    const { error: upsertError } = await supabaseClient.from('user_subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customer.id
    }, {
      onConflict: 'user_id'
    });
    if (upsertError) {
      logError('Database error upserting subscription', upsertError, {
        userId,
        customerId: customer.id
      });
      // Try to delete the Stripe customer if database operation failed
      try {
        await stripe.customers.del(customer.id);
        logInfo('Cleaned up Stripe customer after database error', {
          customerId: customer.id
        });
      } catch (cleanupError) {
        logError('Failed to cleanup Stripe customer after database error', cleanupError, {
          customerId: customer.id
        });
      }
      throw new Error(`Failed to save customer data: ${upsertError.message}`);
    }
    logInfo('Successfully created and saved Stripe customer', {
      userId,
      customerId: customer.id
    });
    return customer.id;
  } catch (error) {
    logError('Error in getOrCreateStripeCustomer', error, {
      userId
    });
    throw error;
  }
}

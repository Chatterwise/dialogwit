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
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const auditLogger = new AuditLogger(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  try {
    // Authenticate request
    let authContext;
    try {
      authContext = await authenticateRequest(req, Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return createErrorResponse('Unauthorized', 401, {
          error: error.message
        });
      }
      throw error;
    }
    // Get user's Stripe customer ID
    const { data: subscription } = await supabaseClient.from('user_subscriptions').select('stripe_customer_id, stripe_subscription_id').eq('user_id', authContext.userId).maybeSingle();
    // If user has a Stripe subscription, cancel it
    if (subscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id, {
          prorate: true
        });
        await auditLogger.logAction(authContext.userId, 'cancel_subscription', 'billing', subscription.stripe_subscription_id, {
          reason: 'account_deletion'
        }, clientIP, userAgent, true);
      } catch (error) {
        console.error('Failed to cancel Stripe subscription:', error);
      // Continue with account deletion even if subscription cancellation fails
      }
    }
    // Log the account deletion
    await auditLogger.logAction(authContext.userId, 'delete_account', 'users', authContext.userId, {}, clientIP, userAgent, true);
    // Delete user data
    // Note: This relies on cascade delete in the database
    const { error: deleteError } = await supabaseClient.from('users').delete().eq('id', authContext.userId);
    if (deleteError) throw deleteError;
    // Delete auth user
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(authContext.userId);
    if (authError) throw authError;
    return createSuccessResponse({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    return createErrorResponse('Failed to delete account', 500, {
      details: error.message
    });
  }
});

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

import { corsHeaders, createErrorResponse, createSuccessResponse, createCorsResponse } from '../_shared/utils/response.ts'
import { authenticateRequest, AuthenticationError } from '../_shared/middleware/authentication.ts'
import { AuditLogger } from '../_shared/middleware/auditLogging.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const auditLogger = new AuditLogger(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  try {
    // Authenticate request
    let authContext
    try {
      authContext = await authenticateRequest(
        req,
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return createErrorResponse('Unauthorized', 401, { error: error.message })
      }
      throw error
    }

    // Use maybeSingle instead of single to handle cases where no subscription exists
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', authContext.userId)
      .maybeSingle()

    if (!subscription?.stripe_customer_id) {
      // If no subscription exists, create a Stripe customer
      const customerId = await getOrCreateStripeCustomer(authContext.userId, supabaseClient)
      
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get('origin')}/billing`,
      })

      await auditLogger.logAction(
        authContext.userId,
        'access_customer_portal',
        'billing',
        undefined,
        {},
        clientIP,
        userAgent,
        true
      )

      return createSuccessResponse({ portal_url: session.url })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/billing`,
    })

    await auditLogger.logAction(
      authContext.userId,
      'access_customer_portal',
      'billing',
      undefined,
      {},
      clientIP,
      userAgent,
      true
    )

    return createSuccessResponse({ portal_url: session.url })

  } catch (error) {
    console.error('Customer portal error:', error)
    return createErrorResponse('Internal server error', 500, { 
      details: error.message 
    })
  }
})

async function getOrCreateStripeCustomer(userId: string, supabaseClient: any): Promise<string> {
  // Check if customer already exists
  const { data: subscription } = await supabaseClient
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id
  }

  // Get user email
  const { data: user } = await supabaseClient
    .from('users')
    .select('email, full_name')
    .eq('id', userId)
    .single()

  // Create Stripe customer with fallback for name
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.full_name || user.email || 'Customer', // Add fallback for name
    metadata: {
      user_id: userId,
    },
  })

  // Upsert subscription record to ensure it exists with the stripe_customer_id
  await supabaseClient
    .from('user_subscriptions')
    .upsert({ 
      user_id: userId,
      stripe_customer_id: customer.id 
    }, {
      onConflict: 'user_id'
    })

  return customer.id
}
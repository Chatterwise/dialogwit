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
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON'
    }), {
      status: 400,
      headers: corsHeaders
    });
  }
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return new Response(JSON.stringify({
      error: 'Not authenticated'
    }), {
      status: 401,
      headers: corsHeaders
    });
  }
  const { price_id, mode, success_url, cancel_url } = payload;
  // Check if Stripe customer already exists
  const { data: existingCustomer } = await supabase.from('stripe_customers').select('customer_id').eq('user_id', user.id).single();
  let customerId;
  if (existingCustomer?.customer_id) {
    customerId = existingCustomer.customer_id;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id
      }
    });
    customerId = customer.id;
    await supabase.from('stripe_customers').insert({
      user_id: user.id,
      customer_id: customer.id
    });
    console.log(`✅ Created new Stripe customer for user ${user.id}`);
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: mode || 'subscription',
    line_items: [
      {
        price: price_id,
        quantity: 1
      }
    ],
    success_url,
    cancel_url,
    allow_promotion_codes: true,
    // automatic_tax: { enabled: true },
    // payment_method_types: ['card'],
    // billing_address_collection: 'required',
    // phone_number_collection: {
    //   enabled: true
    // },
    subscription_data: {
      metadata: {
        user_id: user.id
      }
    },
    metadata: {
      user_id: user.id // opcional pero útil para trazabilidad
    }
  });
  console.log(`✅ Created session ${session.id} for user ${user.id} with price ${price_id}`);
  return new Response(JSON.stringify({
    url: session.url
  }), {
    headers: corsHeaders
  });
});

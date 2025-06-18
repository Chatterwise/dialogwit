import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to get detailed error messages
function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown error occurred';
}

// Simple rate limiting using in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 2, windowMs: number = 2000): boolean {
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Simple audit logging function
async function logAuditEvent(supabaseClient: any, email: string, action: string, details: any, success: boolean = true) {
  try {
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: null, // No user ID for signup confirmation
        action,
        resource_type: 'email',
        details: { ...details, email },
        success
      });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't fail the main operation if audit logging fails
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmUrl } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.error('Invalid email format provided:', email);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email format. Please provide a valid email address.',
          code: 'invalid_email_format'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `confirm-signup:${clientIP}:${email}`;
    
    if (!checkRateLimit(rateLimitKey, 2, 2000)) { // 2 requests per 2 seconds
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          retryAfter: 2
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '2'
          } 
        }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // Generate a signup link using Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: confirmUrl || `${new URL(req.url).origin}/auth/confirm`,
      }
    });
    
    if (error) {
      const errorMsg = getErrorMessage(error);
      console.error('Error generating signup link:', errorMsg);
      
      // Log failed signup link generation
      await logAuditEvent(supabase, email, 'signup_link_generation_failed', {
        error: errorMsg
      }, false);
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate confirmation link', details: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const signupLink = data.properties.action_link;
    
    // Send email with confirmation link
    const emailResult = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [email],
      subject: 'Confirm Your ChatterWise Account',
      html: getConfirmEmailTemplate(email, signupLink),
    });

    if (emailResult.error) {
      const errorMsg = getErrorMessage(emailResult.error);
      console.error('Error sending confirmation email:', errorMsg);
      
      // Check for common Resend errors
      if (errorMsg.includes('domain') || errorMsg.includes('verify')) {
        console.error('Resend domain verification issue detected');
      }
      
      // Log failed email send
      await logAuditEvent(supabase, email, 'confirmation_email_failed', {
        error: errorMsg,
        resend_error: emailResult.error
      }, false);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send confirmation email', details: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful email send
    await logAuditEvent(supabase, email, 'confirmation_email_sent', {
      email_id: emailResult.data?.id,
      signup_link_generated: true
    });

    console.log('Confirmation email sent successfully:', emailResult.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        id: emailResult.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error('Error in confirm-signup function:', errorMsg);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMsg
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getConfirmEmailTemplate(email: string, confirmUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your ChatterWise Account</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .button { display: inline-block; background-color: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ChatterWise</div>
      </div>
      
      <p>Hello,</p>
      
      <p>Thank you for signing up for ChatterWise! Please confirm your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirm Email Address</a>
      </div>
      
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${confirmUrl}</p>
      
      <p>If you didn't sign up for ChatterWise, you can safely ignore this email.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </body>
    </html>
  `;
}
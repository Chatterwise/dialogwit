import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper function to get detailed error messages
function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown error occurred';
}

// Email validation function with improved regex
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Simple audit logging function
async function logAuditEvent(supabaseClient: any, userId: string, action: string, details: any) {
  try {
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: 'email',
        details,
        success: true
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);

    if (authError || !user) {
      const errorMsg = getErrorMessage(authError);
      console.error('Authentication error:', errorMsg);
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: errorMsg }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure email is confirmed before sending welcome email
    if (!user.email_confirmed_at) {
      console.log('Email not confirmed for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Email must be confirmed before sending welcome email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile - use maybeSingle() to prevent errors if profile doesn't exist
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching user profile:', getErrorMessage(profileError));
      // Continue with auth user data if profile fetch fails
    }

    // Prioritize user.email from auth as it's the most reliable source
    const userEmail = (user.email || userProfile?.email || '').trim();
    const userName = userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    console.log('User email from auth:', user.email);
    console.log('User email from profile:', userProfile?.email);
    console.log('Final user email:', userEmail);

    if (!userEmail) {
      console.error('No email found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!isValidEmail(userEmail)) {
      console.error('Invalid email format:', userEmail);
      return new Response(
        JSON.stringify({ error: 'Invalid email format', email: userEmail }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Send welcome email
    const emailResult = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [userEmail],
      subject: 'Welcome to ChatterWise!',
      html: getWelcomeEmailTemplate(userName),
    });

    if (emailResult.error) {
      const errorMsg = getErrorMessage(emailResult.error);
      console.error('Error sending welcome email:', errorMsg);
      
      // Check for common Resend errors
      if (errorMsg.includes('domain') || errorMsg.includes('verify')) {
        console.error('Resend domain verification issue detected');
      }
      
      // Log failed email attempt
      await logAuditEvent(supabaseClient, user.id, 'welcome_email_failed', {
        email: userEmail,
        error: errorMsg,
        resend_error: emailResult.error
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to send welcome email', details: errorMsg }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful email send
    await logAuditEvent(supabaseClient, user.id, 'welcome_email_sent', {
      email: userEmail,
      email_id: emailResult.data?.id
    });

    // Track email usage
    try {
      await supabaseClient.rpc('increment_usage', {
        p_user_id: user.id,
        p_metric_name: 'emails_per_month',
        p_increment: 1
      });
    } catch (usageError) {
      console.error('Failed to track email usage:', getErrorMessage(usageError));
      // Don't fail the request if usage tracking fails
    }

    console.log('Welcome email sent successfully:', emailResult.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully',
        id: emailResult.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error('Error in welcome function:', errorMsg);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMsg
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getWelcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ChatterWise!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .button { display: inline-block; background-color: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .section { margin: 30px 0; }
        .feature { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { width: 40px; height: 40px; margin-right: 15px; background-color: #EFF6FF; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ChatterWise</div>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>Welcome to ChatterWise! We're excited to have you on board. Here's how to get started:</p>
      
      <div class="section">
        <div class="feature">
          <div class="feature-icon">1</div>
          <div>
            <strong>Create your first chatbot</strong>
            <p>Build a custom AI chatbot in minutes with our intuitive interface.</p>
          </div>
        </div>
        
        <div class="feature">
          <div class="feature-icon">2</div>
          <div>
            <strong>Add your knowledge base</strong>
            <p>Upload documents or add text to train your chatbot with your specific information.</p>
          </div>
        </div>
        
        <div class="feature">
          <div class="feature-icon">3</div>
          <div>
            <strong>Integrate and deploy</strong>
            <p>Add your chatbot to your website with a simple code snippet or use our API.</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="https://app.chatterwise.ai/dashboard" class="button">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions, check out our <a href="https://docs.chatterwise.ai">documentation</a> or contact our support team.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}
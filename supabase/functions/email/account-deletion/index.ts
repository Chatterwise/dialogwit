import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const resend = new Resend(resendApiKey);

    // Send account deletion confirmation email
    const emailResult = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [user.email],
      subject: 'Your ChatterWise Account Has Been Deleted',
      html: getAccountDeletionEmailTemplate(user.email),
    });

    if (emailResult.error) {
      console.error('Error sending account deletion email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send account deletion email', details: emailResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deletion email sent successfully',
        id: emailResult.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in account-deletion function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getAccountDeletionEmailTemplate(email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your ChatterWise Account Has Been Deleted</title>
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
      
      <p>We're sorry to see you go. Your ChatterWise account has been successfully deleted, and all your data has been removed from our systems.</p>
      
      <p>If you deleted your account by mistake or would like to use our services again in the future, you'll need to create a new account.</p>
      
      <div style="text-align: center;">
        <a href="https://app.chatterwise.io/auth" class="button">Create New Account</a>
      </div>
      
      <p>We'd love to hear your feedback on why you decided to leave. If you have a moment, please reply to this email with any suggestions or concerns.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </body>
    </html>
  `;
}
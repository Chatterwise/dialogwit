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
    const { email, confirmUrl } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error('Error generating signup link:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate confirmation link' }),
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
      console.error('Error sending confirmation email:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send confirmation email', details: emailResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully',
        id: emailResult.data?.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in confirm-signup function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
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
      <p>${confirmUrl}</p>
      
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
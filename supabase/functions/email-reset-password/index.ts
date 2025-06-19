import { Resend } from 'npm:resend@2.0.0';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Helper function to get detailed error messages
function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown error occurred';
}
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { email, resetUrl } = await req.json();
    if (!email || !resetUrl) {
      return new Response(JSON.stringify({
        error: 'Email and resetUrl are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [
        email
      ],
      subject: 'Reset Your ChatterWise Password',
      html: getResetPasswordTemplate(email, resetUrl)
    });
    if (error) {
      const errorMsg = getErrorMessage(error);
      console.error('Error sending reset password email:', errorMsg);
      return new Response(JSON.stringify({
        error: 'Failed to send reset password email',
        details: errorMsg
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Reset password email sent successfully:', data?.id);
    return new Response(JSON.stringify({
      success: true,
      message: 'Password reset email sent',
      id: data?.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error('Error in reset-password function:', errorMsg);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMsg
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
function getResetPasswordTemplate(email, resetUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your ChatterWise Password</title>
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
      
      <p>We received a request to reset your ChatterWise password. Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
        <p>This email was sent to ${email}</p>
      </div>
    </body>
    </html>
  `;
}

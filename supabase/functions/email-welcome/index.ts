import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
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
// Email validation function with improved regex
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      const errorMsg = getErrorMessage(authError);
      console.error('Authentication error:', errorMsg);
      return new Response(JSON.stringify({
        error: 'Invalid token',
        details: errorMsg
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Ensure email is confirmed before sending welcome email
    if (!user.email_confirmed_at) {
      console.log('Email not confirmed for user:', user.id);
      return new Response(JSON.stringify({
        error: 'Email must be confirmed before sending welcome email'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Check if welcome email has already been sent
    const { data: userProfile } = await supabaseClient.from('users').select('welcome_email_sent, email, full_name').eq('id', user.id).maybeSingle();
    if (userProfile?.welcome_email_sent) {
      console.log('Welcome email already sent for user:', user.id);
      return new Response(JSON.stringify({
        success: true,
        message: 'Welcome email already sent',
        already_sent: true
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Prioritize user.email from auth as it's the most reliable source
    const userEmail = (user.email || userProfile?.email || '').trim();
    const userName = userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    console.log('Sending welcome email to:', userEmail, 'for user:', user.id);
    if (!userEmail) {
      console.error('No email found for user:', user.id);
      return new Response(JSON.stringify({
        error: 'User email not found'
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate email format
    if (!isValidEmail(userEmail)) {
      console.error('Invalid email format:', userEmail);
      return new Response(JSON.stringify({
        error: 'Invalid email format',
        email: userEmail
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
    // Send welcome email
    const emailResult = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [
        userEmail
      ],
      subject: 'Welcome to ChatterWise!',
      html: getWelcomeEmailTemplate(userName)
    });
    if (emailResult.error) {
      const errorMsg = getErrorMessage(emailResult.error);
      console.error('Error sending welcome email:', errorMsg);
      return new Response(JSON.stringify({
        error: 'Failed to send welcome email',
        details: errorMsg
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Mark welcome email as sent in the database
    await supabaseClient.from('users').upsert({
      id: user.id,
      email: userEmail,
      full_name: userName,
      welcome_email_sent: true,
      email_confirmed_at: user.email_confirmed_at || new Date().toISOString()
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
    return new Response(JSON.stringify({
      success: true,
      message: 'Welcome email sent successfully',
      id: emailResult.data?.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error('Error in welcome function:', errorMsg);
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
function getWelcomeEmailTemplate(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ChatterWise!</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f8fafc; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .logo { 
          font-size: 28px; 
          font-weight: bold; 
          margin: 0; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #1e293b;
          margin-bottom: 30px;
        }
        .feature-grid {
          display: grid;
          gap: 20px;
          margin: 30px 0;
        }
        .feature {
          display: flex;
          align-items: flex-start;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          margin-right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          flex-shrink: 0;
        }
        .feature-content h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 16px;
          font-weight: 600;
        }
        .feature-content p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }
        .cta-section {
          text-align: center;
          margin: 40px 0;
          padding: 30px;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-radius: 8px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .footer {
          background-color: #f1f5f9;
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">🤖 ChatterWise</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">AI-Powered Chatbot Platform</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <h2 style="margin: 0 0 15px 0; color: #1e293b;">Welcome aboard, ${name}! 🎉</h2>
            <p style="margin: 0; color: #64748b;">We're thrilled to have you join the ChatterWise community. Let's get you started on your AI chatbot journey!</p>
          </div>

          <div class="divider"></div>
          
          <div class="feature-grid">
            <div class="feature">
              <div class="feature-icon">1</div>
              <div class="feature-content">
                <h3>Create Your First Chatbot</h3>
                <p>Build a custom AI chatbot in minutes with our intuitive drag-and-drop interface. No coding required!</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">2</div>
              <div class="feature-content">
                <h3>Train with Your Knowledge</h3>
                <p>Upload documents, add text, or connect data sources to train your chatbot with your specific information.</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">3</div>
              <div class="feature-content">
                <h3>Deploy Anywhere</h3>
                <p>Integrate your chatbot into your website, app, or platform with our simple embed code or powerful API.</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <h3 style="margin: 0 0 15px 0; color: #1e293b;">Ready to build your first chatbot?</h3>
            <p style="margin: 0 0 20px 0; color: #64748b;">Jump into your dashboard and start creating amazing conversational experiences.</p>
            <a href="https://app.chatterwise.ai/dashboard" class="button">Go to Dashboard →</a>
          </div>

          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">💡 Pro Tip</h4>
            <p style="margin: 0; color: #1e40af; font-size: 14px;">Start with our template gallery to quickly set up chatbots for common use cases like customer support, lead generation, or FAQ assistance.</p>
          </div>

          <div class="divider"></div>

          <div style="text-align: center;">
            <h4 style="color: #1e293b; margin-bottom: 15px;">Need help getting started?</h4>
            <p style="color: #64748b; margin-bottom: 20px;">Our team is here to support you every step of the way.</p>
            <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
              <a href="https://docs.chatterwise.ai" style="color: #667eea; text-decoration: none; font-weight: 500;">📚 Documentation</a>
              <a href="https://chatterwise.ai/support" style="color: #667eea; text-decoration: none; font-weight: 500;">💬 Live Chat</a>
              <a href="https://chatterwise.ai/tutorials" style="color: #667eea; text-decoration: none; font-weight: 500;">🎥 Video Tutorials</a>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;">Thanks for choosing ChatterWise!</p>
          <p style="margin: 0 0 15px 0;">– The ChatterWise Team</p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 15px;">
            <p style="margin: 0; font-size: 12px;">© 2025 ChatterWise. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">
              <a href="https://chatterwise.ai/privacy">Privacy Policy</a> • 
              <a href="https://chatterwise.ai/terms">Terms of Service</a> • 
              <a href="https://chatterwise.ai/unsubscribe">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

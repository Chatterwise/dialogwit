import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  console.log("[Function Start] Incoming request");

  if (req.method === 'OPTIONS') {
    console.log("[CORS] Preflight request handled");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[Step 1] Parsing request body");
    const body = await req.json();
    console.log("[Parsed Body]", body);

    const { email, name } = body;

    if (!email) {
      console.error("[Validation Error] Missing email");
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Step 2] Email received: ${email}`);
    console.log(`[Step 3] Name parsed: ${name || email.split('@')[0]}`);

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error("[Env Error] RESEND_API_KEY is not defined");
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[Step 4] Resend API key found, initializing Resend client...");
    const resend = new Resend(resendApiKey);

    console.log("[Step 5] Sending email with Resend...");
    const emailResult = await resend.emails.send({
      from: 'ChatterWise <noreply@email.chatterwise.io>',
      to: [email],
      subject: 'Welcome to ChatterWise!',
      html: getWelcomeEmailTemplate(name || email.split('@')[0]),
    });

    console.log("[Step 6] Resend API response:", emailResult);

    if (emailResult.error) {
      console.error('[Email Error] Failed to send:', emailResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send welcome email', details: emailResult.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Success] Email sent successfully. Email ID: ${emailResult.data?.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        id: emailResult.data?.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Catch Block Error]', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
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
        <a href="https://app.chatterwise.io/dashboard" class="button">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions, check out our <a href="https://docs.chatterwise.io">documentation</a> or contact our support team.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

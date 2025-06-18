import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Helper function to get detailed error messages
function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Unknown error occurred';
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

    const url = new URL(req.url);
    
    // Handle GET request with token_hash parameter (email confirmation link)
    if (req.method === 'GET') {
      const tokenHash = url.searchParams.get('token_hash');
      let type = url.searchParams.get('type');
      
      // Default to 'email' if type is missing (common case)
      if (!type) {
        type = 'email';
      }
      
      if (!tokenHash) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing confirmation token',
            message: 'Please use the confirmation link from your email'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Processing email confirmation with token hash:', tokenHash, 'type:', type);

      // Verify the email confirmation token
      const { data: sessionData, error: verifyError } = await supabaseClient.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any
      });

      if (verifyError || !sessionData.user) {
        console.error('Email confirmation verification failed:', getErrorMessage(verifyError));
        return new Response(
          JSON.stringify({ 
            error: 'Invalid or expired confirmation token',
            details: getErrorMessage(verifyError),
            message: 'Please request a new confirmation email'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const user = sessionData.user;
      console.log('Email confirmed successfully for user:', user.id);

      // Update user profile with confirmation timestamp
      try {
        await supabaseClient
          .from('users')
          .upsert({ 
            id: user.id, 
            email: user.email,
            email_confirmed_at: user.email_confirmed_at || new Date().toISOString()
          });
      } catch (updateError) {
        console.error('Failed to update user profile:', getErrorMessage(updateError));
        // Don't fail the request if profile update fails
      }

      // Check if welcome email has already been sent
      const { data: userProfile } = await supabaseClient
        .from('users')
        .select('welcome_email_sent')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfile?.welcome_email_sent) {
        console.log('Welcome email already sent for user:', user.id);
        return new Response(
          JSON.stringify({ 
            success: true,
            email_confirmed: true,
            welcome_email_sent: false,
            message: 'Email confirmed successfully! Welcome email was already sent.',
            redirect_url: '/dashboard'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send welcome email using the session token
      console.log('Sending welcome email for user:', user.id);
      
      try {
        const welcomeResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email-welcome`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!welcomeResponse.ok) {
          const errorText = await welcomeResponse.text();
          console.error('Failed to send welcome email:', errorText);
          
          // Don't fail the confirmation if welcome email fails
          return new Response(
            JSON.stringify({ 
              success: true,
              email_confirmed: true,
              welcome_email_sent: false,
              message: 'Email confirmed successfully! Welcome email could not be sent.',
              redirect_url: '/dashboard'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const welcomeResult = await welcomeResponse.json();

        // Mark welcome email as sent
        try {
          await supabaseClient
            .from('users')
            .upsert({ 
              id: user.id, 
              email: user.email,
              welcome_email_sent: true,
              email_confirmed_at: user.email_confirmed_at || new Date().toISOString()
            });
        } catch (updateError) {
          console.error('Failed to mark welcome email as sent:', getErrorMessage(updateError));
        }

        console.log('Email confirmation completed successfully for user:', user.id);

        return new Response(
          JSON.stringify({ 
            success: true,
            email_confirmed: true,
            welcome_email_sent: true,
            message: 'Email confirmed successfully! Welcome email sent.',
            welcome_result: welcomeResult,
            redirect_url: '/dashboard'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (welcomeError) {
        console.error('Error sending welcome email:', getErrorMessage(welcomeError));
        
        return new Response(
          JSON.stringify({ 
            success: true,
            email_confirmed: true,
            welcome_email_sent: false,
            message: 'Email confirmed successfully! Welcome email could not be sent.',
            redirect_url: '/dashboard'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle POST request with JWT token (for checking confirmation status)
    if (req.method === 'POST') {
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

      console.log('Checking email confirmation status for user:', user.id);

      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        console.log('Email not confirmed for user:', user.id);
        return new Response(
          JSON.stringify({ 
            success: false,
            email_confirmed: false,
            welcome_email_sent: false,
            message: 'Email not yet confirmed - please check your email and click the confirmation link'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Email is confirmed, check welcome email status
      const { data: userProfile } = await supabaseClient
        .from('users')
        .select('welcome_email_sent, email_confirmed_at')
        .eq('id', user.id)
        .maybeSingle();

      return new Response(
        JSON.stringify({ 
          success: true,
          email_confirmed: true,
          welcome_email_sent: userProfile?.welcome_email_sent || false,
          message: 'Email confirmation status checked'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMsg = getErrorMessage(error);
    console.error('Error in email-confirmation-handler:', errorMsg);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMsg
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
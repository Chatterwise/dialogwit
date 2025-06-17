/*
  # Daily Digest Email Function

  1. Purpose
    - Sends daily digest emails to users who have opted in
    - Includes chatbot activity summary from the past 24 hours
    - Uses Resend API for email delivery

  2. Security
    - Requires authenticated user
    - Validates email settings before sending

  3. Features
    - Fetches user's chatbot activity
    - Generates HTML email template
    - Sends via Resend API
    - Handles unverified domains gracefully
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DailyDigestData {
  totalMessages: number;
  activeChatbots: number;
  topChatbot?: {
    name: string;
    messageCount: number;
  };
  newChatbots: number;
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
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user's email settings
    const { data: emailSettings, error: settingsError } = await supabaseClient
      .from('user_email_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !emailSettings?.enable_notifications || !emailSettings?.daily_digest) {
      return new Response(
        JSON.stringify({ message: 'Daily digest not enabled for user' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate date range for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch daily digest data
    const digestData = await fetchDailyDigestData(supabaseClient, user.id, yesterday, today);

    // Send email if there's activity to report
    if (digestData.totalMessages > 0 || digestData.newChatbots > 0) {
      try {
        await sendDailyDigestEmail(userProfile.email, userProfile.full_name || 'User', digestData);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Safely extract error message
        const errorMessage = getErrorMessage(emailError);
        
        // Check if it's a domain verification error from Resend
        if (errorMessage.includes('Invalid `to` field') || 
            errorMessage.includes('testing email address') ||
            errorMessage.includes('test.com') ||
            errorMessage.includes('domain') ||
            errorMessage.includes('verification')) {
          
          console.log(`Daily digest skipped for unverified domain: ${userProfile.email}`);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Daily digest skipped - email domain not verified with Resend',
              email: userProfile.email,
              skipped: true
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // For other email errors, still return success but log the issue
        console.error('Non-domain email error:', errorMessage);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Daily digest processing completed with email delivery issue',
            email: userProfile.email,
            error: errorMessage,
            skipped: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily digest processed successfully',
        data: digestData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Daily digest error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: getErrorMessage(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error || 'Unknown error');
}

async function fetchDailyDigestData(
  supabaseClient: any,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyDigestData> {
  // Get user's chatbots
  const { data: chatbots } = await supabaseClient
    .from('chatbots')
    .select('id, name, created_at')
    .eq('user_id', userId);

  if (!chatbots || chatbots.length === 0) {
    return {
      totalMessages: 0,
      activeChatbots: 0,
      newChatbots: 0
    };
  }

  const chatbotIds = chatbots.map((bot: any) => bot.id);

  // Get message counts for each chatbot
  const { data: messages } = await supabaseClient
    .from('chat_messages')
    .select('chatbot_id')
    .in('chatbot_id', chatbotIds)
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());

  // Count new chatbots created yesterday
  const newChatbots = chatbots.filter((bot: any) => {
    const createdAt = new Date(bot.created_at);
    return createdAt >= startDate && createdAt < endDate;
  }).length;

  // Calculate statistics
  const totalMessages = messages?.length || 0;
  const chatbotMessageCounts = new Map<string, number>();
  
  messages?.forEach((msg: any) => {
    const count = chatbotMessageCounts.get(msg.chatbot_id) || 0;
    chatbotMessageCounts.set(msg.chatbot_id, count + 1);
  });

  const activeChatbots = chatbotMessageCounts.size;
  
  // Find top chatbot
  let topChatbot;
  if (chatbotMessageCounts.size > 0) {
    const [topChatbotId, topCount] = Array.from(chatbotMessageCounts.entries())
      .sort(([,a], [,b]) => b - a)[0];
    
    const topChatbotData = chatbots.find((bot: any) => bot.id === topChatbotId);
    if (topChatbotData) {
      topChatbot = {
        name: topChatbotData.name,
        messageCount: topCount
      };
    }
  }

  return {
    totalMessages,
    activeChatbots,
    topChatbot,
    newChatbots
  };
}

async function sendDailyDigestEmail(
  email: string,
  name: string,
  data: DailyDigestData
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const htmlContent = generateDailyDigestHTML(name, data);
  const textContent = generateDailyDigestText(name, data);

  const emailData = {
    from: 'ChatterWise <noreply@email.chatterwise.io>',
    to: [email],
    subject: 'Your Daily ChatterWise Digest',
    html: htmlContent,
    text: textContent,
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { message: errorText };
    }
    
    throw new Error(`Failed to send email: ${response.status} ${errorDetails.message || errorText}`);
  }
}

function generateDailyDigestHTML(name: string, data: DailyDigestData): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily ChatterWise Digest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 30px; }
        .stat-card { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; margin: 0; }
        .stat-label { color: #64748b; margin: 5px 0 0 0; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📊 Daily Digest</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${formattedDate}</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Here's your daily summary of chatbot activity:</p>
          
          <div class="stat-card">
            <p class="stat-number">${data.totalMessages}</p>
            <p class="stat-label">Total Messages</p>
          </div>
          
          <div class="stat-card">
            <p class="stat-number">${data.activeChatbots}</p>
            <p class="stat-label">Active Chatbots</p>
          </div>
          
          ${data.topChatbot ? `
          <div class="stat-card">
            <p class="stat-number">${data.topChatbot.messageCount}</p>
            <p class="stat-label">Messages from "${data.topChatbot.name}" (Top Performer)</p>
          </div>
          ` : ''}
          
          ${data.newChatbots > 0 ? `
          <div class="stat-card">
            <p class="stat-number">${data.newChatbots}</p>
            <p class="stat-label">New Chatbots Created</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://chatterwise.io/dashboard" class="button">View Dashboard</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you enabled daily digest emails.</p>
          <p><a href="https://chatterwise.io/settings" style="color: #667eea;">Manage email preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDailyDigestText(name: string, data: DailyDigestData): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let text = `Daily ChatterWise Digest - ${formattedDate}\n\n`;
  text += `Hi ${name}!\n\n`;
  text += `Here's your daily summary of chatbot activity:\n\n`;
  text += `📊 Total Messages: ${data.totalMessages}\n`;
  text += `🤖 Active Chatbots: ${data.activeChatbots}\n`;
  
  if (data.topChatbot) {
    text += `🏆 Top Performer: "${data.topChatbot.name}" with ${data.topChatbot.messageCount} messages\n`;
  }
  
  if (data.newChatbots > 0) {
    text += `✨ New Chatbots Created: ${data.newChatbots}\n`;
  }
  
  text += `\nView your dashboard: https://chatterwise.io/dashboard\n\n`;
  text += `You're receiving this because you enabled daily digest emails.\n`;
  text += `Manage email preferences: https://chatterwise.io/settings`;
  
  return text;
}
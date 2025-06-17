/*
  # Weekly Report Email Function

  1. Purpose
    - Sends weekly report emails to users who have opted in
    - Includes comprehensive chatbot analytics from the past 7 days
    - Uses Resend API for email delivery

  2. Security
    - Requires authenticated user
    - Validates email settings before sending

  3. Features
    - Fetches user's weekly chatbot analytics
    - Generates detailed HTML email template
    - Sends via Resend API
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WeeklyReportData {
  totalMessages: number;
  totalChatbots: number;
  activeChatbots: number;
  newChatbots: number;
  topChatbots: Array<{
    name: string;
    messageCount: number;
  }>;
  dailyBreakdown: Array<{
    date: string;
    messageCount: number;
  }>;
  averageMessagesPerDay: number;
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

    if (settingsError || !emailSettings?.enable_notifications || !emailSettings?.weekly_report) {
      return new Response(
        JSON.stringify({ message: 'Weekly report not enabled for user' }),
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

    // Calculate date range for the past week
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    // Fetch weekly report data
    const reportData = await fetchWeeklyReportData(supabaseClient, user.id, startDate, endDate);

    // Send email if there's activity to report
    if (reportData.totalMessages > 0 || reportData.newChatbots > 0) {
      await sendWeeklyReportEmail(userProfile.email, userProfile.full_name || 'User', reportData);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Weekly report processed',
        data: reportData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Weekly report error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchWeeklyReportData(
  supabaseClient: any,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WeeklyReportData> {
  // Get user's chatbots
  const { data: chatbots } = await supabaseClient
    .from('chatbots')
    .select('id, name, created_at')
    .eq('user_id', userId);

  if (!chatbots || chatbots.length === 0) {
    return {
      totalMessages: 0,
      totalChatbots: 0,
      activeChatbots: 0,
      newChatbots: 0,
      topChatbots: [],
      dailyBreakdown: [],
      averageMessagesPerDay: 0
    };
  }

  const chatbotIds = chatbots.map((bot: any) => bot.id);

  // Get all messages for the week
  const { data: messages } = await supabaseClient
    .from('chat_messages')
    .select('chatbot_id, created_at')
    .in('chatbot_id', chatbotIds)
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  // Count new chatbots created this week
  const newChatbots = chatbots.filter((bot: any) => {
    const createdAt = new Date(bot.created_at);
    return createdAt >= startDate && createdAt < endDate;
  }).length;

  // Calculate statistics
  const totalMessages = messages?.length || 0;
  const totalChatbots = chatbots.length;
  
  // Count messages per chatbot
  const chatbotMessageCounts = new Map<string, number>();
  messages?.forEach((msg: any) => {
    const count = chatbotMessageCounts.get(msg.chatbot_id) || 0;
    chatbotMessageCounts.set(msg.chatbot_id, count + 1);
  });

  const activeChatbots = chatbotMessageCounts.size;

  // Get top 3 chatbots
  const topChatbots = Array.from(chatbotMessageCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([chatbotId, count]) => {
      const chatbot = chatbots.find((bot: any) => bot.id === chatbotId);
      return {
        name: chatbot?.name || 'Unknown',
        messageCount: count
      };
    });

  // Create daily breakdown
  const dailyBreakdown: Array<{ date: string; messageCount: number }> = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayMessages = messages?.filter((msg: any) => {
      const msgDate = new Date(msg.created_at);
      return msgDate >= dayStart && msgDate <= dayEnd;
    }).length || 0;
    
    dailyBreakdown.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      messageCount: dayMessages
    });
  }

  const averageMessagesPerDay = Math.round(totalMessages / 7);

  return {
    totalMessages,
    totalChatbots,
    activeChatbots,
    newChatbots,
    topChatbots,
    dailyBreakdown,
    averageMessagesPerDay
  };
}

async function sendWeeklyReportEmail(
  email: string,
  name: string,
  data: WeeklyReportData
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const htmlContent = generateWeeklyReportHTML(name, data);
  const textContent = generateWeeklyReportText(name, data);

  const emailData = {
    from: 'ChatterWise <noreply@email.chatterwise.io>',
    to: [email],
    subject: 'Your Weekly ChatterWise Report',
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
    throw new Error(`Failed to send email: ${response.status} ${errorText}`);
  }
}

function generateWeeklyReportHTML(name: string, data: WeeklyReportData): string {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const dailyChart = data.dailyBreakdown.map(day => 
    `<div style="display: flex; align-items: center; margin: 8px 0;">
      <div style="width: 60px; font-size: 12px; color: #64748b;">${day.date}</div>
      <div style="flex: 1; background-color: #f1f5f9; height: 20px; border-radius: 10px; margin: 0 10px; position: relative;">
        <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${Math.max(5, (day.messageCount / Math.max(...data.dailyBreakdown.map(d => d.messageCount), 1)) * 100)}%; border-radius: 10px;"></div>
      </div>
      <div style="width: 30px; font-size: 12px; font-weight: bold; color: #333;">${day.messageCount}</div>
    </div>`
  ).join('');

  const topChatbotsHTML = data.topChatbots.map((bot, index) => 
    `<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; align-items: center;">
        <span style="background-color: ${index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7c2f'}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 12px;">${index + 1}</span>
        <span style="font-weight: 500;">${bot.name}</span>
      </div>
      <span style="font-weight: bold; color: #667eea;">${bot.messageCount}</span>
    </div>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly ChatterWise Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 30px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-card { background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #667eea; }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; margin: 0; }
        .stat-label { color: #64748b; margin: 5px 0 0 0; font-size: 14px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 15px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        @media (max-width: 600px) { .stat-grid { grid-template-columns: 1fr; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📈 Weekly Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${dateRange}</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name}! 👋</h2>
          <p>Here's your comprehensive weekly summary:</p>
          
          <div class="stat-grid">
            <div class="stat-card">
              <p class="stat-number">${data.totalMessages}</p>
              <p class="stat-label">Total Messages</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">${data.averageMessagesPerDay}</p>
              <p class="stat-label">Avg. Messages/Day</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">${data.activeChatbots}</p>
              <p class="stat-label">Active Chatbots</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">${data.totalChatbots}</p>
              <p class="stat-label">Total Chatbots</p>
            </div>
          </div>
          
          ${data.newChatbots > 0 ? `
          <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;"><strong>🎉 ${data.newChatbots} new chatbot${data.newChatbots > 1 ? 's' : ''} created this week!</strong></p>
          </div>
          ` : ''}
          
          <div class="section">
            <h3 class="section-title">📊 Daily Activity</h3>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
              ${dailyChart}
            </div>
          </div>
          
          ${data.topChatbots.length > 0 ? `
          <div class="section">
            <h3 class="section-title">🏆 Top Performing Chatbots</h3>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px;">
              ${topChatbotsHTML}
            </div>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://chatterwise.io/dashboard" class="button">View Full Analytics</a>
          </div>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you enabled weekly report emails.</p>
          <p><a href="https://chatterwise.io/settings" style="color: #667eea;">Manage email preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateWeeklyReportText(name: string, data: WeeklyReportData): string {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  
  const dateRange = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  let text = `Weekly ChatterWise Report - ${dateRange}\n\n`;
  text += `Hi ${name}!\n\n`;
  text += `Here's your comprehensive weekly summary:\n\n`;
  text += `📊 OVERVIEW\n`;
  text += `Total Messages: ${data.totalMessages}\n`;
  text += `Average Messages/Day: ${data.averageMessagesPerDay}\n`;
  text += `Active Chatbots: ${data.activeChatbots}\n`;
  text += `Total Chatbots: ${data.totalChatbots}\n`;
  
  if (data.newChatbots > 0) {
    text += `🎉 New Chatbots Created: ${data.newChatbots}\n`;
  }
  
  text += `\n📈 DAILY BREAKDOWN\n`;
  data.dailyBreakdown.forEach(day => {
    text += `${day.date}: ${day.messageCount} messages\n`;
  });
  
  if (data.topChatbots.length > 0) {
    text += `\n🏆 TOP PERFORMERS\n`;
    data.topChatbots.forEach((bot, index) => {
      text += `${index + 1}. ${bot.name}: ${bot.messageCount} messages\n`;
    });
  }
  
  text += `\nView full analytics: https://chatterwise.io/dashboard\n\n`;
  text += `You're receiving this because you enabled weekly report emails.\n`;
  text += `Manage email preferences: https://chatterwise.io/settings`;
  
  return text;
}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  createErrorResponse,
  createSuccessResponse,
  createCorsResponse,
} from "../_shared/utils/response.ts";
import {
  authenticateRequest,
  AuthenticationError,
} from "../_shared/middleware/authentication.ts";
import { AuditLogger } from "../_shared/middleware/auditLogging.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/email", "");

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const auditLogger = new AuditLogger(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const clientIP =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    // Public endpoints (no auth required)
    if (path === "/confirm-signup" && req.method === "POST") {
      const { email, confirmUrl } = await req.json();

      if (!email || !confirmUrl) {
        return createErrorResponse("Email and confirmUrl are required", 400);
      }

      const { data, error } = await resend.emails.send({
        from: "ChatterWise <team@email.chatterwise.io>",
        to: email,
        subject: "Confirm Your ChatterWise Account",
        html: getConfirmSignupTemplate(email, confirmUrl),
      });

      if (error) throw error;

      return createSuccessResponse({
        message: "Confirmation email sent",
        id: data?.id,
      });
    }

    if (path === "/reset-password" && req.method === "POST") {
      const { email, resetUrl } = await req.json();

      if (!email || !resetUrl) {
        return createErrorResponse("Email and resetUrl are required", 400);
      }

      const { data, error } = await resend.emails.send({
        from: "ChatterWise <team@email.chatterwise.io>",
        to: email,
        subject: "Reset Your ChatterWise Password",
        html: getResetPasswordTemplate(email, resetUrl),
      });

      if (error) throw error;

      return createSuccessResponse({
        message: "Password reset email sent",
        id: data?.id,
      });
    }

    // Authenticated endpoints
    let authContext;
    try {
      authContext = await authenticateRequest(
        req,
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return createErrorResponse("Unauthorized", 401, {
          error: error.message,
        });
      }
      throw error;
    }

    // Check usage limits for authenticated endpoints
    const { data: usageCheck, error: usageError } = await supabaseClient.rpc(
      "check_usage_limit",
      {
        p_user_id: authContext.userId,
        p_metric_name: "emails_per_month",
      }
    );

    if (usageError) {
      console.error("Usage check error:", usageError);
      return createErrorResponse("Failed to check email usage limits", 500);
    }

    if (!usageCheck.allowed) {
      return createErrorResponse("Email limit reached", 403, {
        limit: usageCheck.limit,
        current_usage: usageCheck.current_usage,
        percentage_used: usageCheck.percentage_used,
      });
    }

    // Get user email settings
    const { data: userSettings } = await supabaseClient
      .from("user_email_settings")
      .select("*")
      .eq("user_id", authContext.userId)
      .maybeSingle();

    const emailSettings = userSettings || {
      enable_notifications: true,
      daily_digest: false,
      weekly_report: true,
      chatbot_alerts: true,
      marketing_emails: false,
    };

    // Send welcome email
    if (path === "/welcome" && req.method === "POST") {
      // Try to get user from users table, fallback to auth context
      const { data: user } = await supabaseClient
        .from("users")
        .select("email, full_name")
        .eq("id", authContext.userId)
        .maybeSingle();

      // Use fallback data if user not found in users table
      const userData = user || {
        email: authContext.user?.email || "user@example.com",
        full_name: authContext.user?.user_metadata?.full_name || null,
      };

      if (!userData.email) {
        return createErrorResponse("User email not found", 400);
      }

      const { data, error } = await resend.emails.send({
        from: "ChatterWise <team@email.chatterwise.io>",
        to: userData.email,
        subject: "Welcome to ChatterWise!",
        html: getWelcomeTemplate(userData.full_name || userData.email),
      });

      if (error) throw error;

      // Track email usage
      await supabaseClient.rpc("increment_usage", {
        p_user_id: authContext.userId,
        p_metric_name: "emails_per_month",
        p_increment: 1,
      });

      await auditLogger.logAction(
        authContext.userId,
        "send_welcome_email",
        "email",
        data?.id,
        {
          recipient: userData.email,
        },
        clientIP,
        userAgent,
        true
      );

      return createSuccessResponse({
        message: "Welcome email sent",
        id: data?.id,
      });
    }

    // Send new chatbot notification
    if (path === "/new-chatbot" && req.method === "POST") {
      const { chatbotId, chatbotName } = await req.json();

      if (!chatbotId || !chatbotName) {
        return createErrorResponse(
          "ChatbotId and chatbotName are required",
          400
        );
      }

      // Check if notifications are enabled
      if (
        !emailSettings.enable_notifications ||
        !emailSettings.chatbot_alerts
      ) {
        return createSuccessResponse({
          message: "Email notifications disabled by user",
          sent: false,
        });
      }

      const { data: user } = await supabaseClient
        .from("users")
        .select("email, full_name")
        .eq("id", authContext.userId)
        .maybeSingle();

      // Use fallback data if user not found in users table
      const userData = user || {
        email: authContext.user?.email || "user@example.com",
        full_name: authContext.user?.user_metadata?.full_name || null,
      };

      const { data, error } = await resend.emails.send({
        from: "ChatterWise <team@email.chatterwise.io>",
        to: userData.email,
        subject: `Your New Chatbot "${chatbotName}" is Ready!`,
        html: getNewChatbotTemplate(
          userData.full_name || userData.email,
          chatbotName,
          chatbotId
        ),
      });

      if (error) throw error;

      // Track email usage
      await supabaseClient.rpc("increment_usage", {
        p_user_id: authContext.userId,
        p_metric_name: "emails_per_month",
        p_increment: 1,
      });

      await auditLogger.logAction(
        authContext.userId,
        "send_new_chatbot_email",
        "email",
        data?.id,
        {
          recipient: userData.email,
          chatbot_id: chatbotId,
          chatbot_name: chatbotName,
        },
        clientIP,
        userAgent,
        true
      );

      return createSuccessResponse({
        message: "New chatbot email sent",
        id: data?.id,
      });
    }

    // Send daily digest
    if (path === "/daily-digest" && req.method === "POST") {
      // Check if daily digest is enabled
      if (!emailSettings.enable_notifications || !emailSettings.daily_digest) {
        return createSuccessResponse({
          message: "Daily digest disabled by user",
          sent: false,
        });
      }

      const { data: user } = await supabaseClient
        .from("users")
        .select("email, full_name")
        .eq("id", authContext.userId)
        .maybeSingle();

      // Use fallback data if user not found in users table
      const userData = user || {
        email: authContext.user?.email || "user@example.com",
        full_name: authContext.user?.user_metadata?.full_name || null,
      };

      // Get chatbot activity for the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: chatbots } = await supabaseClient
        .from("chatbots")
        .select("id, name")
        .eq("user_id", authContext.userId);

      let totalMessages = 0;
      const chatbotStats = [];

      for (const chatbot of chatbots || []) {
        const { count } = await supabaseClient
          .from("chat_messages")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("chatbot_id", chatbot.id)
          .gte("created_at", yesterday.toISOString());

        const messageCount = count || 0;
        totalMessages += messageCount;

        if (messageCount > 0) {
          chatbotStats.push({
            name: chatbot.name,
            messages: messageCount,
          });
        }
      }

      // Only send if there's activity
      if (totalMessages > 0) {
        const { data, error } = await resend.emails.send({
          from: "ChatterWise <team@email.chatterwise.io>",
          to: userData.email,
          subject: "Your ChatterWise Daily Digest",
          html: getDailyDigestTemplate(
            userData.full_name || userData.email,
            totalMessages,
            chatbotStats
          ),
        });

        if (error) throw error;

        // Track email usage
        await supabaseClient.rpc("increment_usage", {
          p_user_id: authContext.userId,
          p_metric_name: "emails_per_month",
          p_increment: 1,
        });

        await auditLogger.logAction(
          authContext.userId,
          "send_daily_digest",
          "email",
          data?.id,
          {
            recipient: userData.email,
            total_messages: totalMessages,
          },
          clientIP,
          userAgent,
          true
        );

        return createSuccessResponse({
          message: "Daily digest sent",
          id: data?.id,
        });
      } else {
        return createSuccessResponse({
          message: "No activity to report in daily digest",
          sent: false,
        });
      }
    }

    // Send weekly report
    if (path === "/weekly-report" && req.method === "POST") {
      // Check if weekly report is enabled
      if (!emailSettings.enable_notifications || !emailSettings.weekly_report) {
        return createSuccessResponse({
          message: "Weekly report disabled by user",
          sent: false,
        });
      }

      const { data: user } = await supabaseClient
        .from("users")
        .select("email, full_name")
        .eq("id", authContext.userId)
        .maybeSingle();

      // Use fallback data if user not found in users table
      const userData = user || {
        email: authContext.user?.email || "user@example.com",
        full_name: authContext.user?.user_metadata?.full_name || null,
      };

      // Get chatbot activity for the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: chatbots } = await supabaseClient
        .from("chatbots")
        .select("id, name")
        .eq("user_id", authContext.userId);

      let totalMessages = 0;
      let totalUniqueUsers = 0;
      const chatbotStats = [];

      for (const chatbot of chatbots || []) {
        const { data: messages } = await supabaseClient
          .from("chat_messages")
          .select("id, user_ip")
          .eq("chatbot_id", chatbot.id)
          .gte("created_at", lastWeek.toISOString());

        const messageCount = messages?.length || 0;
        totalMessages += messageCount;

        const uniqueUsers = new Set(messages?.map((m) => m.user_ip)).size || 0;
        totalUniqueUsers += uniqueUsers;

        if (messageCount > 0) {
          chatbotStats.push({
            name: chatbot.name,
            messages: messageCount,
            users: uniqueUsers,
          });
        }
      }

      // Only send if there's activity
      if (totalMessages > 0) {
        const { data, error } = await resend.emails.send({
          from: "ChatterWise <team@email.chatterwise.io>",
          to: userData.email,
          subject: "Your ChatterWise Weekly Report",
          html: getWeeklyReportTemplate(
            userData.full_name || userData.email,
            totalMessages,
            totalUniqueUsers,
            chatbotStats
          ),
        });

        if (error) throw error;

        // Track email usage
        await supabaseClient.rpc("increment_usage", {
          p_user_id: authContext.userId,
          p_metric_name: "emails_per_month",
          p_increment: 1,
        });

        await auditLogger.logAction(
          authContext.userId,
          "send_weekly_report",
          "email",
          data?.id,
          {
            recipient: userData.email,
            total_messages: totalMessages,
          },
          clientIP,
          userAgent,
          true
        );

        return createSuccessResponse({
          message: "Weekly report sent",
          id: data?.id,
        });
      } else {
        return createSuccessResponse({
          message: "No activity to report in weekly report",
          sent: false,
        });
      }
    }

    // Send custom email
    if (path === "/send" && req.method === "POST") {
      const { to, subject, html, text } = await req.json();

      if (!to || !subject || (!html && !text)) {
        return createErrorResponse(
          "To, subject, and either html or text are required",
          400
        );
      }

      const { data, error } = await resend.emails.send({
        from: "ChatterWise <team@email.chatterwise.io>",
        to,
        subject,
        html,
        text,
      });

      if (error) throw error;

      // Track email usage
      const recipientCount = Array.isArray(to) ? to.length : 1;
      await supabaseClient.rpc("increment_usage", {
        p_user_id: authContext.userId,
        p_metric_name: "emails_per_month",
        p_increment: recipientCount,
      });

      await auditLogger.logAction(
        authContext.userId,
        "send_custom_email",
        "email",
        data?.id,
        {
          recipient_count: recipientCount,
          subject,
        },
        clientIP,
        userAgent,
        true
      );

      return createSuccessResponse({
        message: "Email sent successfully",
        id: data?.id,
      });
    }

    // Update email settings
    if (path === "/settings" && req.method === "PUT") {
      const settings = await req.json();

      const { error } = await supabaseClient.from("user_email_settings").upsert(
        {
          user_id: authContext.userId,
          ...settings,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      await auditLogger.logAction(
        authContext.userId,
        "update_email_settings",
        "email_settings",
        undefined,
        settings,
        clientIP,
        userAgent,
        true
      );

      return createSuccessResponse({
        message: "Email settings updated",
        settings,
      });
    }

    // Get email settings
    if (path === "/settings" && req.method === "GET") {
      const { data, error } = await supabaseClient
        .from("user_email_settings")
        .select("*")
        .eq("user_id", authContext.userId)
        .maybeSingle();

      if (error) throw error;

      // Return default settings if none exist
      const settings = data || {
        user_id: authContext.userId,
        enable_notifications: true,
        daily_digest: false,
        weekly_report: true,
        chatbot_alerts: true,
        marketing_emails: false,
      };

      return createSuccessResponse({
        settings,
      });
    }

    return createErrorResponse("Endpoint not found", 404);
  } catch (error) {
    console.error("Email error:", error);
    return createErrorResponse("Internal server error", 500, {
      details: error.message,
    });
  }
});

// Email templates
function getConfirmSignupTemplate(email, confirmUrl) {
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
      <p>${resetUrl}</p>
      
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

function getWelcomeTemplate(name) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ChatterWise!</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; color: #333;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; padding:40px 30px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="text-align:center; margin-bottom:32px;">
          <h1 style="color:#3B82F6; font-size:28px; margin:0;">ChatterWise</h1>
        </div>

        <!-- Greeting -->
        <p style="font-size:16px; line-height:1.6;">Hi ${name},</p>
        <p style="font-size:16px; line-height:1.6;">
          Welcome to <strong>ChatterWise</strong> — we're thrilled to have you! Here's how to get started:
        </p>

        <!-- Steps -->
        <div style="margin-top:30px;">
          <div style="margin-bottom:20px;">
            <div style="font-size:16px; font-weight:bold; color:#111;">1. Create your first chatbot</div>
            <p style="margin:6px 0 0; font-size:14px; color:#555;">Build a custom AI chatbot in minutes with our intuitive interface.</p>
          </div>

          <div style="margin-bottom:20px;">
            <div style="font-size:16px; font-weight:bold; color:#111;">2. Add your knowledge base</div>
            <p style="margin:6px 0 0; font-size:14px; color:#555;">Upload files or text to train your chatbot with your unique data.</p>
          </div>

          <div style="margin-bottom:20px;">
            <div style="font-size:16px; font-weight:bold; color:#111;">3. Integrate & deploy</div>
            <p style="margin:6px 0 0; font-size:14px; color:#555;">Embed on your site or use our API to launch anywhere.</p>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center; margin-top:40px;">
          <a href="https://app.chatterwise.ai/dashboard" 
             style="background-color:#3B82F6; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:16px; font-weight:bold; display:inline-block;">
            Go to Dashboard
          </a>
        </div>

        <!-- Extra Info -->
        <p style="margin-top:30px; font-size:14px; color:#666; text-align:center;">
          Need help? Check out our <a href="https://docs.chatterwise.ai" style="color:#3B82F6;">documentation</a> or contact support.
        </p>

        <!-- Signature -->
        <p style="font-size:14px; color:#555; margin-top:20px;">– The ChatterWise Team</p>
      </div>

      <!-- Footer -->
      <div style="text-align:center; font-size:12px; color:#999; margin-top:20px;">
        © 2025 ChatterWise. All rights reserved.
      </div>
    </body>
    </html>
  `;
}

function getNewChatbotTemplate(name, chatbotName, chatbotId) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your New Chatbot is Ready!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .button { display: inline-block; background-color: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .chatbot-card { border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; background-color: #F9FAFB; }
        .chatbot-name { font-size: 18px; font-weight: bold; color: #3B82F6; margin-bottom: 10px; }
        .next-steps { background-color: #EFF6FF; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ChatterWise</div>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>Great news! Your new chatbot <strong>${chatbotName}</strong> is ready to use.</p>
      
      <div class="chatbot-card">
        <div class="chatbot-name">${chatbotName}</div>
        <p>Your chatbot is now ready to answer questions based on the knowledge base you provided.</p>
        <div style="text-align: center;">
          <a href="https://app.chatterwise.ai/chatbots/${chatbotId}" class="button">View Chatbot</a>
        </div>
      </div>
      
      <div class="next-steps">
        <strong>Next Steps:</strong>
        <ul>
          <li>Test your chatbot with different questions</li>
          <li>Add more content to the knowledge base</li>
          <li>Integrate the chatbot with your website</li>
          <li>Monitor analytics to improve performance</li>
        </ul>
      </div>
      
      <p>If you need any help, our support team is always available.</p>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function getDailyDigestTemplate(name, totalMessages, chatbotStats) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your ChatterWise Daily Digest</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .button { display: inline-block; background-color: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .summary { background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .summary-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .stat { display: flex; justify-content: space-between; margin: 10px 0; }
        .chatbot-stat { padding: 10px; border-bottom: 1px solid #E5E7EB; }
        .chatbot-name { font-weight: bold; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ChatterWise</div>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>Here's your daily digest of chatbot activity for the last 24 hours:</p>
      
      <div class="summary">
        <div class="summary-title">Daily Summary</div>
        <div class="stat">
          <span>Total Messages:</span>
          <strong>${totalMessages}</strong>
        </div>
        <div class="stat">
          <span>Active Chatbots:</span>
          <strong>${chatbotStats.length}</strong>
        </div>
      </div>
      
      ${
        chatbotStats.length > 0
          ? `
        <div style="margin: 20px 0;">
          <div style="font-weight: bold; margin-bottom: 10px;">Chatbot Activity:</div>
          ${chatbotStats
            .map(
              (stat) => `
            <div class="chatbot-stat">
              <div class="chatbot-name">${stat.name}</div>
              <div>${stat.messages} messages</div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      <div style="text-align: center;">
        <a href="https://app.chatterwise.ai/dashboard" class="button">View Dashboard</a>
      </div>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
        <p>You're receiving this email because you enabled daily digests in your <a href="https://app.chatterwise.ai/settings">email settings</a>.</p>
      </div>
    </body>
    </html>
  `;
}

function getWeeklyReportTemplate(
  name,
  totalMessages,
  totalUniqueUsers,
  chatbotStats
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your ChatterWise Weekly Report</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .button { display: inline-block; background-color: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .summary { background-color: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .summary-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .stat { display: flex; justify-content: space-between; margin: 10px 0; }
        .chatbot-stat { background-color: #F3F4F6; border-radius: 8px; padding: 15px; margin: 10px 0; }
        .chatbot-name { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .chatbot-metrics { display: flex; justify-content: space-between; }
        .metric { text-align: center; flex: 1; }
        .metric-value { font-size: 18px; font-weight: bold; color: #3B82F6; }
        .metric-label { font-size: 12px; color: #6B7280; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ChatterWise</div>
      </div>
      
      <p>Hello ${name},</p>
      
      <p>Here's your weekly report for the past 7 days:</p>
      
      <div class="summary">
        <div class="summary-title">Weekly Summary</div>
        <div class="stat">
          <span>Total Messages:</span>
          <strong>${totalMessages}</strong>
        </div>
        <div class="stat">
          <span>Unique Users:</span>
          <strong>${totalUniqueUsers}</strong>
        </div>
        <div class="stat">
          <span>Active Chatbots:</span>
          <strong>${chatbotStats.length}</strong>
        </div>
      </div>
      
      ${
        chatbotStats.length > 0
          ? `
        <div style="margin: 20px 0;">
          <div style="font-weight: bold; margin-bottom: 10px;">Chatbot Performance:</div>
          ${chatbotStats
            .map(
              (stat) => `
            <div class="chatbot-stat">
              <div class="chatbot-name">${stat.name}</div>
              <div class="chatbot-metrics">
                <div class="metric">
                  <div class="metric-value">${stat.messages}</div>
                  <div class="metric-label">Messages</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${stat.users}</div>
                  <div class="metric-label">Users</div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      
      <div style="text-align: center;">
        <a href="https://app.chatterwise.ai/analytics" class="button">View Detailed Analytics</a>
      </div>
      
      <p>Best regards,<br>The ChatterWise Team</p>
      
      <div class="footer">
        <p>© 2025 ChatterWise. All rights reserved.</p>
        <p>You're receiving this email because you enabled weekly reports in your <a href="https://app.chatterwise.ai/settings">email settings</a>.</p>
      </div>
    </body>
    </html>
  `;
}

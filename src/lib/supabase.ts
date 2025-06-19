import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          company: string | null;
          timezone: string | null;
          welcome_email_sent: boolean | null;
          email_confirmed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          timezone?: string | null;
          welcome_email_sent?: boolean | null;
          email_confirmed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          timezone?: string | null;
          welcome_email_sent?: boolean | null;
          email_confirmed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      chatbots: {
        Row: {
          id: string;
          name: string;
          description: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          status: "creating" | "processing" | "ready" | "error";
          knowledge_base_processed: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
          status?: "creating" | "processing" | "ready" | "error";
          knowledge_base_processed?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          status?: "creating" | "processing" | "ready" | "error";
          knowledge_base_processed?: boolean;
        };
      };
      knowledge_base: {
        Row: {
          id: string;
          chatbot_id: string;
          content: string;
          content_type: "text" | "document";
          filename: string | null;
          processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          content: string;
          content_type: "text" | "document";
          filename?: string | null;
          processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          content?: string;
          content_type?: "text" | "document";
          filename?: string | null;
          processed?: boolean;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          chatbot_id: string;
          message: string;
          response: string;
          created_at: string;
          user_ip: string | null;
        };
        Insert: {
          id?: string;
          chatbot_id: string;
          message: string;
          response: string;
          created_at?: string;
          user_ip?: string | null;
        };
        Update: {
          id?: string;
          chatbot_id?: string;
          message?: string;
          response?: string;
          created_at?: string;
          user_ip?: string | null;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
          features: any | null;
          limits: any | null;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          features?: any | null;
          limits?: any | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          price_monthly?: number;
          price_yearly?: number;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
          features?: any | null;
          limits?: any | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          plan_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_start: string | null;
          trial_end: string | null;
          canceled_at: string | null;
          cancel_at_period_end: boolean | null;
          metadata: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          canceled_at?: string | null;
          cancel_at_period_end?: boolean | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          plan_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          canceled_at?: string | null;
          cancel_at_period_end?: boolean | null;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string | null;
          subscription_id: string | null;
          stripe_invoice_id: string;
          amount_paid: number;
          amount_due: number;
          currency: string;
          status: string;
          invoice_pdf: string | null;
          period_start: string | null;
          period_end: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          stripe_invoice_id: string;
          amount_paid: number;
          amount_due: number;
          currency?: string;
          status: string;
          invoice_pdf?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          stripe_invoice_id?: string;
          amount_paid?: number;
          amount_due?: number;
          currency?: string;
          status?: string;
          invoice_pdf?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          created_at?: string | null;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string | null;
          subscription_id: string | null;
          metric_name: string;
          metric_value: number;
          period_start: string;
          period_end: string;
          metadata: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          metric_name: string;
          metric_value?: number;
          period_start: string;
          period_end: string;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          metric_name?: string;
          metric_value?: number;
          period_start?: string;
          period_end?: string;
          metadata?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      billing_events: {
        Row: {
          id: string;
          user_id: string | null;
          subscription_id: string | null;
          event_type: string;
          event_data: any | null;
          stripe_event_id: string | null;
          processed: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          event_type: string;
          event_data?: any | null;
          stripe_event_id?: string | null;
          processed?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          subscription_id?: string | null;
          event_type?: string;
          event_data?: any | null;
          stripe_event_id?: string | null;
          processed?: boolean | null;
          created_at?: string | null;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string | null;
          stripe_payment_method_id: string;
          type: string;
          card_brand: string | null;
          card_last4: string | null;
          card_exp_month: number | null;
          card_exp_year: number | null;
          is_default: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stripe_payment_method_id: string;
          type: string;
          card_brand?: string | null;
          card_last4?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          stripe_payment_method_id?: string;
          type?: string;
          card_brand?: string | null;
          card_last4?: string | null;
          card_exp_month?: number | null;
          card_exp_year?: number | null;
          is_default?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      usage_limits: {
        Row: {
          id: string;
          plan_id: string | null;
          metric_name: string;
          limit_value: number;
          overage_price: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plan_id?: string | null;
          metric_name: string;
          limit_value: number;
          overage_price?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plan_id?: string | null;
          metric_name?: string;
          limit_value?: number;
          overage_price?: number | null;
          created_at?: string | null;
        };
      };
      stripe_customers: {
        Row: {
          id: number;
          user_id: string;
          customer_id: string;
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          customer_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          customer_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      stripe_subscriptions: {
        Row: {
          id: number;
          customer_id: string;
          subscription_id: string | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
          status:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "not_started"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          customer_id: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "not_started"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          customer_id?: string;
          subscription_id?: string | null;
          price_id?: string | null;
          current_period_start?: number | null;
          current_period_end?: number | null;
          cancel_at_period_end?: boolean | null;
          payment_method_brand?: string | null;
          payment_method_last4?: string | null;
          status?:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "not_started"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid";
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      stripe_orders: {
        Row: {
          id: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status: "canceled" | "completed" | "pending";
          created_at: string | null;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          checkout_session_id: string;
          payment_intent_id: string;
          customer_id: string;
          amount_subtotal: number;
          amount_total: number;
          currency: string;
          payment_status: string;
          status?: "canceled" | "completed" | "pending";
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          checkout_session_id?: string;
          payment_intent_id?: string;
          customer_id?: string;
          amount_subtotal?: number;
          amount_total?: number;
          currency?: string;
          payment_status?: string;
          status?: "canceled" | "completed" | "pending";
          created_at?: string | null;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
      };
      user_email_settings: {
        Row: {
          user_id: string;
          enable_notifications: boolean | null;
          daily_digest: boolean | null;
          weekly_report: boolean | null;
          chatbot_alerts: boolean | null;
          marketing_emails: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          enable_notifications?: boolean | null;
          daily_digest?: boolean | null;
          weekly_report?: boolean | null;
          chatbot_alerts?: boolean | null;
          marketing_emails?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          enable_notifications?: boolean | null;
          daily_digest?: boolean | null;
          weekly_report?: boolean | null;
          chatbot_alerts?: boolean | null;
          marketing_emails?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null;
          subscription_id: string | null;
          subscription_status:
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "not_started"
            | "past_due"
            | "paused"
            | "trialing"
            | "unpaid"
            | null;
          price_id: string | null;
          current_period_start: number | null;
          current_period_end: number | null;
          cancel_at_period_end: boolean | null;
          payment_method_brand: string | null;
          payment_method_last4: string | null;
        };
      };
      stripe_user_orders: {
        Row: {
          customer_id: string | null;
          order_id: number | null;
          checkout_session_id: string | null;
          payment_intent_id: string | null;
          amount_subtotal: number | null;
          amount_total: number | null;
          currency: string | null;
          payment_status: string | null;
          order_status: "canceled" | "completed" | "pending" | null;
          order_date: string | null;
        };
      };
    };
    Functions: {
      check_usage_limit: {
        Args: {
          p_user_id: string;
          p_metric_name: string;
        };
        Returns: {
          allowed: boolean;
          current_usage: number;
          limit: number;
          percentage_used: number;
        };
      };
      increment_usage: {
        Args: {
          p_user_id: string;
          p_metric_name: string;
          p_increment: number;
        };
        Returns: void;
      };
    };
  };
};

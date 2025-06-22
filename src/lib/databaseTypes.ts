export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          permissions: Json | null
          rate_limit_override: Json | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          rate_limit_override?: Json | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          rate_limit_override?: Json | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          processed: boolean | null
          stripe_event_id: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          processed?: boolean | null
          stripe_event_id?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          processed?: boolean | null
          stripe_event_id?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_role_templates: {
        Row: {
          bot_avatar: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          id: string
          is_default: boolean | null
          name: string
          placeholder: string | null
          system_instructions: string
          welcome_message: string | null
        }
        Insert: {
          bot_avatar?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          placeholder?: string | null
          system_instructions: string
          welcome_message?: string | null
        }
        Update: {
          bot_avatar?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          placeholder?: string | null
          system_instructions?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      chat_feedback: {
        Row: {
          bot_response: string
          chatbot_id: string
          comment: string | null
          created_at: string | null
          id: string
          is_positive: boolean
          message_id: string
          sources: Json | null
          user_query: string
        }
        Insert: {
          bot_response: string
          chatbot_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_positive: boolean
          message_id: string
          sources?: Json | null
          user_query: string
        }
        Update: {
          bot_response?: string
          chatbot_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_positive?: boolean
          message_id?: string
          sources?: Json | null
          user_query?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_feedback_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          chatbot_id: string
          created_at: string | null
          id: string
          message: string
          response: string
          user_ip: string | null
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          id?: string
          message: string
          response: string
          user_ip?: string | null
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          id?: string
          message?: string
          response?: string
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          bot_avatar: string | null
          created_at: string | null
          description: string
          id: string
          knowledge_base_processed: boolean | null
          name: string
          placeholder: string | null
          bot_role_template_id: string | null
          status: Database["public"]["Enums"]["chatbot_status"] | null
          updated_at: string | null
          user_id: string
          welcome_message: string | null
        }
        Insert: {
          bot_avatar?: string | null
          created_at?: string | null
          description: string
          id?: string
          knowledge_base_processed?: boolean | null
          name: string
          placeholder?: string | null
          bot_role_template_id?: string | null
          status?: Database["public"]["Enums"]["chatbot_status"] | null
          updated_at?: string | null
          user_id: string
          welcome_message?: string | null
        }
        Update: {
          bot_avatar?: string | null
          created_at?: string | null
          description?: string
          id?: string
          knowledge_base_processed?: boolean | null
          name?: string
          placeholder?: string | null
          bot_role_template_id?: string | null
          status?: Database["public"]["Enums"]["chatbot_status"] | null
          updated_at?: string | null
          user_id?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_role_template_id_fkey"
            columns: ["bot_role_template_id"]
            isOneToOne: false
            referencedRelation: "bot_role_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string | null
          currency: string
          id: string
          invoice_pdf: string | null
          period_end: string | null
          period_start: string | null
          status: string
          stripe_invoice_id: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_due: number
          amount_paid: number
          created_at?: string | null
          currency?: string
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          status: string
          stripe_invoice_id: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string | null
          currency?: string
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_invoice_id?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_chunks: {
        Row: {
          chatbot_id: string
          chunk_index: number
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          knowledge_base_id: string
          metadata: Json | null
          source_url: string | null
        }
        Insert: {
          chatbot_id: string
          chunk_index?: number
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          knowledge_base_id: string
          metadata?: Json | null
          source_url?: string | null
        }
        Update: {
          chatbot_id?: string
          chunk_index?: number
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          knowledge_base_id?: string
          metadata?: Json | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_chunks_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          chatbot_id: string
          content: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string | null
          filename: string | null
          id: string
          metadata: Json | null
          processed: boolean | null
        }
        Insert: {
          chatbot_id: string
          content: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          filename?: string | null
          id?: string
          metadata?: Json | null
          processed?: boolean | null
        }
        Update: {
          chatbot_id?: string
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          filename?: string | null
          id?: string
          metadata?: Json | null
          processed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_configs: {
        Row: {
          burst_limit: number
          config_type: string
          created_at: string | null
          enabled: boolean
          endpoint: string
          id: string
          requests_per_day: number
          requests_per_hour: number
          requests_per_minute: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          burst_limit?: number
          config_type?: string
          created_at?: string | null
          enabled?: boolean
          endpoint?: string
          id?: string
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          burst_limit?: number
          config_type?: string
          created_at?: string | null
          enabled?: boolean
          endpoint?: string
          id?: string
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          limit_value: number
          requests_count: number | null
          updated_at: string | null
          window_duration: unknown | null
          window_start: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          limit_value: number
          requests_count?: number | null
          updated_at?: string | null
          window_duration?: unknown | null
          window_start?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          limit_value?: number
          requests_count?: number | null
          updated_at?: string | null
          window_duration?: unknown | null
          window_start?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_ip: unknown | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          source_ip?: unknown | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_ip?: unknown | null
          user_id?: string | null
        }
        Relationships: []
      }
      staging_deployments: {
        Row: {
          chatbot_id: string
          config: Json
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          chatbot_id: string
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
          url?: string | null
          user_id: string
        }
        Update: {
          chatbot_id?: string
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staging_deployments_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          created_at: string | null
          customer_id: string
          deleted_at: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          deleted_at?: string | null
          id?: never
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          deleted_at?: string | null
          id?: never
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_orders: {
        Row: {
          amount_subtotal: number
          amount_total: number
          checkout_session_id: string
          created_at: string | null
          currency: string
          customer_id: string
          deleted_at: string | null
          id: number
          payment_intent_id: string
          payment_status: string
          status: Database["public"]["Enums"]["stripe_order_status"]
          updated_at: string | null
        }
        Insert: {
          amount_subtotal: number
          amount_total: number
          checkout_session_id: string
          created_at?: string | null
          currency: string
          customer_id: string
          deleted_at?: string | null
          id?: never
          payment_intent_id: string
          payment_status: string
          status?: Database["public"]["Enums"]["stripe_order_status"]
          updated_at?: string | null
        }
        Update: {
          amount_subtotal?: number
          amount_total?: number
          checkout_session_id?: string
          created_at?: string | null
          currency?: string
          customer_id?: string
          deleted_at?: string | null
          id?: never
          payment_intent_id?: string
          payment_status?: string
          status?: Database["public"]["Enums"]["stripe_order_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: number | null
          current_period_start: number | null
          customer_id: string
          deleted_at: string | null
          id: number
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          status: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id: string
          deleted_at?: string | null
          id?: never
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          status: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: number | null
          current_period_start?: number | null
          customer_id?: string
          deleted_at?: string | null
          id?: never
          payment_method_brand?: string | null
          payment_method_last4?: string | null
          price_id?: string | null
          status?: Database["public"]["Enums"]["stripe_subscription_status"]
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_scenarios: {
        Row: {
          chatbot_id: string
          created_at: string | null
          description: string | null
          expected_responses: Json | null
          id: string
          last_run_at: string | null
          last_run_results: Json | null
          name: string
          status: string | null
          test_messages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          description?: string | null
          expected_responses?: Json | null
          id?: string
          last_run_at?: string | null
          last_run_results?: Json | null
          name: string
          status?: string | null
          test_messages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          description?: string | null
          expected_responses?: Json | null
          id?: string
          last_run_at?: string | null
          last_run_results?: Json | null
          name?: string
          status?: string | null
          test_messages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_scenarios_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      token_rollovers: {
        Row: {
          created_at: string | null
          from_period_end: string
          from_period_start: string
          id: string
          subscription_id: string
          tokens_rolled_over: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_period_end: string
          from_period_start: string
          id?: string
          subscription_id: string
          tokens_rolled_over: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_period_end?: string
          from_period_start?: string
          id?: string
          subscription_id?: string
          tokens_rolled_over?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_rollovers_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          created_at: string | null
          id: string
          limit_value: number
          metric_name: string
          overage_price: number | null
          plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          limit_value: number
          metric_name: string
          overage_price?: number | null
          plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          limit_value?: number
          metric_name?: string
          overage_price?: number | null
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_limits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_email_settings: {
        Row: {
          chatbot_alerts: boolean | null
          created_at: string | null
          daily_digest: boolean | null
          enable_notifications: boolean | null
          marketing_emails: boolean | null
          updated_at: string | null
          user_id: string
          weekly_report: boolean | null
        }
        Insert: {
          chatbot_alerts?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          enable_notifications?: boolean | null
          marketing_emails?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_report?: boolean | null
        }
        Update: {
          chatbot_alerts?: boolean | null
          created_at?: string | null
          daily_digest?: boolean | null
          enable_notifications?: boolean | null
          marketing_emails?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_report?: boolean | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          email_confirmed_at: string | null
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          email_confirmed_at?: string | null
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          email_confirmed_at?: string | null
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          active: boolean | null
          chatbot_id: string | null
          created_at: string | null
          events: string[]
          failure_count: number | null
          id: string
          last_triggered_at: string | null
          name: string
          secret: string | null
          success_count: number | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          chatbot_id?: string | null
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          success_count?: number | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          chatbot_id?: string | null
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          id?: string
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          success_count?: number | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      stripe_user_orders: {
        Row: {
          amount_subtotal: number | null
          amount_total: number | null
          checkout_session_id: string | null
          currency: string | null
          customer_id: string | null
          order_date: string | null
          order_id: number | null
          order_status:
            | Database["public"]["Enums"]["stripe_order_status"]
            | null
          payment_intent_id: string | null
          payment_status: string | null
        }
        Relationships: []
      }
      stripe_user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          current_period_end: number | null
          current_period_start: number | null
          customer_id: string | null
          payment_method_brand: string | null
          payment_method_last4: string | null
          price_id: string | null
          subscription_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["stripe_subscription_status"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_and_mark_welcome_email: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_email_limit: {
        Args: { p_user_id: string; p_count?: number }
        Returns: Json
      }
      check_token_limit: {
        Args: {
          p_user_id: string
          p_metric_name: string
          p_estimated_tokens?: number
        }
        Returns: Json
      }
      check_usage_limit: {
        Args: { p_user_id: string; p_metric_name: string }
        Returns: Json
      }
      get_current_usage: {
        Args: { p_user_id: string; p_metric_name: string }
        Returns: Json
      }
      get_rate_limit_config: {
        Args: { p_user_id: string; p_endpoint?: string }
        Returns: {
          requests_per_minute: number
          requests_per_hour: number
          requests_per_day: number
          burst_limit: number
          enabled: boolean
        }[]
      }
      get_token_usage_trends: {
        Args: { p_user_id: string; p_days?: number }
        Returns: Json
      }
      get_user_token_usage: {
        Args: { p_user_id: string }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_rate_limit_counter: {
        Args: {
          p_identifier: string
          p_endpoint: string
          p_window_start: string
        }
        Returns: undefined
      }
      increment_usage: {
        Args: { p_user_id: string; p_metric_name: string; p_increment?: number }
        Returns: Json
      }
      is_email_confirmed: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      mark_email_confirmed: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      search_chunks_by_text: {
        Args: {
          search_query: string
          target_chatbot_id: string
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          chunk_index: number
          source_url: string
          metadata: Json
        }[]
      }
      search_similar_chunks: {
        Args: {
          query_embedding: string
          target_chatbot_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
          chunk_index: number
          source_url: string
          metadata: Json
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      start_free_trial: {
        Args: { p_user_id: string }
        Returns: string
      }
      sync_email_confirmation: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      track_email_usage: {
        Args: { p_user_id: string; p_count?: number }
        Returns: boolean
      }
      track_token_usage: {
        Args: {
          p_user_id: string
          p_metric_name: string
          p_increment: number
          p_metadata?: Json
        }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      chatbot_status: "creating" | "processing" | "ready" | "error"
      content_type: "text" | "document"
      stripe_order_status: "pending" | "completed" | "canceled"
      stripe_subscription_status:
        | "not_started"
        | "incomplete"
        | "incomplete_expired"
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chatbot_status: ["creating", "processing", "ready", "error"],
      content_type: ["text", "document"],
      stripe_order_status: ["pending", "completed", "canceled"],
      stripe_subscription_status: [
        "not_started",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
      ],
    },
  },
} as const

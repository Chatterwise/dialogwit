import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company: string | null
          timezone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company?: string | null
          timezone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chatbots: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          created_at: string
          updated_at: string
          status: 'creating' | 'processing' | 'ready' | 'error'
          knowledge_base_processed: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'creating' | 'processing' | 'ready' | 'error'
          knowledge_base_processed?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'creating' | 'processing' | 'ready' | 'error'
          knowledge_base_processed?: boolean
        }
      }
      knowledge_base: {
        Row: {
          id: string
          chatbot_id: string
          content: string
          content_type: 'text' | 'document'
          filename: string | null
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chatbot_id: string
          content: string
          content_type: 'text' | 'document'
          filename?: string | null
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chatbot_id?: string
          content?: string
          content_type?: 'text' | 'document'
          filename?: string | null
          processed?: boolean
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chatbot_id: string
          message: string
          response: string
          created_at: string
          user_ip: string | null
        }
        Insert: {
          id?: string
          chatbot_id: string
          message: string
          response: string
          created_at?: string
          user_ip?: string | null
        }
        Update: {
          id?: string
          chatbot_id?: string
          message?: string
          response?: string
          created_at?: string
          user_ip?: string | null
        }
      }
    }
  }
}
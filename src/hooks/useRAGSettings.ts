import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/toastStore';
import { Database } from '../lib/databaseTypes';

type RAGSettings = Database['public']['Tables']['rag_settings']['Row'];
type RAGSettingsInsert = Database['public']['Tables']['rag_settings']['Insert'];

export const useRAGSettings = (chatbotId: string) => {
  return useQuery({
    queryKey: ['rag_settings', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rag_settings')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 116 = no rows found
      return data || null;
    },
    enabled: !!chatbotId,
  });
};

export const useUpdateRAGSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      chatbot_id,
      updates,
    }: {
      chatbot_id: string;
      updates: Partial<RAGSettingsInsert>;
    }) => {
      const { data, error } = await supabase
        .from('rag_settings')
        .upsert({ chatbot_id, ...updates }, { onConflict: 'chatbot_id' })
        .select()
        .single();

      if (error) throw error;
      return data as RAGSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rag_settings', data.chatbot_id] });
      toast.success('Advanced RAG settings saved');
    },
    onError: () => {
      toast.error('Failed to save RAG settings');
    },
  });
};

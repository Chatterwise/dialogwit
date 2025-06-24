import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

// Get knowledge base items for a chatbot
export const useKnowledgeBase = (chatbotId: string) => {
  return useQuery({
    queryKey: ["knowledgeBase", chatbotId],
    queryFn: async () => {
      if (!chatbotId) return [];
      
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!chatbotId,
  });
};

// Add a new knowledge base item
export const useAddKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: {
      chatbot_id: string;
      content: string;
      content_type: "text" | "document";
      filename?: string | null;
      processed: boolean;
    }) => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .insert(newItem)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", data.chatbot_id] });
    },
  });
};

// Update an existing knowledge base item
export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      id,
      updates
    }: {
      id: string;
      updates: {
        content?: string;
        content_type?: "text" | "document";
        filename?: string | null;
        processed?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", data.chatbot_id] });
    },
  });
};

// Delete a knowledge base item
export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the item to know which chatbot it belongs to
      const { data: item } = await supabase
        .from("knowledge_base")
        .select("chatbot_id")
        .eq("id", id)
        .single();
      
      const chatbotId = item?.chatbot_id;
      
      // Then delete the item
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return { id, chatbotId };
    },
    onSuccess: (data) => {
      if (data.chatbotId) {
        queryClient.invalidateQueries({ queryKey: ["knowledgeBase", data.chatbotId] });
      }
    },
  });
};
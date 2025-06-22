import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../lib/databaseTypes";

type KnowledgeBase = Database["public"]["Tables"]["knowledge_base"]["Row"];
type KnowledgeBaseInsert =
  Database["public"]["Tables"]["knowledge_base"]["Insert"];

export const useKnowledgeBase = (chatbotId: string) => {
  return useQuery({
    queryKey: ["knowledge_base", chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeBase[];
    },
    enabled: !!chatbotId,
  });
};

export const useAddKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (knowledgeBase: KnowledgeBaseInsert) => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .insert(knowledgeBase)
        .select()
        .single();

      if (error) throw error;
      return data as KnowledgeBase;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge_base", data.chatbot_id],
      });
    },
  });
};

export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_base"] });
    },
  });
};

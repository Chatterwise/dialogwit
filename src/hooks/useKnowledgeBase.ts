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
      console.log("Adding knowledge base:", knowledgeBase);
      if (error) throw error;
      return data as KnowledgeBase;
    },
onSuccess: async (data) => {
  // 1. Invalidate the cache
  queryClient.invalidateQueries({
    queryKey: ["knowledge_base", data.chatbot_id],
  });

  // 2. Call the training function
  try {
    console.log("🚀 Triggering training for chatbot:", data.chatbot_id);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-knowledge-base`,
      {
        method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        body: JSON.stringify({
          chatbotId: data.chatbot_id,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Training function failed:", errText);
    } else {
      console.log("✅ Training triggered successfully");
    }
  } catch (e) {
    console.error("❌ Error calling training function:", e);
  }
}

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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProcessLargeDocument = (chatbotId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (knowledgeBaseId: string) => {
      const session = (await supabase.auth.getSession()).data.session;

      const r = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-kb-to-openai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ knowledge_base_id: knowledgeBaseId }),
        }
      );

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || "Failed to sync to OpenAI Vector Store");
      }

      return r.json().catch(() => ({}));
    },
    onSuccess: () => {
      // Refresh KB + bot (vector_store_id might have been created)
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase", chatbotId] });
      queryClient.invalidateQueries({ queryKey: ["chatbot", chatbotId] });
    },
  });
};

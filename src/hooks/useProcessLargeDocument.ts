import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProcessLargeDocument = (chatbotId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const session = (await supabase.auth.getSession()).data.session;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-large-documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ knowledge_base_id: id }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.log(text)
        throw new Error(text || "Failed to process document");
      }

      return response.text();
    },
    onSuccess: () => {
      // Invalidate the knowledgeBase query for the current chatbot
      queryClient.invalidateQueries({
        queryKey: ["knowledgeBase", chatbotId],
      });
    },
  });
};

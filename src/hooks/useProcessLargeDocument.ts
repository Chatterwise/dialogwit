import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const useProcessLargeDocument = () => {
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
        throw new Error(text || "Failed to process document");
      }

      return response.text();
    },
  });
};
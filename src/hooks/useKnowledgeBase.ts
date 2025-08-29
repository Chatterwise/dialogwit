import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { fetchWithRetry } from "../lib/http";

/** Knowledge base row type (minimal, extend if you have generated types) */
export type KnowledgeBaseRow = {
  id: string;
  chatbot_id: string;
  content: string | null;
  content_type: "text" | "document";
  filename: string | null;
  processed: boolean;
  status: "pending" | "processing" | "completed" | "error" | "removed" | string;
  openai_file_id?: string | null;
  created_at?: string | null;
  progress?: number | null;       // optional, if your schema has it
  error_message?: string | null;  // optional
};

/** Hide soft-removed rows; newest first */
export const useKnowledgeBase = (chatbotId: string) => {
  return useQuery({
    queryKey: ["knowledgeBase", chatbotId],
    enabled: !!chatbotId,
    queryFn: async () => {
      if (!chatbotId) return [];
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .neq("status", "removed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as KnowledgeBaseRow[];
    },
  });
};

/** Helper to wait for insert to become visible (optional) */
export const waitForKnowledgeBaseToPersist = async (
  chatbotId: string,
  timeout = 5000
): Promise<boolean> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("id")
      .eq("chatbot_id", chatbotId)
      .eq("processed", false)
      .maybeSingle();
    if (data && !error) return true;
    await new Promise((res) => setTimeout(res, 300));
  }
  return false;
};

/** Add a new KB item (status defaults to 'pending') */
export const useAddKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: {
      chatbot_id: string;
      content: string;
      content_type: "text" | "document";
      filename?: string | null;
      processed?: boolean;
      status?: KnowledgeBaseRow["status"];
    }) => {
      const payload = {
        ...newItem,
        processed: newItem.processed ?? false,
        status: newItem.status ?? "pending",
      };
      const { data, error } = await supabase
        .from("knowledge_base")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as KnowledgeBaseRow;
    },
    onSuccess: (data) => {
      if (data?.chatbot_id) {
        queryClient.invalidateQueries({
          queryKey: ["knowledgeBase", data.chatbot_id],
        });
      }
    },
  });
};

/** Update a KB item */
export const useUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<
        Pick<
          KnowledgeBaseRow,
          "content" | "content_type" | "filename" | "processed" | "status"
        >
      >;
    }) => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as KnowledgeBaseRow;
    },
    onSuccess: (data) => {
      if (data?.chatbot_id) {
        queryClient.invalidateQueries({
          queryKey: ["knowledgeBase", data.chatbot_id],
        });
      }
    },
  });
};

/** HARD delete (DB row). Keep only if you need a “purge” button somewhere. */
export const useDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: item } = await supabase
        .from("knowledge_base")
        .select("chatbot_id")
        .eq("id", id)
        .single();
      const chatbotId = item?.chatbot_id as string | undefined;
      const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
      if (error) throw error;
      return { id, chatbotId };
    },
    onSuccess: (res) => {
      if (res.chatbotId) {
        queryClient.invalidateQueries({
          queryKey: ["knowledgeBase", res.chatbotId],
        });
      }
    },
  });
};

/** SOFT remove + unlink from OpenAI (edge function) */
export const useRemoveKnowledgeBaseFromOpenAI = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: row, error: rowErr } = await supabase
        .from("knowledge_base")
        .select("chatbot_id")
        .eq("id", id)
        .single();
      if (rowErr || !row) throw rowErr || new Error("KB item not found");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const r = await fetchWithRetry(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/remove-kb-from-openai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // anon key not required here; use user bearer
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ knowledge_base_id: id }),
          timeoutMs: 20000,
          retries: 1,
        }
      );

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || "remove-kb-from-openai failed");
      }

      return { id, chatbotId: row.chatbot_id as string };
    },
    onSuccess: (res) => {
      if (res.chatbotId) {
        queryClient.invalidateQueries({
          queryKey: ["knowledgeBase", res.chatbotId],
        });
      }
    },
  });
};

/** Bulk soft-remove */
export const useBulkDeleteKnowledgeBase = () => {
  const removeOne = useRemoveKnowledgeBaseFromOpenAI();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      let ok = 0;
      let fail = 0;
      for (const id of ids) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await removeOne.mutateAsync(id);
          ok += 1;
        } catch {
          fail += 1;
        }
      }
      return { ok, fail };
    },
  });
};

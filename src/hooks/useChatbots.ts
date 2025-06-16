import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../lib/supabase";

type Chatbot = Database["public"]["Tables"]["chatbots"]["Row"];
type ChatbotInsert = Database["public"]["Tables"]["chatbots"]["Insert"];

export const useChatbots = (userId: string) => {
  return useQuery({
    queryKey: ["chatbots", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Chatbot[];
    },
    enabled: !!userId,
  });
};

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatbot: ChatbotInsert) => {
      const { data, error } = await supabase
        .from("chatbots")
        .insert(chatbot)
        .select()
        .single();

      if (error) throw error;
      return data as Chatbot;
    },
    onSuccess: (data) => {
      // Invalidate and refetch chatbots
      queryClient.invalidateQueries({ queryKey: ["chatbots", data.user_id] });
    },
  });
};

export const useUpdateChatbot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Chatbot>;
    }) => {
      const { data, error } = await supabase
        .from("chatbots")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Chatbot;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots", data.user_id] });
    },
  });
};

export const useDeleteChatbot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chatbots").delete().eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all chatbot queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      // Also invalidate the specific chatbot query
      queryClient.invalidateQueries({ queryKey: ["chatbot", deletedId] });
    },
  });
};

export const useChatbot = (id: string) => {
  return useQuery({
    queryKey: ["chatbot", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Chatbot;
    },
    enabled: !!id,
  });
};

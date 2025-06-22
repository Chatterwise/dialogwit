import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../lib/databaseTypes";
import { useToast } from "../lib/toastStore";

type Chatbot = Database["public"]["Tables"]["chatbots"]["Row"];
type ChatbotInsert = Database["public"]["Tables"]["chatbots"]["Insert"];
type RoleTemplate = {
  id: string;
  name: string;
  description: string;
  system_instructions: string;
  bot_avatar?: string;
  placeholder?: string;
  welcome_message?: string;
};

export const useChatbots = (userId?: string) => {
  return useQuery({
    queryKey: ["chatbots", userId],
    enabled: typeof userId === "string" && userId.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*, bot_role_templates(name, icon_name)")
        .eq("user_id", userId)
        //.neq("status", "deleted") // ← filter out deleted
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Chatbot[];
    },
  });
};

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

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
      toast.success("Chatbot successfully created");
    },onError: () => {
      toast.error("Failed to create chatbot");
    },
  });
};

export const useUpdateChatbot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

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
      toast.success("Chatbot updated");
    },
    onError: () => {
      toast.error("Failed to update");
    },
  });
};

export const useDeleteChatbot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // const { error } = await supabase.from("chatbots").delete().eq("id", id);
      const { error } = await supabase
        .from("chatbots")
        .update({ status: "deleted" })
        .eq("id", id);
      if (error) throw error;
      return { id };
    },
    onSuccess: (_, deletedId) => {
      // Invalidate all chatbot queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      // Also invalidate the specific chatbot query
      queryClient.invalidateQueries({ queryKey: ["chatbot", deletedId] });
      toast.success("Chatbot successfully marked for deletion");
    },
    onError: () => {
      toast.error("Failed to mark for deletion");
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
        //.neq("status", "deleted") // ← filter out deleted
        .single();

      if (error) throw error;
      return data as Chatbot;
    },
    enabled: !!id,
  });
};

export const useRestoreChatbot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chatbots")
        .update({ status: "ready" }) // or previous status if you track it
        .eq("id", id);

      if (error) throw error;
      return { id };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      queryClient.invalidateQueries({ queryKey: ["chatbot", id] });
      toast.success("Chatbot successfully restored");
    },
    onError: () => {
      toast.error("Failed to restore chatbot");
    },
  });
};

export const useRoleTemplates = () => {
  return useQuery({
    queryKey: ["role_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_role_templates")
        .select("id, name, description, system_instructions, bot_avatar, placeholder, welcome_message")
        .eq("is_default", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as RoleTemplate[];
    },
  });
};


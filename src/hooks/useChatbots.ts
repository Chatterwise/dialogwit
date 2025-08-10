import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Database } from "../lib/databaseTypes";
import { useToast } from "../lib/toastStore";
import { useEffect } from "react";

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
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ["chatbots", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*, bot_role_templates(name, icon_name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Chatbot[];
    },
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chatbots-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",                
          schema: "public",
          table: "chatbots",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chatbots", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return q;
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
      // First, delete all usage tracking records for this chatbot
      const { error: usageError } = await supabase
        .from("usage_tracking")
        .delete()
        .eq("chatbot_id", id);
      if (usageError) throw usageError;

      // Now, delete the chatbot
      const { error: chatbotError } = await supabase
        .from("chatbots")
        .delete()
        .eq("id", id);
      if (chatbotError) throw chatbotError;

      return { id };
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
      queryClient.invalidateQueries({ queryKey: ["chatbot", deletedId] });
      toast.success("Chatbot and related usage data successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete chatbot or related usage data");
    },
  });
};


export const useChatbot = (id: string) => {
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ["chatbot", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Chatbot;
    },
  });

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`chatbot-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chatbots", filter: `id=eq.${id}` },
        (payload) => {
          queryClient.setQueryData<Chatbot>(["chatbot", id], payload.new as Chatbot);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return q;
};
export const useRestoreChatbot = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chatbots")
        .update({ status: "ready" })
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


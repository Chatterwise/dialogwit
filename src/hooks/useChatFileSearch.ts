import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type AskArgs = {
  chatbot_id: string;
  message: string;
  thread_id?: string;
  user_id?: string;
};

type AskResult = {
  ok: boolean;
  text: string;
  thread_id?: string;
};

export function useChatFileSearch() {
  return useMutation<AskResult, Error, AskArgs>({
    mutationFn: async (body) => {
      const { data } = await supabase.auth.getSession();
      const userToken = data.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const bearer = userToken ?? anonKey;
      const base = import.meta.env.VITE_SUPABASE_URL as string;

      const chatOnce = async () => {
        const res = await fetch(`${base}/functions/v1/chat-file-search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
            apikey: anonKey,
          },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        return { res, json };
      };

      const ensureAssistant = async () => {
        const res = await fetch(`${base}/functions/v1/ensure-assistant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ chatbot_id: body.chatbot_id }),
        });
        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(
            `ensure-assistant failed (${res.status})${t ? `: ${t}` : ""}`
          );
        }
      };

      // First attempt
      let { res, json } = await chatOnce();

      // Auto-heal if the assistant is missing/not linked
      if (!res.ok || json?.ok === false) {
        const msg = String(json?.error || "");
        if (
          /not linked to an openai assistant/i.test(msg) ||
          /assistant_id/i.test(msg)
        ) {
          await ensureAssistant();
          ({ res, json } = await chatOnce()); // retry once
        }
      }

      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || `Chat failed (${res.status})`);
      }
      return json as AskResult;
    },
  });
}

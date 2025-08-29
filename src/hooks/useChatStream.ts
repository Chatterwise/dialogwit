// hooks/useChatStream.ts
import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useToast } from "../lib/toastStore";
import { fetchEventStream, fetchWithRetry } from "../lib/http";

export type ChatArgs = {
  chatbot_id: string;
  message: string;
  thread_id?: string;
  user_id?: string;
  stream?: boolean;
  onReady?: (thread_id: string) => void;
  onDelta?: (delta: string, fullSoFar: string) => void;
  onEnd?: (full: string) => void;
  onError?: (err: unknown) => void;
};

export type ChatResult = {
  ok: boolean;
  text: string;
  thread_id?: string;
};

export function useChatStream() {
  const abortRef = useRef<AbortController | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const toast = useToast();

  const mutation = useMutation<ChatResult, Error, ChatArgs>({
    mutationFn: async (args) => {
      const { data } = await supabase.auth.getSession();
      const userToken = data.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const base = import.meta.env.VITE_SUPABASE_URL as string;
      const bearer = userToken ?? anonKey;

      const reqBody = {
        chatbot_id: args.chatbot_id,
        message: args.message,
        ...(args.thread_id ? { thread_id: args.thread_id } : {}),
        ...(args.user_id ? { user_id: args.user_id } : {}),
        stream: args.stream ?? true,
      };

      const chatOnce = async () => {
        abortRef.current = new AbortController();
        return fetchEventStream(`${base}/functions/v1/chat-file-search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
            apikey: anonKey,
          },
          body: JSON.stringify(reqBody),
          signal: abortRef.current.signal,
          timeoutMs: 45000,
          retries: 1,
        });
      };

      const ensureAssistant = async () => {
        const res = await fetchWithRetry(`${base}/functions/v1/ensure-assistant`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${bearer}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ chatbot_id: args.chatbot_id }),
          timeoutMs: 15000,
          retries: 1,
        });
        if (!res.ok) {
          const txt = await res.text().catch((err) => {
            console.debug("ensure-assistant text read failed", err);
            return "";
          });
          throw new Error(`ensure-assistant failed (${res.status})${txt ? `: ${txt}` : ""}`);
        }
      };

      let res = await chatOnce();

      const maybeJson = async () => {
        try {
          return await res.clone().json();
        } catch {
          return null;
        }
      };
      let json: any = await maybeJson();

      if (!res.ok || json?.ok === false) {
        const msg = String(json?.error || "");
        if (/not linked to an openai assistant/i.test(msg) || /assistant_id/i.test(msg)) {
          await ensureAssistant();
          res = await chatOnce();
          json = await maybeJson();
        } else if (res.status >= 500) {
          // One reconnect attempt on transient server errors
          res = await chatOnce();
          json = await maybeJson();
        }
      }

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";
        const MAX_IDLE_MS = 30000; // abort if no frames for 30s

        const emitReady = (tid: string) => args.onReady?.(tid);
        const emitDelta = (piece: string) => {
          full += piece;
          args.onDelta?.(piece, full);
        };
        const emitEnd = () => args.onEnd?.(full);

        try {
          const resetIdleTimer = () => {
            if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
            idleTimerRef.current = window.setTimeout(() => {
              abortRef.current?.abort();
            }, MAX_IDLE_MS) as unknown as number;
          };
          resetIdleTimer();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            resetIdleTimer();
            buffer += decoder.decode(value, { stream: true });

            let idx: number;
            while ((idx = buffer.indexOf("\n\n")) !== -1) {
              const frame = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);

              let event = "";
              let dataStr = "";
              for (const line of frame.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                if (line.startsWith("data:")) dataStr += line.slice(5).trim();
              }

              if (event === "ready") {
                try {
                  const payload = JSON.parse(dataStr || "{}");
                  if (payload.thread_id) emitReady(payload.thread_id);
                } catch (err) {
                  console.debug("SSE ready parse error", err);
                }
              } else if (event === "delta") {
                try {
                  const payload = JSON.parse(dataStr || "{}");
                  if (typeof payload.text === "string") emitDelta(payload.text);
                } catch (err) {
                  console.debug("SSE delta parse error", err);
                }
              } else if (event === "end") {
                emitEnd();
              } else if (event === "error") {
                throw new Error(dataStr || "stream error");
              }
            }
          }
        } catch (err) {
          args.onError?.(err);
          const msg = err instanceof Error ? err.message : "Streaming failed";
          toast.error(msg);
          throw new Error(msg);
        }

        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        return { ok: true, text: full };
      }

      json = json ?? (await res.json().catch((err) => {
        console.debug("chat-file-search JSON parse error", err);
        return {};
      }));
      if (!res.ok || json?.ok === false) {
        const errMsg = json?.error || `Chat failed (${res.status})`;
        if (res.status === 429) {
          toast.error("You are sending messages too fast. Please wait a moment.");
        } else if (res.status >= 500) {
          toast.error("Server error while chatting. Please try again.");
        } else {
          toast.error(errMsg);
        }
        throw new Error(errMsg);
      }
      return {
        ok: true,
        text: json.text ?? json.response ?? "",
        thread_id: json.thread_id,
      };
    },
  });

  return {
    ...mutation,
    cancel: () => abortRef.current?.abort(),
  };
}

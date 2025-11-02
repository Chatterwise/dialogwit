// supabase/functions/chat-file-search/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

console.log("[chat-file-search] boot", {
  has_SUPABASE_URL: !!SUPABASE_URL,
  has_SERVICE_ROLE: !!SERVICE_ROLE,
  has_OPENAI_KEY: !!OPENAI_API_KEY,
});

const db = createClient(SUPABASE_URL!, SERVICE_ROLE!);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function sse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      ...CORS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function stripCitations(s: string) {
  return s
    .replace(/【\d+(?::\d+)?†source】/g, "")
    .replace(/【[^】]*】/g, "")
    .replace(/\s*\[\d+\]/g, "")
    .replace(/\s*\(\d+\)/g, "")
    .trim();
}

async function openai(path: string, init: RequestInit) {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[openai error]", path, res.status, data);
    throw new Error(`OpenAI ${path} error: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

const botCache = new Map<string, { data: any; exp: number }>();
function cacheGet<T = any>(id: string): T | null {
  const hit = botCache.get(id);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    botCache.delete(id);
    return null;
  }
  return hit.data as T;
}
function cacheSet(id: string, data: any, ttlMs = 30_000) {
  botCache.set(id, { data, exp: Date.now() + ttlMs });
}

/** One row per turn: (chatbot_id, message, response, user_ip) */
async function saveExchange(
  chatbot_id: string,
  userMessage: string,
  botText: string,
  user_ip: string | null
) {
  const row = {
    chatbot_id,
    message: String(userMessage),
    response: String(botText ?? ""), // response is NOT NULL in schema
    user_ip: user_ip ?? null,
  };
  const { error } = await db.from("chat_messages").insert(row);
  if (error) console.error("[saveExchange error]", error, "row=", row);
  else console.log("[saveExchange ok]", { chatbot_id, len: row.response.length });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const body = await req.json().catch(() => ({}));
    const chatbot_id: string | null = body.chatbot_id ?? body.botId ?? null;
    const message: string | null = body.message ?? null;
    const thread_id_in: string | null = body.thread_id ?? body.threadId ?? null;
    const user_ip: string | null = body.user_ip ?? body.userId ?? body.user_id ?? null; // maps to user_ip column
    const wantStream: boolean = Boolean(body.stream);

    console.log("[request]", {
      chatbot_id,
      hasMessage: !!message,
      wantStream,
      thread_id_in: !!thread_id_in,
      user_ip,
    });

    if (!chatbot_id || !message) {
      return json({ ok: false, error: "chatbot_id and message are required" }, 400);
    }

    // Load bot (cached)
    let bot = cacheGet<any>(chatbot_id);
    if (!bot) {
      const { data, error } = await db
        .from("chatbots")
        .select("id,name,status,openai_assistant_id,openai_vector_store_id,fallback_message")
        .eq("id", chatbot_id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ ok: false, error: "Chatbot not found" }, 404);
      bot = data;
      cacheSet(chatbot_id, bot);
    }
    const botName = bot.name ?? "AI assistant";
    const status = String(bot.status ?? "ready").toLowerCase();
    let assistantId: string | null = bot.openai_assistant_id ?? null;
    const vectorStoreId: string | null = bot.openai_vector_store_id ?? null;
    const fallback = (bot.fallback_message?.trim() || "I don’t have that information yet.").replace(/\s+/g, " ");

    // ---- Unified, human, proactive instruction block ----
    const STYLE = [
      `Tone: warm, human, proactive, concise. Use short paragraphs and bullets when helpful.`,
      `Write in the user's language.`,
      `Keep answers compact (up to ~8 sentences unless the user asks for detail).`,
    ].join(" ");

    const FILES_POLICY = [
      `Primary source is the bot’s files (File Search).`,
      `If you find partial matches, answer with what’s supported and state limitations briefly.`,
      `If nothing clearly relevant, ask ONE specific clarifying question and suggest what the user could upload (file types or examples).`,
      `Only if there is truly nothing relevant to say or ask, reply exactly: "${fallback}".`,
      `Never invent facts. Do not include citation markers.`,
    ].join(" ");

    const NO_TOOLS_POLICY = [
      `Be helpful and concise.`,
      `If unsure, ask ONE specific clarifying question.`,
      `If still unknown after that, reply exactly: "${fallback}".`,
      `No citation markers.`,
    ].join(" ");

    const UNIFIED_FILES_INSTRUCTIONS = [
      `You are ${botName}.`,
      STYLE,
      FILES_POLICY,
    ].join("\n");

    const UNIFIED_NO_TOOLS_INSTRUCTIONS = [
      `You are ${botName}.`,
      STYLE,
      NO_TOOLS_POLICY,
    ].join("\n");

    const RUN_INSTRUCTIONS = UNIFIED_FILES_INSTRUCTIONS; // same tone/policy everywhere

    // If bot not ready → reply fallback and store the exchange
    if (status !== "ready") {
      console.log("[status!=ready] sending fallback");
      if (!wantStream) {
        await saveExchange(chatbot_id, message, fallback, user_ip);
        return json({ ok: true, text: fallback, thread_id: thread_id_in }, 200);
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({ thread_id: thread_id_in })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: fallback })}\n\n`));
          controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({ thread_id: thread_id_in, text: fallback })}\n\n`));
          controller.close();
        },
      });
      (async () => { try { await saveExchange(chatbot_id, message, fallback, user_ip); } catch {} })();
      return sse(stream);
    }

    // ---------- RESPONSES: File Search fast path ----------
    async function responsesFast() {
      console.log("[responsesFast] vectorStoreId?", !!vectorStoreId);
      const basePayload = {
        model: "gpt-4o-mini",
        instructions: UNIFIED_FILES_INSTRUCTIONS,
        input: String(message),
        text: { format: "plain" as const }, // Responses API requires text.format
        temperature: 0.3,                   // slightly higher to be more conversational
        max_output_tokens: 700,
        tools: [{ type: "file_search" }],
        tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
      };

      if (!wantStream) {
        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify(basePayload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("[responsesFast non-stream error]", data);
          throw new Error(data?.error?.message || `Responses error ${res.status}`);
        }
        const text =
          data?.output_text ??
          (Array.isArray(data?.output)
            ? data.output
                .map((o: any) => (o?.content || []).map((c: any) => c?.text?.value || "").join(""))
                .join("")
            : "") ??
          "";
        const finalText = stripCitations(String(text || fallback));
        await saveExchange(chatbot_id, message, finalText, user_ip);
        return json({ ok: true, text: finalText, thread_id: thread_id_in }, 200);
      }

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ ...basePayload, stream: true }),
      });
      if (!upstream.ok || !upstream.body) {
        const t = await upstream.text().catch(() => "");
        console.error("[responsesFast stream failed]", upstream.status, t);
        throw new Error(`Responses stream failed (${upstream.status})${t ? `: ${t}` : ""}`);
      }

      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({ thread_id: thread_id_in })}\n\n`));
          const reader = upstream.body!.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;

          const push = (piece: string) => {
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: stripCitations(piece) })}\n\n`));
          };
          const end = async () => {
            if (ended) return;
            ended = true;
            const finalText = stripCitations(full || fallback);
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({ thread_id: thread_id_in, text: finalText })}\n\n`));
            controller.close();
            await saveExchange(chatbot_id, message, finalText, user_ip);
          };

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buf.indexOf("\n\n")) !== -1) {
                const frame = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                let evt = "";
                let dataStr = "";
                for (const line of frame.split("\n")) {
                  if (line.startsWith("event:")) evt = line.slice(6).trim();
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (evt === "response.output_text.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece =
                      typeof obj?.delta === "string"
                        ? obj.delta
                        : Array.isArray(obj?.delta)
                        ? obj.delta.join("")
                        : "";
                    if (piece) push(String(piece));
                  } catch {}
                } else if (evt === "response.completed" || evt === "done") {
                  await end();
                  return;
                }
              }
            }
          } catch {} finally {
            await end();
          }
        },
      });
      return sse(stream);
    }

    // ---------- Assistants path ----------
    async function ensureAssistantId() {
      const payload: any = {
        name: botName,
        model: "gpt-4o-mini",
        instructions: UNIFIED_FILES_INSTRUCTIONS,
        tools: vectorStoreId ? [{ type: "file_search" }] : [],
        metadata: { chatbot_id },
      };
      if (vectorStoreId) payload.tool_resources = { file_search: { vector_store_ids: [vectorStoreId] } };
      const created = await openai("/assistants", { method: "POST", body: JSON.stringify(payload) });
      const newId = String(created.id);
      await db.from("chatbots").update({ openai_assistant_id: newId }).eq("id", chatbot_id);
      assistantId = newId;
      const cached = cacheGet<any>(chatbot_id) || {};
      cacheSet(chatbot_id, { ...cached, openai_assistant_id: newId }, 30_000);
      console.log("[ensureAssistantId] created", newId);
      return newId;
    }

    async function assistantsPath() {
      if (!assistantId) {
        try {
          await ensureAssistantId();
        } catch {
          console.warn("[assistantsPath] ensureAssistantId failed -> responsesNoTools()");
          return responsesNoTools();
        }
      }

      let thread_id = thread_id_in;
      if (!thread_id) {
        const t = await openai(`/threads`, { method: "POST", body: JSON.stringify({}) });
        thread_id = String(t.id);
      }

      await openai(`/threads/${thread_id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          content: [{ type: "text", text: String(message) }],
        }),
      });

      if (!wantStream) {
        const run = await openai(`/threads/${thread_id}/runs`, {
          method: "POST",
          body: JSON.stringify({ assistant_id: assistantId, instructions: RUN_INSTRUCTIONS }),
        });
        const start = Date.now();
        while (Date.now() - start < 45_000) {
          const r = await openai(`/threads/${thread_id}/runs/${run.id}`, { method: "GET" });
          const s = String(r.status ?? "");
          if (s === "completed") break;
          if (["failed", "cancelled", "expired"].includes(s)) break;
          await new Promise((r2) => setTimeout(r2, 350));
        }
        const msgs = await openai(`/threads/${thread_id}/messages?limit=20`, { method: "GET" });
        let text: string | null = null;
        for (const m of (msgs as any).data ?? []) {
          if (m.role === "assistant" && Array.isArray(m.content)) {
            for (const c of m.content) {
              if (c.type === "text" && c.text?.value) {
                text = String(c.text.value);
                break;
              }
            }
          }
          if (text) break;
        }
        const finalText = stripCitations(text ?? fallback);
        await saveExchange(chatbot_id, message, finalText, user_ip);
        return json({ ok: true, text: finalText, thread_id }, 200);
      }

      const upstream = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ assistant_id: assistantId, instructions: RUN_INSTRUCTIONS, stream: true }),
      });
      if (!upstream.ok || !upstream.body) {
        console.warn("[assistantsPath] stream failed -> responsesNoTools()");
        return responsesNoTools();
      }

      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({ thread_id })}\n\n`));
          const reader = upstream.body!.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;

          const push = (piece: string) => {
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: stripCitations(piece) })}\n\n`));
          };
          const end = async () => {
            if (ended) return;
            ended = true;
            const finalText = stripCitations(full || fallback);
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({ thread_id, text: finalText })}\n\n`));
            controller.close();
            await saveExchange(chatbot_id, message, finalText, user_ip);
          };

          const isDelta = (evt: string) =>
            evt === "thread.message.delta" || evt === "response.output_text.delta" || evt === "response.delta";
          const extract = (payload: any) => {
            if (payload?.delta?.text && typeof payload.delta.text === "string") return payload.delta.text;
            const content = payload?.delta?.content;
            if (Array.isArray(content)) {
              let out = "";
              for (const part of content) {
                if (part?.text?.value) out += String(part.text.value);
                else if (typeof part?.text === "string") out += part.text;
              }
              if (out) return out;
            }
            if (payload?.output_text?.value && typeof payload.output_text.value === "string") return payload.output_text.value;
            return null;
          };

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buf.indexOf("\n\n")) !== -1) {
                const frame = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                let evt = "";
                let dataStr = "";
                for (const line of frame.split("\n")) {
                  if (line.startsWith("event:")) evt = line.slice(6).trim();
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (isDelta(evt)) {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece = extract(obj);
                    if (piece) push(String(piece));
                  } catch {}
                  continue;
                }
                if (evt === "thread.run.completed" || evt === "response.completed" || evt === "done") {
                  await end();
                  return;
                }
              }
            }
          } catch {} finally {
            await end();
          }
        },
      });
      return sse(stream);
    }

    // ---------- RESPONSES: no-tools fallback ----------
    async function responsesNoTools() {
      console.log("[responsesNoTools] start");
      const basePayload = {
        model: "gpt-4o-mini",
        instructions: UNIFIED_NO_TOOLS_INSTRUCTIONS,
        input: String(message),
        text: { format: "plain" as const },
        temperature: 0.3,
        max_output_tokens: 700,
      };

      if (!wantStream) {
        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify(basePayload),
        });
        const data = await res.json().catch(() => ({}));
        const text =
          data?.output_text ??
          (Array.isArray(data?.output)
            ? data.output
                .map((o: any) => (o?.content || []).map((c: any) => c?.text?.value || "").join(""))
                .join("")
            : "") ??
          "";
        const finalText = stripCitations(String(text || fallback));
        await saveExchange(chatbot_id, message, finalText, user_ip);
        return json({ ok: true, text: finalText, thread_id: thread_id_in }, 200);
      }

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ ...basePayload, stream: true }),
      });
      if (!upstream.ok || !upstream.body) {
        console.warn("[responsesNoTools] upstream stream failed -> fallback stream");
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
            controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({ thread_id: thread_id_in })}\n\n`));
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: fallback })}\n\n`));
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({ thread_id: thread_id_in, text: fallback })}\n\n`));
            controller.close();
          },
        });
        (async () => { try { await saveExchange(chatbot_id, message, fallback, user_ip); } catch {} })();
        return sse(stream);
      }

      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({ thread_id: thread_id_in })}\n\n`));
          const reader = upstream.body!.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;

          const push = (piece: string) => {
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({ text: stripCitations(piece) })}\n\n`));
          };
          const end = async () => {
            if (ended) return;
            ended = true;
            const finalText = stripCitations(full || fallback);
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({ thread_id: thread_id_in, text: finalText })}\n\n`));
            controller.close();
            await saveExchange(chatbot_id, message, finalText, user_ip);
          };

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              let idx: number;
              while ((idx = buf.indexOf("\n\n")) !== -1) {
                const frame = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                let evt = "";
                let dataStr = "";
                for (const line of frame.split("\n")) {
                  if (line.startsWith("event:")) evt = line.slice(6).trim();
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (evt === "response.output_text.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece =
                      typeof obj?.delta === "string"
                        ? obj.delta
                        : Array.isArray(obj?.delta)
                        ? obj.delta.join("")
                        : "";
                    if (piece) push(String(piece));
                  } catch {}
                } else if (evt === "response.completed" || evt === "done") {
                  await end();
                  return;
                }
              }
            }
          } catch {} finally {
            await end();
          }
        },
      });
      return sse(stream);
    }

    // ---------- Router ----------
    if (vectorStoreId) {
      try {
        return await responsesFast(); // fastest path (file_search)
      } catch {
        return await assistantsPath(); // fallback to Assistants
      }
    } else {
      if (assistantId) return await assistantsPath();
      return await responsesNoTools();
    }
  } catch (e) {
    console.error("[handler error]", e);
    return json({ ok: false, error: String((e as any)?.message || e) }, 500);
  }
});

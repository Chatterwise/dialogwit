// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
/* ========= Required envs ========= */ const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!SUPABASE_URL) console.error("ENV MISSING: SUPABASE_URL");
if (!SERVICE_ROLE) console.error("ENV MISSING: SUPABASE_SERVICE_ROLE_KEY");
if (!OPENAI_API_KEY) console.error("ENV MISSING: OPENAI_API_KEY");
const supabase = createClient(SUPABASE_URL ?? "", SERVICE_ROLE ?? "");
/* ========= CORS ========= */ const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type"
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/json"
    }
  });
}
/* ========= OpenAI helpers (Assistants v2) ========= */ async function openai(path, init) {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      // REQUIRED for Assistants v2
      "OpenAI-Beta": "assistants=v2",
      ...init.headers || {}
    }
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) {
    throw new Error(`OpenAI ${path} error: ${res.status} ${JSON.stringify(data, null, 2)}`);
  }
  return data;
}
// Remove OpenAI-style citations and numeric footnotes
function stripCitations(s) {
  return s.replace(/【\d+(?::\d+)?†source】/g, "") // e.g. file citations
  .replace(/【[^】]*】/g, "") // any other 【...】
  .replace(/\s*\[\d+\]/g, "") // [1]
  .replace(/\s*\(\d+\)/g, "") // (1)
  .trim();
}
async function waitForRun(threadId, runId, timeoutMs = 20000) {
  const start = Date.now();
  while(Date.now() - start < timeoutMs){
    const run = await openai(`/threads/${threadId}/runs/${runId}`, {
      method: "GET"
    });
    const s = String(run.status ?? "");
    if (s === "completed") return "completed";
    if (s === "failed" || s === "cancelled" || s === "expired") return s;
    await new Promise((r)=>setTimeout(r, 200));
  }
  return "timeout";
}
async function getLatestAssistantText(threadId) {
  const msgs = await openai(`/threads/${threadId}/messages?limit=20`, {
    method: "GET"
  });
  const arr = msgs.data ?? [];
  for (const m of arr){
    if (m.role === "assistant" && Array.isArray(m.content)) {
      for (const c of m.content){
        if (c.type === "text" && c.text?.value) {
          return String(c.text.value);
        }
      }
    }
  }
  return null;
}
/* ========= HTTP handler ========= */ Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS
    });
  }
  try {
    const body = await req.json();
    // keep the SAME params; also accept aliases just in case
    const chatbot_id = body.chatbot_id ?? body.botId;
    const message = body.message;
    const thread_id_in = body.thread_id ?? body.threadId;
    const user_id = body.user_id ?? body.userId;
    const streamFlag = Boolean(body.stream);
    if (!chatbot_id || !message) {
      return json({
        ok: false,
        error: "chatbot_id and message are required"
      }, 400);
    }
    // Load chatbot (no status filter so we can fallback instead of 404)
    const { data: bot, error } = await supabase.from("chatbots").select("id, name, status, openai_assistant_id, fallback_message").eq("id", chatbot_id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!bot) return json({
      ok: false,
      error: "Chatbot not found"
    }, 404);
    const botName = bot.name ?? "AI assistant";
    const status = String(bot.status ?? "ready").toLowerCase();
    const assistantId = bot.openai_assistant_id ?? null;
    const fallback = bot.fallback_message && String(bot.fallback_message).trim() || "I don’t have that information yet.";
    // If bot is inactive: return fallback (don’t 404)
    if (status === "inactive") {
      if (streamFlag) {
        // Stream a trivial response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start (controller) {
            controller.enqueue(encoder.encode(`event: ready\ndata: ${JSON.stringify({
              thread_id: thread_id_in ?? null
            })}\n\n`));
            controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({
              text: fallback
            })}\n\n`));
            controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`));
            controller.close();
          }
        });
        return new Response(stream, {
          headers: {
            ...CORS,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
          }
        });
      }
      return json({
        ok: true,
        text: fallback,
        thread_id: thread_id_in
      }, 200);
    }
    if (!assistantId) {
      return json({
        ok: false,
        error: "This chatbot is not linked to an OpenAI assistant (openai_assistant_id is missing). Run your ensure-assistant step."
      }, 400);
    }
    // Ensure a thread exists
    let thread_id = thread_id_in;
    if (!thread_id) {
      const t = await openai(`/threads`, {
        method: "POST",
        body: JSON.stringify({})
      });
      thread_id = String(t.id);
    }
    // Add the user message
    await openai(`/threads/${thread_id}/messages`, {
      method: "POST",
      body: JSON.stringify({
        role: "user",
        content: [
          {
            type: "text",
            text: message
          }
        ],
        metadata: user_id ? {
          user_id
        } : undefined
      })
    });
    // Helper instructions (friendly + no hallucinations + fallback)
    const runInstructions = [
      `You are ${botName}. Be concise, friendly, and helpful.`,
      `Use only the knowledge from your linked files; do not invent details.`,
      `Keep answers short by default (3–6 sentences or a small list).`,
      `If info isn’t in your files, reply with this in the user's language: "${fallback}"`,
      `Do not include bracketed citation markers like [1] or strings like 【...】.`
    ].join("\n");
    // Run the assistant
    const run = await openai(`/threads/${thread_id}/runs`, {
      method: "POST",
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: runInstructions
      })
    });
    const finalStatus = await waitForRun(thread_id, String(run.id));
    let text = await getLatestAssistantText(thread_id);
    if (!text || finalStatus !== "completed") text = fallback;
    text = stripCitations(text);
    // Streaming mode (SSE)
    if (streamFlag) {
      const encoder = new TextEncoder();
      const chunks = (text ?? "").match(/.{1,60}/gs) ?? [
        text ?? ""
      ];
      const stream = new ReadableStream({
        start (controller) {
          // Send the thread id first so client can store it
          controller.enqueue(encoder.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id
          })}\n\n`));
          let i = 0;
          const interval = setInterval(()=>{
            if (i >= chunks.length) {
              clearInterval(interval);
              controller.enqueue(encoder.encode(`event: end\ndata: {}\n\n`));
              controller.close();
              return;
            }
            controller.enqueue(encoder.encode(`event: delta\ndata: ${JSON.stringify({
              text: chunks[i]
            })}\n\n`));
            i++;
          }, 18); // typing speed (ms per chunk)
        }
      });
      return new Response(stream, {
        headers: {
          ...CORS,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      });
    }
    // Non-stream JSON
    return json({
      ok: true,
      text,
      thread_id
    }, 200);
  } catch (e) {
    console.error("chat-file-search error:", e);
    return json({
      ok: false,
      error: String(e?.message ?? e)
    }, 500);
  }
});

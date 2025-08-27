// supabase/functions/chat-file-search/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const supabase = createClient(SUPABASE_URL ?? "", SERVICE_ROLE ?? "");
const CORS = {
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
function stripCitations(s) {
  return s.replace(/【\d+(?::\d+)?†source】/g, "").replace(/【[^】]*】/g, "").replace(/\s*\[\d+\]/g, "").replace(/\s*\(\d+\)/g, "").trim();
}
async function openai(path, init = {}) {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
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
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS
    });
  }
  try {
    const body = await req.json().catch(()=>({}));
    const chatbot_id = body.chatbot_id ?? body.botId;
    const message = body.message;
    const thread_id_in = body.thread_id ?? body.threadId;
    const user_id = body.user_id ?? body.userId;
    const wantStream = Boolean(body.stream);
    if (!chatbot_id || !message) {
      return json({
        ok: false,
        error: "chatbot_id and message are required"
      }, 400);
    }
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
    // Inactive → return quickly (with stream or without)
    if (status === "inactive") {
      if (!wantStream) {
        return json({
          ok: true,
          text: fallback,
          thread_id: thread_id_in
        }, 200);
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        start (controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id: thread_id_in ?? null
          })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            text: fallback
          })}\n\n`));
          controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
            thread_id: thread_id_in ?? null,
            text: fallback
          })}\n\n`));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          ...CORS,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no"
        }
      });
    }
    if (!assistantId) {
      return json({
        ok: false,
        error: "This chatbot is not linked to an OpenAI assistant (openai_assistant_id is missing). Run your ensure-assistant step."
      }, 400);
    }
    // Ensure thread
    let thread_id = thread_id_in ?? null;
    if (!thread_id) {
      const t = await openai(`/threads`, {
        method: "POST",
        body: JSON.stringify({})
      });
      thread_id = String(t.id);
    }
    // Add user message
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
    const runInstructions = [
      `You are ${botName}. Be concise, friendly, and helpful.`,
      `Use only the knowledge from your linked files; do not invent details.`,
      `Keep answers short by default (3–6 sentences or a small list).`,
      `If info isn’t in your files, reply with this in the user's language: "${fallback}"`,
      `Do not include bracketed citation markers like [1] or strings like 【...】.`
    ].join("\n");
    // Non-streaming path
    if (!wantStream) {
      const run = await openai(`/threads/${thread_id}/runs`, {
        method: "POST",
        body: JSON.stringify({
          assistant_id: assistantId,
          instructions: runInstructions
        })
      });
      const start = Date.now();
      while(Date.now() - start < 45000){
        const r = await openai(`/threads/${thread_id}/runs/${run.id}`, {
          method: "GET"
        });
        const s = String(r.status ?? "");
        if (s === "completed") break;
        if ([
          "failed",
          "cancelled",
          "expired"
        ].includes(s)) break;
        await new Promise((r2)=>setTimeout(r2, 350));
      }
      const msgs = await openai(`/threads/${thread_id}/messages?limit=20`, {
        method: "GET"
      });
      let text = null;
      for (const m of msgs.data ?? []){
        if (m.role === "assistant" && Array.isArray(m.content)) {
          for (const c of m.content){
            if (c.type === "text" && c.text?.value) {
              text = String(c.text.value);
              break;
            }
          }
        }
        if (text) break;
      }
      return json({
        ok: true,
        text: stripCitations(text ?? fallback),
        thread_id
      }, 200);
    }
    // Streaming path – forward only delta text and guard against double-close
    const upstream = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
        Accept: "text/event-stream"
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions: runInstructions,
        stream: true
      })
    });
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(()=>"");
      return json({
        ok: false,
        error: `OpenAI stream failed (${upstream.status})${t ? `: ${t}` : ""}`
      }, 502);
    }
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start (controller) {
        let ended = false;
        const end = (finalText = "")=>{
          if (ended) return;
          ended = true;
          controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
            thread_id,
            text: stripCitations(finalText)
          })}\n\n`));
          controller.close();
        };
        controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
        controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
          thread_id
        })}\n\n`));
        const ping = setInterval(()=>{
          if (!ended) controller.enqueue(enc.encode(`: ping\n\n`));
        }, 15000);
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let full = "";
        let lastChunk = "";
        const isDeltaEvent = (evt)=>evt === "thread.message.delta" || evt === "response.output_text.delta" || evt === "response.delta";
        const isFailureEvent = (evt)=>evt === "thread.run.failed" || evt === "response.error" || evt === "thread.run.cancelled" || evt === "thread.run.expired";
        const extractDeltaText = (payload)=>{
          if (payload?.delta?.text && typeof payload.delta.text === "string") {
            return payload.delta.text;
          }
          const content = payload?.delta?.content;
          if (Array.isArray(content)) {
            let out = "";
            for (const part of content){
              if (part?.text?.value) out += String(part.text.value);
              else if (typeof part?.text === "string") out += part.text;
            }
            if (out) return out;
          }
          if (payload?.output_text?.value && typeof payload.output_text.value === "string") {
            return payload.output_text.value;
          }
          return null;
        };
        const safeAppend = (piece)=>{
          if (!piece) return;
          if (piece === lastChunk) return;
          if (full.endsWith(piece)) return;
          lastChunk = piece;
          full += piece;
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            text: stripCitations(piece)
          })}\n\n`));
        };
        try {
          while(true){
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, {
              stream: true
            });
            let idx;
            while((idx = buf.indexOf("\n\n")) !== -1){
              const frame = buf.slice(0, idx);
              buf = buf.slice(idx + 2);
              let evt = "";
              let dataStr = "";
              for (const line of frame.split("\n")){
                if (line.startsWith("event:")) evt = line.slice(6).trim();
                if (line.startsWith("data:")) dataStr += line.slice(5);
              }
              if (!evt) continue;
              if (evt === "error" || isFailureEvent(evt)) {
                clearInterval(ping);
                end(full);
                return;
              }
              if (isDeltaEvent(evt)) {
                try {
                  const obj = dataStr ? JSON.parse(dataStr) : null;
                  const piece = extractDeltaText(obj);
                  if (piece) safeAppend(piece);
                } catch  {
                // ignore malformed frames
                }
                continue;
              }
              if (evt === "thread.run.completed" || evt === "response.completed" || evt === "done") {
                clearInterval(ping);
                end(full);
                return;
              }
            }
          }
        } catch  {
          clearInterval(ping);
          end(full);
        } finally{
          clearInterval(ping);
          end(full);
        }
      }
    });
    return new Response(stream, {
      headers: {
        ...CORS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (e) {
    return json({
      ok: false,
      error: String(e?.message ?? e)
    }, 500);
  }
});

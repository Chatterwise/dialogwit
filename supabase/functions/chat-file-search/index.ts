// supabase/functions/chat-file-search/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const db = createClient(SUPABASE_URL, SERVICE_ROLE);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info"
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
function sse(stream) {
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
function stripCitations(s) {
  return s.replace(/【\d+(?::\d+)?†source】/g, "").replace(/【[^】]*】/g, "").replace(/\s*\[\d+\]/g, "").replace(/\s*\(\d+\)/g, "").trim();
}
async function openai(path, init) {
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
    throw new Error(`OpenAI ${path} error: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}
const botCache = new Map();
function cacheGet(id) {
  const hit = botCache.get(id);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    botCache.delete(id);
    return null;
  }
  return hit.data;
}
function cacheSet(id, data, ttlMs = 30_000) {
  botCache.set(id, {
    data,
    exp: Date.now() + ttlMs
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: CORS
  });
  try {
    const body = await req.json().catch(()=>({}));
    const chatbot_id = body.chatbot_id ?? body.botId;
    const message = body.message;
    const thread_id_in = body.thread_id ?? body.threadId ?? null; // Assistants only
    const user_id = body.user_id ?? body.userId ?? null;
    const wantStream = Boolean(body.stream);
    if (!chatbot_id || !message) {
      return json({
        ok: false,
        error: "chatbot_id and message are required"
      }, 400);
    }
    let bot = cacheGet(chatbot_id);
    if (!bot) {
      const { data, error } = await db.from("chatbots").select("id,name,status,openai_assistant_id,openai_vector_store_id,fallback_message").eq("id", chatbot_id).maybeSingle();
      if (error) throw error;
      if (!data) return json({
        ok: false,
        error: "Chatbot not found"
      }, 404);
      bot = data;
      cacheSet(chatbot_id, bot);
    }
    const botName = bot.name ?? "AI assistant";
    const status = String(bot.status ?? "ready").toLowerCase();
    let assistantId = bot.openai_assistant_id ?? null;
    const vectorStoreId = bot.openai_vector_store_id ?? null;
    const fallback = (bot.fallback_message?.trim() || "I don’t have that information yet.").replace(/\s+/g, " ");
    if (status === "inactive") {
      if (!wantStream) return json({
        ok: true,
        text: fallback,
        thread_id: thread_id_in
      }, 200);
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        start (controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id: thread_id_in
          })}\n\n`));
          controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
            text: fallback
          })}\n\n`));
          controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
            thread_id: thread_id_in,
            text: fallback
          })}\n\n`));
          controller.close();
        }
      });
      return sse(stream);
    }
    const systemForFiles = `Answer briefly using only the bot’s files. ` + `If the info isn’t in the files, reply exactly: "${fallback}". ` + `Write in the user's language. Do not include citation markers.`;
    const systemNoTools = `Be concise and friendly. If the info is unknown, reply exactly: "${fallback}". ` + `Write in the user's language. Do not include citation markers.`;
    async function responsesFast() {
      const payload = {
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: systemForFiles
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: String(message)
              }
            ]
          }
        ],
        tools: [
          {
            type: "file_search"
          }
        ],
        tool_resources: {
          file_search: {
            vector_store_ids: [
              vectorStoreId
            ]
          }
        },
        response_format: {
          type: "text"
        },
        temperature: 0.2,
        max_output_tokens: 600
      };
      if (!wantStream) {
        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data?.error?.message || `Responses error ${res.status}`);
        const text = data?.output_text ?? (Array.isArray(data?.output) ? data.output.map((o)=>(o?.content || []).map((c)=>c?.text?.value || "").join("")).join("") : "") ?? "";
        return json({
          ok: true,
          text: stripCitations(String(text || fallback)),
          thread_id: thread_id_in
        }, 200);
      }
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
          Accept: "text/event-stream"
        },
        body: JSON.stringify({
          ...payload,
          stream: true
        })
      });
      if (!upstream.ok || !upstream.body) {
        const t = await upstream.text().catch(()=>"");
        throw new Error(`Responses stream failed (${upstream.status})${t ? `: ${t}` : ""}`);
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start (controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id: thread_id_in
          })}\n\n`));
          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;
          const push = (piece)=>{
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
              text: stripCitations(piece)
            })}\n\n`));
          };
          const end = ()=>{
            if (ended) return;
            ended = true;
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
              thread_id: thread_id_in,
              text: stripCitations(full)
            })}\n\n`));
            controller.close();
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
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (evt === "response.output_text.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece = typeof obj?.delta === "string" ? obj.delta : Array.isArray(obj?.delta) ? obj.delta.join("") : "";
                    if (piece) push(String(piece));
                  } catch  {}
                } else if (evt === "response.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const items = obj?.delta?.content;
                    if (Array.isArray(items)) {
                      let text = "";
                      for (const it of items){
                        if (it?.type === "output_text.delta" && typeof it?.text === "string") {
                          text += it.text;
                        }
                      }
                      if (text) push(text);
                    }
                  } catch  {}
                } else if (evt === "response.completed" || evt === "done") {
                  end();
                  return;
                }
              }
            }
          } catch  {} finally{
            end();
          }
        }
      });
      return sse(stream);
    }
    async function ensureAssistantId() {
      const instructions = [
        `You are ${botName}. Use File Search when available.`,
        `If the answer isn’t present in the files, respond with: "${fallback}".`,
        `Keep answers clear and concise. Write in the user's language.`,
        `Do NOT include citation markers.`
      ].join("\n");
      const payload = {
        name: botName,
        model: "gpt-4o-mini",
        instructions,
        tools: vectorStoreId ? [
          {
            type: "file_search"
          }
        ] : [],
        metadata: {
          chatbot_id
        }
      };
      if (vectorStoreId) {
        payload.tool_resources = {
          file_search: {
            vector_store_ids: [
              vectorStoreId
            ]
          }
        };
      }
      const created = await openai("/assistants", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const newId = String(created.id);
      await db.from("chatbots").update({
        openai_assistant_id: newId
      }).eq("id", chatbot_id);
      // update local and cache
      assistantId = newId;
      const cached = cacheGet(chatbot_id) || {};
      cacheSet(chatbot_id, {
        ...cached,
        openai_assistant_id: newId
      }, 30_000);
      return newId;
    }
    async function assistantsPath() {
      if (!assistantId) {
        try {
          await ensureAssistantId();
        } catch  {
          // As a last resort, use Responses without tools (no assistant required)
          return responsesNoTools();
        }
      }
      let thread_id = thread_id_in;
      if (!thread_id) {
        const t = await openai(`/threads`, {
          method: "POST",
          body: JSON.stringify({})
        });
        thread_id = String(t.id);
      }
      await openai(`/threads/${thread_id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          content: [
            {
              type: "text",
              text: String(message)
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
        `Do not include citation markers like [1] or strings like 【...】.`
      ].join("\n");
      if (!wantStream) {
        const run = await openai(`/threads/${thread_id}/runs`, {
          method: "POST",
          body: JSON.stringify({
            assistant_id: assistantId,
            instructions: runInstructions
          })
        });
        const start = Date.now();
        while(Date.now() - start < 45_000){
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
        // If streaming fails, degrade to non-stream JSON via Responses (no tools) to avoid user error
        return responsesNoTools();
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start (controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id
          })}\n\n`));
          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;
          const push = (piece)=>{
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
              text: stripCitations(piece)
            })}\n\n`));
          };
          const end = ()=>{
            if (ended) return;
            ended = true;
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
              thread_id,
              text: stripCitations(full)
            })}\n\n`));
            controller.close();
          };
          const isDelta = (evt)=>evt === "thread.message.delta" || evt === "response.output_text.delta" || evt === "response.delta";
          const extract = (payload)=>{
            if (payload?.delta?.text && typeof payload.delta.text === "string") return payload.delta.text;
            const content = payload?.delta?.content;
            if (Array.isArray(content)) {
              let out = "";
              for (const part of content){
                if (part?.text?.value) out += String(part.text.value);
                else if (typeof part?.text === "string") out += part.text;
              }
              if (out) return out;
            }
            if (payload?.output_text?.value && typeof payload.output_text.value === "string") return payload.output_text.value;
            return null;
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
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (isDelta(evt)) {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece = extract(obj);
                    if (piece) push(piece);
                  } catch  {}
                  continue;
                }
                if (evt === "thread.run.completed" || evt === "response.completed" || evt === "done") {
                  end();
                  return;
                }
              }
            }
          } catch  {} finally{
            end();
          }
        }
      });
      return sse(stream);
    }
    async function responsesNoTools() {
      const payload = {
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: systemNoTools
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: String(message)
              }
            ]
          }
        ],
        response_format: {
          type: "text"
        },
        temperature: 0.2,
        max_output_tokens: 600
      };
      if (!wantStream) {
        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>({}));
        const text = data?.output_text ?? (Array.isArray(data?.output) ? data.output.map((o)=>(o?.content || []).map((c)=>c?.text?.value || "").join("")).join("") : "") ?? "";
        return json({
          ok: true,
          text: stripCitations(String(text || fallback)),
          thread_id: thread_id_in
        }, 200);
      }
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
          Accept: "text/event-stream"
        },
        body: JSON.stringify({
          ...payload,
          stream: true
        })
      });
      if (!upstream.ok || !upstream.body) {
        // final fallback: stream just the fallback text
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          start (controller) {
            controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
            controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
              thread_id: thread_id_in
            })}\n\n`));
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
              text: fallback
            })}\n\n`));
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
              thread_id: thread_id_in,
              text: fallback
            })}\n\n`));
            controller.close();
          }
        });
        return sse(stream);
      }
      const enc = new TextEncoder();
      const stream = new ReadableStream({
        async start (controller) {
          controller.enqueue(enc.encode(`:${" ".repeat(2048)}\n\n`));
          controller.enqueue(enc.encode(`event: ready\ndata: ${JSON.stringify({
            thread_id: thread_id_in
          })}\n\n`));
          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          let buf = "";
          let full = "";
          let last = "";
          let ended = false;
          const push = (piece)=>{
            if (!piece || piece === last || full.endsWith(piece)) return;
            last = piece;
            full += piece;
            controller.enqueue(enc.encode(`event: delta\ndata: ${JSON.stringify({
              text: stripCitations(piece)
            })}\n\n`));
          };
          const end = ()=>{
            if (ended) return;
            ended = true;
            controller.enqueue(enc.encode(`event: end\ndata: ${JSON.stringify({
              thread_id: thread_id_in,
              text: stripCitations(full)
            })}\n\n`));
            controller.close();
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
                  if (line.startsWith("data:")) dataStr += line.slice(5) + "\n";
                }
                if (!evt) continue;
                if (evt === "response.output_text.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const piece = typeof obj?.delta === "string" ? obj.delta : Array.isArray(obj?.delta) ? obj.delta.join("") : "";
                    if (piece) push(String(piece));
                  } catch  {}
                } else if (evt === "response.delta") {
                  try {
                    const obj = dataStr ? JSON.parse(dataStr) : null;
                    const items = obj?.delta?.content;
                    if (Array.isArray(items)) {
                      let text = "";
                      for (const it of items){
                        if (it?.type === "output_text.delta" && typeof it?.text === "string") {
                          text += it.text;
                        }
                      }
                      if (text) push(text);
                    }
                  } catch  {}
                } else if (evt === "response.completed" || evt === "done") {
                  end();
                  return;
                }
              }
            }
          } catch  {} finally{
            end();
          }
        }
      });
      return sse(stream);
    }
    // Route selection:
    if (vectorStoreId) {
      try {
        return await responsesFast();
      } catch  {
        // If Responses fails, create assistant if needed and use Assistants
        return await assistantsPath();
      }
    } else {
      // No vector store: prefer Assistants if already linked, else use Responses without tools
      if (assistantId) return await assistantsPath();
      return await responsesNoTools();
    }
  } catch (e) {
    return json({
      ok: false,
      error: String(e?.message || e)
    }, 500);
  }
});

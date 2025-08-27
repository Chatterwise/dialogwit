// supabase/functions/ensure-assistant/index.ts
// deno-lint-ignore-file no-explicit-any
import { createClient } from "jsr:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_SERVICE_ROLE_KEY ?? "");
async function openai(path, init = {}) {
  const url = `https://api.openai.com/v1${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      ...init.headers || {}
    }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI ${path} ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
  try {
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({
        ok: false,
        error: "Missing required env vars"
      }, 500);
    }
    const { chatbot_id } = await req.json().catch(()=>({}));
    if (!chatbot_id) return json({
      ok: false,
      error: "Missing chatbot_id"
    }, 400);
    const { data: bot, error } = await supabase.from("chatbots").select("id, name, description, openai_assistant_id, openai_vector_store_id, fallback_message").eq("id", chatbot_id).single();
    if (error || !bot) return json({
      ok: false,
      error: "Chatbot not found"
    }, 404);
    const fallback = (bot.fallback_message?.trim() || "I don’t have that information yet.").replace(/\s+/g, " ");
    const shortInstructions = `Answer briefly using only the bot’s files. If not found, reply exactly: "${fallback}". Write in the user's language. Do not output citation markers.`;
    const basePayload = {
      name: bot.name || "Assistant",
      model: "gpt-4o-mini",
      instructions: shortInstructions,
      tools: [
        {
          type: "file_search"
        }
      ],
      response_format: {
        type: "text"
      },
      temperature: 0.2,
      max_output_tokens: 600,
      truncation_strategy: {
        type: "last_messages",
        last_messages: 8
      },
      metadata: {
        chatbot_id: bot.id
      }
    };
    if (bot.openai_vector_store_id) {
      basePayload.tool_resources = {
        file_search: {
          vector_store_ids: [
            bot.openai_vector_store_id
          ]
        }
      };
    }
    let assistantId = bot.openai_assistant_id;
    if (assistantId) {
      try {
        await openai(`/assistants/${assistantId}`, {
          method: "POST",
          body: JSON.stringify(basePayload)
        });
      } catch  {
        const created = await openai("/assistants", {
          method: "POST",
          body: JSON.stringify(basePayload)
        });
        assistantId = created.id;
      }
    } else {
      const created = await openai("/assistants", {
        method: "POST",
        body: JSON.stringify(basePayload)
      });
      assistantId = created.id;
    }
    if (!assistantId) return json({
      ok: false,
      error: "Failed to provision assistant"
    }, 500);
    const { error: upErr } = await supabase.from("chatbots").update({
      openai_assistant_id: assistantId
    }).eq("id", bot.id);
    if (upErr) return json({
      ok: false,
      error: upErr.message
    }, 500);
    return json({
      ok: true,
      assistant_id: assistantId,
      linked_vector_store: !!bot.openai_vector_store_id,
      model: "gpt-4o-mini",
      response_format: "text",
      temperature: 0.2,
      max_output_tokens: 600,
      truncation_last_messages: 8
    });
  } catch (e) {
    return json({
      ok: false,
      error: String(e?.message || e)
    }, 500);
  }
});

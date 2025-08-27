// Deno/Supabase Edge Function: remove a KB file from the bot's vector store
import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai@4.56.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: cors
    });
  }
  try {
    const { knowledge_base_id } = await req.json();
    if (!knowledge_base_id) throw new Error("knowledge_base_id is required");
    const { data: kb, error: kbErr } = await supabase.from("knowledge_base").select("id, chatbot_id, openai_file_id").eq("id", knowledge_base_id).single();
    if (kbErr || !kb) throw new Error("KB not found");
    const { data: bot, error: botErr } = await supabase.from("chatbots").select("openai_vector_store_id").eq("id", kb.chatbot_id).single();
    if (botErr || !bot) throw new Error("Bot not found");
    if (bot.openai_vector_store_id && kb.openai_file_id) {
      await openai.beta.vectorStores.files.del(bot.openai_vector_store_id, kb.openai_file_id);
    }
    await supabase.from("knowledge_base").update({
      openai_file_id: null,
      processed: false,
      status: "removed"
    }).eq("id", knowledge_base_id);
    return new Response(JSON.stringify({
      ok: true
    }), {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("remove-kb-from-openai error:", e);
    return new Response(JSON.stringify({
      ok: false,
      error: String(e?.message || e)
    }), {
      status: 500,
      headers: {
        ...cors,
        "Content-Type": "application/json"
      }
    });
  }
});

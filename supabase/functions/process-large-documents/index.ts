// Edge Function with Retry Logic (Phase 4)
import { createClient } from "supabase";
import { OpenAI } from "openai";
import pdfParse from "npm:pdf-parse";
import mammoth from "npm:mammoth";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const { knowledge_base_id } = await req.json();
    const { data: kb, error } = await supabase.from("knowledge_base").select("*").eq("id", knowledge_base_id).single();
    if (error || !kb?.file_path) throw new Error("Missing KB entry or file path");
    const { data: fileRes, error: downloadError } = await supabase.storage.from("knowledge-files").download(kb.file_path);
    if (downloadError || !fileRes) throw new Error("File download failed");
    const buffer = await fileRes.arrayBuffer();
    const type = kb.filename?.split(".").pop()?.toLowerCase();
    let fileText = "";
    const uint8Array = new Uint8Array(buffer);
    if (type === "pdf") {
      fileText = (await pdfParse(uint8Array)).text;
    } else if (type === "docx") {
      fileText = (await mammoth.extractRawText({
        buffer: uint8Array
      })).value;
    } else {
      fileText = new TextDecoder().decode(buffer); // fallback to plain text
    }
    if (!fileText.trim()) throw new Error("No text extracted from file");
    const cleanText = fileText.replace(/\u0000/g, "");
    const chunks = chunkByWords(cleanText, 300, 0.5);
    const expectedLength = 1536;
    const embeddings = await Promise.all(chunks.map(async (chunk, i)=>{
      try {
        const res = await retryWithBackoff(()=>openai.embeddings.create({
            input: chunk,
            model: "text-embedding-ada-002"
          }));
        const vector = res.data[0].embedding;
        if (vector.length !== expectedLength) throw new Error(`Invalid vector at chunk ${i}`);
        return vector;
      } catch (e) {
        console.error(`❌ Failed to embed chunk ${i}:`, e);
        throw new Error(`Embedding failed at chunk ${i}`);
      }
    }));
    const inserts = chunks.map((chunk, i)=>({
        id: crypto.randomUUID(),
        chatbot_id: kb.chatbot_id,
        knowledge_base_id: kb.id,
        content: chunk,
        embedding: embeddings[i],
        chunk_index: i,
        source_url: kb.filename ?? null,
        metadata: {},
        created_at: new Date().toISOString()
      }));
    const { error: insertError } = await supabase.from("kb_chunks").insert(inserts);
    if (insertError) throw new Error("Chunk insert failed");
    await supabase.from("knowledge_base").update({
      processed: true,
      status: "processed",
      error_message: null
    }).eq("id", kb.id);
    return new Response("✅ File processed", {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error("❌ Parse Error:", error);
    const id = await req.json().then((b)=>b.knowledge_base_id).catch(()=>null);
    if (id) {
      await supabase.from("knowledge_base").update({
        processed: false,
        status: "error",
        error_message: error?.message ?? "Unknown error"
      }).eq("id", id);
    }
    return new Response("Error processing file", {
      status: 500,
      headers: corsHeaders
    });
  }
});
function chunkByWords(text, maxWords, overlap = 0) {
  const words = text.split(/\s+/);
  const chunks = [];
  let i = 0;
  const step = Math.floor(maxWords * (1 - overlap));
  while(i < words.length){
    const chunk = words.slice(i, i + maxWords).join(' ');
    chunks.push(chunk);
    i += step;
  }
  return chunks;
}
async function retryWithBackoff(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((res)=>setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

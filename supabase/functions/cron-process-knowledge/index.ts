// cron-process-knowledge/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";
import { OpenAI } from "openai";
import pdfParse from "npm:pdf-parse";
import mammoth from "npm:mammoth";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

Deno.serve(async () => {
  const { data: kbList, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("processed", false)
    .eq("status", "pending")
    .not("file_path", "is", null)
    .limit(5); // avoid overload

  if (error || !kbList?.length) {
    console.log("✅ No pending KBs to process.");
    return new Response("No work to do", { status: 200 });
  }

  for (const kb of kbList) {
    try {
      const { data: fileRes, error: downloadError } = await supabase.storage
        .from("knowledge-files")
        .download(kb.file_path);

      if (downloadError || !fileRes) throw new Error("File download failed");

      const buffer = await fileRes.arrayBuffer();
      const extension = kb.filename?.split(".").pop()?.toLowerCase();
      let text = "";

      if (extension === "pdf") {
        text = (await pdfParse(Buffer.from(buffer))).text;
      } else if (extension === "docx") {
        text = (await mammoth.extractRawText({ buffer: Buffer.from(buffer) })).value;
      } else {
        text = new TextDecoder().decode(buffer);
      }

      if (!text.trim()) throw new Error("No text extracted");

      const cleanText = text.replace(/\u0000/g, "");
      const chunks = chunkByWords(cleanText, 150); // smaller for better RAG
      const expectedLength = 1536;

      const embeddings = await Promise.all(
        chunks.map(async (chunk) => {
          const res = await openai.embeddings.create({
            input: chunk,
            model: "text-embedding-ada-002",
          });
          const vector = res.data[0].embedding;
          if (vector.length !== expectedLength) throw new Error("Invalid vector");
          return vector;
        })
      );

      const inserts = chunks.map((chunk, i) => ({
        id: crypto.randomUUID(),
        chatbot_id: kb.chatbot_id,
        knowledge_base_id: kb.id,
        content: chunk,
        embedding: embeddings[i],
        chunk_index: i,
        source_url: kb.filename ?? null,
        metadata: {},
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("kb_chunks")
        .insert(inserts);

      if (insertError) throw new Error("Chunk insert failed");

      await supabase.from("knowledge_base")
        .update({ processed: true, status: "processed", error_message: null })
        .eq("id", kb.id);

      console.log(`✅ Processed ${kb.filename}`);
    } catch (err) {
      console.error("❌ Cron KB error:", err);
      await supabase.from("knowledge_base")
        .update({ processed: false, status: "error", error_message: err?.message })
        .eq("id", kb.id);
    }
  }

  return new Response("Done", { status: 200 });
});

function chunkByWords(text: string, maxWords: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}
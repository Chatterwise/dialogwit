import { useState } from "react";
import { supabase } from "../lib/supabase";

export function UploadTrainingFile({ chatbotId }: { chatbotId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !chatbotId) return;
    setUploading(true);

    try {
      const path = `${chatbotId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("knowledge-files")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data, error: insertError } = await supabase
        .from("knowledge_base")
        .insert({
          chatbot_id: chatbotId,
          filename: file.name,
          file_path: path,
          content_type: "document",
          processed: false,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      alert("📤 File uploaded and metadata inserted!");
    } catch (e: any) {
      alert(`❌ Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        disabled={!file || uploading}
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </div>
  );
}

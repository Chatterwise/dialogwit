import { useState } from "react";
import { supabase } from "../lib/supabase";

export function UploadDocument({
  chatbotId,
  onUpload,
}: {
  chatbotId: string;
  onUpload: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const path = `${chatbotId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("knowledge-files")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("knowledge_base")
        .insert({
          chatbot_id: chatbotId,
          content_type: "document",
          filename: file.name,
          file_path: path,
          processed: false,
          status: "pending",
          content: "TESTING",
        });

      if (insertError) throw insertError;

      alert("✅ File uploaded and ready for processing.");
      onUpload();
    } catch (err: any) {
      alert("❌ " + err.message);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </button>
    </div>
  );
}

// ---------- Upload / files ----------
export type UploadStatus = "pending" | "processing" | "completed" | "error";

export interface ProcessedFile {
  file: File;
  id: string;        // stable UI key
  name: string;      // file.name
  size: number;      // file.size
  type: string;      // MIME type
  status: UploadStatus;
  error?: string;
}

// ---------- Knowledge base ----------
export type KnowledgeContentType = "document" | "text"; // UI now uses only "document"

export interface KnowledgeItem {
  id: string;
  chatbot_id: string;
  content: string | null;
  content_type: KnowledgeContentType;
  filename: string | null;
  file_path?: string | null;
  processed: boolean;
  status?: UploadStatus | null;
  created_at: string;
  updated_at?: string | null;
  source_url?: string | null;
}

// ---------- Chatbot UI bits ----------
export interface ChatbotSettings {
  name?: string | null;
  welcome_message?: string | null;
  placeholder?: string | null;
  bot_avatar?: string | null;
}

// ---------- Component props ----------
export interface FileUploadProps {
  // Returns ONLY the new batch of files chosen in the last interaction
  onFilesSelected: (files: ProcessedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number;         // MB
  acceptedTypes?: readonly string[]; // MIME list
  allowMultiple?: boolean;
}

export interface KnowledgeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    content: string;
    contentType: KnowledgeContentType;
    filename: string;
  }) => Promise<void>;
  editingItem?: KnowledgeItem | null;
  isProcessing?: boolean;
  chatbotId: string;
}
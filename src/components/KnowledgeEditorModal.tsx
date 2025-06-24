import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Upload,
  Check,
  Loader,
  Edit,
  Save,
} from "lucide-react";
import { FileUpload } from "./FileUpload";

interface ProcessedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

interface KnowledgeItem {
  id: string;
  content: string;
  content_type: "text" | "document";
  filename: string | null;
  processed: boolean;
  created_at: string;
}

interface KnowledgeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    content: string;
    contentType: "text" | "document";
    filename: string;
  }) => Promise<void>;
  editingItem?: KnowledgeItem | null;
  isProcessing?: boolean;
}

export const KnowledgeEditorModal: React.FC<KnowledgeEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
  isProcessing = false,
}) => {
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState<"text" | "document">("text");
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset state when modal opens or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setContentType(editingItem.content_type);
        setContent(editingItem.content);
        setFilename(editingItem.filename || "");
        setStep(2); // Skip content type selection when editing
      } else {
        setContentType("text");
        setContent("");
        setFilename("");
        setFiles([]);
        setStep(1);
      }
    }
  }, [isOpen, editingItem]);

  const handleNext = () => {
    setStep(Math.min(step + 1, 3));
  };

  const handleBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (contentType === "document" && files.length > 0 && files[0].content) {
        await onSave({
          content: files[0].content,
          contentType,
          filename: files[0].name,
        });
      } else {
        await onSave({
          content,
          contentType,
          filename,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving knowledge:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleFilesSelected = (selectedFiles: ProcessedFile[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0 && selectedFiles[0].content) {
      setContent(selectedFiles[0].content || "");
      setFilename(selectedFiles[0].name);
    }
  };

  if (!isOpen) return null;

  const isEdit = !!editingItem;
  const modalTitle = isEdit ? "Edit Knowledge Item" : "Add Knowledge";

  return (
    <div className="fixed inset-0 bg-gray-800/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            {isEdit ? (
              <Edit className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
            ) : (
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {modalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        {!isEdit && (
          <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  1
                </div>
                <div
                  className={`h-1 w-12 mx-2 ${
                    step >= 2
                      ? "bg-primary-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  2
                </div>
                <div
                  className={`h-1 w-12 mx-2 ${
                    step >= 3
                      ? "bg-primary-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 3
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  3
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {step} of 3
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Content Type Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Select Content Type
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setContentType("text")}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      contentType === "text"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mr-4">
                        <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Text Content
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add text directly
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Paste text content directly into the editor. Ideal for
                      FAQs, product descriptions, or any text-based knowledge.
                    </p>
                  </button>

                  <button
                    onClick={() => setContentType("document")}
                    className={`p-6 border-2 rounded-xl text-left transition-all ${
                      contentType === "document"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-200 dark:ring-primary-800"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full mr-4">
                        <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Document
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload a file
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Upload documents like PDFs, Word files, or text files.
                      We'll extract and process the content automatically.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Content Input */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {contentType === "text"
                    ? "Enter Text Content"
                    : "Upload Document"}
                </h4>

                {contentType === "text" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                        placeholder="e.g., Product FAQs"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                        placeholder="Enter your knowledge base content here..."
                      />
                    </div>
                  </div>
                ) : (
                  <FileUpload onFilesSelected={handleFilesSelected} />
                )}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Review & Confirm
                </h4>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Summary
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-32 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Content Type:
                        </div>
                        <div className="flex-1 text-sm text-gray-900 dark:text-white capitalize">
                          {contentType}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-32 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Title:
                        </div>
                        <div className="flex-1 text-sm text-gray-900 dark:text-white">
                          {filename || "(No title)"}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-32 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Content:
                        </div>
                        <div className="flex-1 text-sm text-gray-900 dark:text-white">
                          {content ? (
                            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                              {content.substring(0, 500)}
                              {content.length > 500 && "..."}
                            </div>
                          ) : (
                            "(No content)"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full mr-4">
                        <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Ready to Add
                        </h5>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          This content will be processed and added to your
                          chatbot's knowledge base. The chatbot will be able to
                          use this information to answer user questions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gradient-to-r from-white via-primary-50 to-accent-50 dark:from-gray-900/40 dark:via-primary-900/20 dark:to-accent-900/20 rounded-b-2xl">
          {isEdit || step > 1 ? (
            <button
              onClick={isEdit ? onClose : handleBack}
              className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {isEdit ? (
                "Cancel"
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2 inline" /> Back
                </>
              )}
            </button>
          ) : (
            <div></div> // Empty div to maintain layout
          )}

          <button
            onClick={isEdit || step === 3 ? handleSave : handleNext}
            disabled={
              (step === 2 &&
                ((contentType === "text" && !content.trim()) ||
                  (contentType === "document" && files.length === 0))) ||
              saving ||
              isProcessing
            }
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            {saving || isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {isProcessing ? "Processing..." : "Saving..."}
              </>
            ) : isEdit ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : step === 3 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Add to Knowledge Base
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

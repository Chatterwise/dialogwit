import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Check,
  Loader,
  Edit,
  Trash2,
  File as FileIcon,
} from "lucide-react";
import { FileUpload } from "./FileUpload";
import { supabase } from "../lib/supabase";
import { useToast } from "../lib/toastStore";
import { KnowledgeItem } from "./utils/types";

interface ProcessedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
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
  chatbotId: string;
}

/**
 * This version:
 * - Removes "text" content entirely (documents only).
 * - Allows selecting & uploading multiple documents at once.
 * - Shows per-file status during upload (pending → processing → completed/error).
 * - Keeps the 2-step flow: (1) Upload documents, (2) Review & Confirm.
 */
export const KnowledgeEditorModal: React.FC<KnowledgeEditorModalProps> = ({
  isOpen,
  onClose,
  editingItem = null,
  isProcessing = false,
  chatbotId,
}) => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Reset state when modal opens or editing item changes
  useEffect(() => {
    if (!isOpen) return;

    // Document-only flow
    setStep(1);
    setFiles([]);

    // If you ever support "editing" for documents (e.g. renaming metadata),
    // you can prefill here. For now, uploading new docs is the only flow.
  }, [isOpen, editingItem]);

  const handleNext = () => {
    setStep(Math.min(step + 1, 2));
  };

  const handleBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleFilesSelected = (selectedFiles: ProcessedFile[]) => {
    // Merge new selections with existing, dedupe by name+size if needed
    const existingKeys = new Set(files.map((f) => `${f.name}__${f.size}`));
    const merged = [
      ...files,
      ...selectedFiles.filter((f) => !existingKeys.has(`${f.name}__${f.size}`)),
    ];
    setFiles(merged);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const humanSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const handleSave = async () => {
    if (files.length === 0) return;

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload sequentially to reflect per-file status changes
      for (let i = 0; i < files.length; i++) {
        const f = files[i];

        // Mark as processing
        setFiles((prev) =>
          prev.map((pf) =>
            pf.id === f.id
              ? { ...pf, status: "processing", error: undefined }
              : pf
          )
        );

        try {
          const path = `${chatbotId}/${Date.now()}_${f.name}`;

          // 1) Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("knowledge-files")
            .upload(path, f.file);

          if (uploadError) throw uploadError;

          // 2) Insert knowledge_base row
          const { error: insertError } = await supabase
            .from("knowledge_base")
            .insert({
              chatbot_id: chatbotId,
              content_type: "document",
              filename: f.name,
              file_path: path,
              processed: false,
              status: "pending",
              content: f.name, // placeholder if you want (or "")
            });

          if (insertError) throw insertError;

          // Mark as completed
          setFiles((prev) =>
            prev.map((pf) =>
              pf.id === f.id ? { ...pf, status: "completed" } : pf
            )
          );
          successCount++;
        } catch (err: unknown) {
          // Mark as error
          let errorMessage = "Unknown error";
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === "string") {
            errorMessage = err;
          }
          setFiles((prev) =>
            prev.map((pf) =>
              pf.id === f.id
                ? { ...pf, status: "error", error: errorMessage }
                : pf
            )
          );
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(
          `${successCount} file${
            successCount > 1 ? "s" : ""
          } uploaded and queued for processing`
        );
        onClose();
      } else if (successCount === 0) {
        toast.error("All uploads failed. Please check errors and try again.");
      } else {
        toast.info(
          `${successCount} succeeded, ${errorCount} failed. You can retry the failed ones.`
        );
      }
    } catch (e) {
      console.error("Error saving knowledge:", e);
      toast.error(`Error saving knowledge: ${e}`);
    } finally {
      setSaving(false);
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
              <Upload className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
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

        {/* Progress Steps (2 steps now) */}
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
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {step} of 2
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Upload Documents (multiple) */}
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
                  Upload Documents
                </h4>

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  allowMultiple
                />

                {/* Selected file list */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {files.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/40"
                      >
                        <div className="flex items-center min-w-0">
                          <FileIcon className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {f.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {humanSize(f.size)} • {f.type || "unknown"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {f.status === "pending" && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              Pending
                            </span>
                          )}
                          {f.status === "processing" && (
                            <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                              Uploading...
                            </span>
                          )}
                          {f.status === "completed" && (
                            <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                              <Check className="h-3 w-3 mr-1" />
                              Uploaded
                            </span>
                          )}
                          {f.status === "error" && (
                            <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                              Error
                            </span>
                          )}
                          <button
                            onClick={() => removeFile(f.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                            title="Remove"
                            disabled={
                              saving ||
                              isProcessing ||
                              f.status === "processing"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Review */}
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
                  Review & Confirm
                </h4>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Summary
                    </h5>
                    {files.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        No files selected.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {files.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate text-gray-900 dark:text-white">
                              {f.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-3">
                              {humanSize(f.size)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
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
                          Your documents will be uploaded and queued for
                          processing. The chatbot will use their content in
                          answers once processed.
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
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              disabled={saving || isProcessing}
            >
              <ChevronLeft className="h-4 w-4 mr-2 inline" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={step === 2 ? handleSave : handleNext}
            disabled={
              (step === 1 && files.length === 0) ||
              saving ||
              isProcessing ||
              files.some((f) => f.status === "processing")
            }
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 border border-transparent rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            {saving || isProcessing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                {isProcessing ? "Processing..." : "Saving..."}
              </>
            ) : step === 2 ? (
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

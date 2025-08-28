import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import {
  useKnowledgeBase,
  useDeleteKnowledgeBase,
} from "../hooks/useKnowledgeBase";
import { ChatbotSelector } from "./ChatbotSelector";
import { KnowledgeEditorModal } from "./KnowledgeEditorModal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import BotKnowledgeContent from "./BotKnowledgeContent";
import { useProcessLargeDocument } from "../hooks/useProcessLargeDocument";
import { KnowledgeItem } from "./utils/types";
import { useTranslation } from "../hooks/useTranslation";

export const KnowledgeBase = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: chatbots = [] } = useChatbots(user?.id || "");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "document">(
    "all"
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressLabel, setProgressLabel] = useState<string>("");
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [viewingItem, setViewingItem] = useState<KnowledgeItem | null>(null);

  const { mutate } = useProcessLargeDocument(selectedChatbot);
  const {
    data: knowledgeBase = [],
    isLoading,
    refetch: refetchKnowledgeBase,
  } = useKnowledgeBase(selectedChatbot);

  const deleteKnowledgeBase = useDeleteKnowledgeBase();

  const createKnowledgeItem = (chatbotId: string) => {
    return async ({
      content,
      contentType,
      filename,
    }: {
      content: string;
      contentType: "text" | "document";
      filename: string;
    }) => {
      if (!chatbotId)
        throw new Error(
          t("knowledgeBase.errors.chatbotIdMissing", "Chatbot ID is missing.")
        );

      if (contentType === "document") {
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;

        if (!fileInput?.files?.length) {
          throw new Error(
            t(
              "knowledgeBase.errors.noFileSelected",
              "No file selected for upload."
            )
          );
        }

        const file = fileInput.files[0];
        const filePath = `kb/${chatbotId}/${crypto.randomUUID()}-${filename}`;

        // 1) Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from("knowledge-files")
          .upload(filePath, file, { upsert: true });

        if (uploadError)
          throw new Error(
            t(
              "knowledgeBase.errors.uploadFailed",
              "Upload failed: {{message}}",
              {
                message: uploadError.message,
              }
            )
          );

        // 2) Insert KB row
        const { data: kb, error: insertError } = await supabase
          .from("knowledge_base")
          .insert({
            chatbot_id: chatbotId,
            content_type: "document",
            file_path: filePath,
            filename,
            content: "",
            processed: false,
            status: "pending",
          })
          .select("id")
          .single();

        if (insertError)
          throw new Error(
            t(
              "knowledgeBase.errors.insertFailed",
              "Insert failed: {{message}}",
              { message: insertError.message }
            )
          );

        // 3) Mirror to OpenAI Vector Store
        const session = (await supabase.auth.getSession()).data.session;
        const r = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-kb-to-openai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ knowledge_base_id: kb.id }),
          }
        );

        if (!r.ok) {
          const message = await r.text();
          throw new Error(
            t(
              "knowledgeBase.errors.syncFailed",
              "Failed to sync knowledge base: {{message}}",
              { message }
            )
          );
        }

        return kb.id;
      } else {
        // TEXT knowledge
        const { data: kb, error } = await supabase
          .from("knowledge_base")
          .insert({
            chatbot_id: chatbotId,
            content_type: "text",
            content,
            filename: filename || "content.txt",
            processed: false,
            status: "pending",
          })
          .select("id")
          .single();

        if (error)
          throw new Error(
            t(
              "knowledgeBase.errors.insertFailed",
              "Insert failed: {{message}}",
              { message: error.message }
            )
          );

        const session = (await supabase.auth.getSession()).data.session;
        const r = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-kb-to-openai`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ knowledge_base_id: kb.id }),
          }
        );

        if (!r.ok) {
          const message = await r.text();
          throw new Error(
            t(
              "knowledgeBase.errors.syncFailed",
              "Failed to sync knowledge base: {{message}}",
              { message }
            )
          );
        }

        return kb.id;
      }
    };
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(true);
      setProgressLabel(
        t("knowledgeBase.progress.deletingOne", "Deleting item...")
      );
      setProgress(30);

      await deleteKnowledgeBase.mutateAsync(id);
      setProgress(70);

      await refetchKnowledgeBase();
      setProgress(100);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: t(
              "knowledgeBase.toasts.deleteSuccess",
              "Knowledge item deleted successfully"
            ),
          },
        })
      );
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: t(
              "knowledgeBase.toasts.deleteError",
              "Failed to delete knowledge item"
            ),
          },
        })
      );
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 500);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const deleteCount = selectedItems.length;

    try {
      setProcessing(true);
      setProgressLabel(
        t(
          "knowledgeBase.progress.deletingMany",
          "Deleting {{count}} items...",
          {
            count: deleteCount,
          }
        )
      );
      setProgress(20);

      await Promise.all(
        selectedItems.map((id) => deleteKnowledgeBase.mutateAsync(id))
      );
      setProgress(70);

      setSelectedItems([]);
      await refetchKnowledgeBase();
      setProgress(100);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: t(
              "knowledgeBase.toasts.bulkDeleteSuccess",
              "{{count}} items deleted successfully",
              { count: deleteCount }
            ),
          },
        })
      );
    } catch (error) {
      console.error("Error bulk deleting knowledge items:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: t(
              "knowledgeBase.toasts.bulkDeleteError",
              "Failed to delete selected items"
            ),
          },
        })
      );
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProgress(0);
        setProgressLabel("");
      }, 500);
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setShowKnowledgeEditor(true);
  };

  const handleView = (item: KnowledgeItem) => {
    setViewingItem(item);
  };

  const handleDownload = (item: KnowledgeItem) => {
    const element = document.createElement("a");
    const file = new Blob([item.content ?? ""], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = item.filename || `knowledge_${item.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    if (!selectedChatbot) return;
    const channel = supabase
      .channel("knowledge-base-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "knowledge_base",
          filter: `chatbot_id=eq.${selectedChatbot}`,
        },
        () => {
          refetchKnowledgeBase();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatbot, refetchKnowledgeBase]);

  const contentTypeLabel = (ct: "text" | "document") =>
    ct === "text"
      ? t("knowledgeBase.view.badge.type.text", "Text")
      : t("knowledgeBase.view.badge.type.document", "Document");

  return (
    <div className="space-y-8 min-h-screen p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
          {t("knowledgeBase.title", "Bot Knowledge")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t(
            "knowledgeBase.subtitle",
            "Manage the content that powers your chatbots."
          )}
        </p>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {(processing || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                {progressLabel ||
                  (isLoading
                    ? t("knowledgeBase.progress.loading", "Loading...")
                    : t("knowledgeBase.progress.processing", "Processing..."))}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-primary-500 dark:bg-primary-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Selection */}
      <ChatbotSelector
        chatbots={chatbots}
        selectedChatbot={selectedChatbot}
        setSelectedChatbot={setSelectedChatbot}
      />

      {/* Add Knowledge Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingItem(null);
            setShowKnowledgeEditor(true);
          }}
          disabled={!selectedChatbot || processing}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-disabled={!selectedChatbot || processing}
          aria-label={t("knowledgeBase.actions.addKnowledge", "Add Knowledge")}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("knowledgeBase.actions.addKnowledge", "Add Knowledge")}
        </button>
      </div>

      {/* Bot Knowledge Content */}
      <BotKnowledgeContent
        knowledgeBase={knowledgeBase}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        handleDelete={handleDelete}
        handleBulkDelete={handleBulkDelete}
        handleEdit={handleEdit}
        handleView={handleView}
        handleDownload={handleDownload}
        processing={processing}
        handleProcess={(item) => mutate(item.id)}
      />

      {/* Knowledge Editor Modal */}
      <KnowledgeEditorModal
        isOpen={showKnowledgeEditor}
        onClose={() => {
          setShowKnowledgeEditor(false);
          setEditingItem(null);
        }}
        onSave={async (data) => {
          try {
            await createKnowledgeItem(selectedChatbot)(data);
            await refetchKnowledgeBase();
          } catch (error) {
            console.error(error);
          }
          setShowKnowledgeEditor(false);
          setEditingItem(null);
        }}
        editingItem={
          editingItem
            ? { ...editingItem, filename: editingItem.filename ?? undefined }
            : editingItem
        }
        isProcessing={processing}
        chatbotId={selectedChatbot}
      />

      {/* View Item Modal */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 bg-gray-800/40 dark:bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label={t(
                "knowledgeBase.view.dialogLabel",
                "Knowledge item details"
              )}
            >
              <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {viewingItem.filename ||
                      t(
                        "knowledgeBase.view.titleFallback",
                        "Knowledge Content"
                      )}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label={t("knowledgeBase.actions.close", "Close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingItem.content_type === "text"
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                          : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                      }`}
                    >
                      {contentTypeLabel(
                        viewingItem.content_type as "text" | "document"
                      )}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingItem.processed
                          ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      {viewingItem.processed ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {viewingItem.processed
                        ? t("knowledgeBase.view.badge.processed", "Processed")
                        : t(
                            "knowledgeBase.view.badge.notProcessed",
                            "Not Processed"
                          )}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("knowledgeBase.view.addedLabel", "Added:")}{" "}
                    {new Date(viewingItem.created_at ?? "").toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 max-h-[60vh] overflow-y-auto">
                  {viewingItem.content}
                </div>
              </div>
              <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {t("knowledgeBase.actions.close", "Close")}
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleEdit(viewingItem);
                      setViewingItem(null);
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2 inline" />
                    {t("knowledgeBase.actions.edit", "Edit")}
                  </button>
                  <button
                    onClick={() => handleDownload(viewingItem)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    {t("knowledgeBase.actions.download", "Download")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Edit,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader,
  X,
  Clock,
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
import { useProcessLargeDocument } from "../hooks/useProcessLargeDocument";
import { supabase } from "../lib/supabase";

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

export const KnowledgeBase = () => {
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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);

  const { mutate, isPending, isSuccess, isError, error } =
    useProcessLargeDocument();

  const {
    data: knowledgeBase = [],
    isLoading,
    refetch: refetchKnowledgeBase,
  } = useKnowledgeBase(selectedChatbot);

  const deleteKnowledgeBase = useDeleteKnowledgeBase();

  const filteredKnowledge = knowledgeBase.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.filename &&
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterType === "all" || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });

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
      if (!chatbotId) throw new Error("Chatbot ID is missing.");

      if (contentType === "document") {
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;

        if (!fileInput?.files?.length) {
          throw new Error("No file selected for upload.");
        }

        const file = fileInput.files[0];
        const filePath = `kb/${chatbotId}/${filename}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Insert placeholder for processing
        const { error: insertError } = await supabase
          .from("knowledge_base")
          .insert({
            chatbot_id: chatbotId,
            content_type: "document",
            file_path: filePath,
            filename,
            content: "",
            processed: false,
          });

        if (insertError) {
          throw new Error(`Insert failed: ${insertError.message}`);
        }
      } else {
        // Insert text content directly
        const { error } = await supabase.from("knowledge_base").insert({
          chatbot_id: chatbotId,
          content_type: "text",
          content,
          filename,
          processed: true,
        });

        if (error) {
          throw new Error(`Insert failed: ${error.message}`);
        }
      }
    };
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(true);
      setProgressLabel("Deleting item...");
      setProgress(30);

      await deleteKnowledgeBase.mutateAsync(id);
      setProgress(70);

      await refetchKnowledgeBase();
      setProgress(100);

      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "success",
            message: "Knowledge item deleted successfully",
          },
        })
      );
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Failed to delete knowledge item",
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

    try {
      setProcessing(true);
      setProgressLabel(`Deleting ${selectedItems.length} items...`);
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
            message: `${selectedItems.length} items deleted successfully`,
          },
        })
      );
    } catch (error) {
      console.error("Error bulk deleting knowledge items:", error);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: {
            type: "error",
            message: "Failed to delete selected items",
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

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredKnowledge.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredKnowledge.map((item) => item.id));
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowKnowledgeEditor(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
  };

  const handleDownload = (item: any) => {
    const element = document.createElement("a");
    const file = new Blob([item.content], { type: "text/plain" });
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

  return (
    <div className="space-y-8 min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-1">
            Bot Knowledge
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage the content that powers your chatbots.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowKnowledgeEditor(true);
            }}
            disabled={!selectedChatbot || processing}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Knowledge
          </button>
        </div>
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
                {progressLabel || (isLoading ? "Loading..." : "Processing...")}
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

      {/* Bot Knowledge Content */}
      {selectedChatbot && (
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          {/* Filters */}
          <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-gray-900/40 dark:to-accent-900/20 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Bot Knowledge Items
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {filteredKnowledge.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredKnowledge.length &&
                        filteredKnowledge.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-700 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-600"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Select all ({filteredKnowledge.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedItems.length} selected
                    </span>
                  )}
                </div>

                {selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={processing}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content List */}
          <div className="p-8">
            {filteredKnowledge.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {searchTerm || filterType !== "all"
                    ? "No matching items"
                    : "No Bot Knowledge items"}
                </h3>
                <p className="text-gray-400 dark:text-gray-500">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Add content to help your chatbot answer questions."}
                </p>
                {!searchTerm && filterType === "all" && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowKnowledgeEditor(true);
                    }}
                    disabled={!selectedChatbot || processing}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {filteredKnowledge.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl shadow-subtle bg-white/90 dark:bg-gray-700/90"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 dark:border-gray-700 text-primary-600 dark:text-primary-400 focus:ring-primary-500 dark:focus:ring-primary-600 mr-3"
                        />
                        <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.filename || `${item.content_type} content`}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.content_type === "text"
                              ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                              : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                          }`}
                        >
                          {item.content_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.processed
                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : item.status === "processing"
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {item.processed ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Processed
                            </>
                          ) : item.status === "processing" ? (
                            <>
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                              Processing
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>

                        {/* Process Document Button */}
                        {item.content_type === "document" &&
                          !item.processed && (
                            <button
                              onClick={() => mutate(item.id)}
                              disabled={isPending}
                              className="ml-2 px-3 py-1 text-sm text-white bg-blue-600 rounded disabled:opacity-50"
                            >
                              {isPending
                                ? "Processing..."
                                : item.status === "pending"
                                ? "Start Processing"
                                : "Process Document"}
                            </button>
                          )}

                        <button
                          onClick={() => handleView(item)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={processing}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                      {item.content.substring(0, 200)}...
                    </p>

                    {/* Error Status Display */}
                    {item.status === "error" && (
                      <p className="text-xs text-red-500 mt-1">
                        Error: {item.error_message || "Processing failed"}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>{item.content.length} characters</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Editor Modal */}
      <KnowledgeEditorModal
        isOpen={showKnowledgeEditor}
        onClose={() => {
          setShowKnowledgeEditor(false);
          setEditingItem(null);
        }}
        onSave={async (data) => {
          try {
            // Call the function returned by createKnowledgeItem
            await createKnowledgeItem(selectedChatbot)(data);
            await refetchKnowledgeBase();
          } catch (error) {
            console.error(error);
            // Optionally show error to user
          }
          // Close modal after upload is initiated (or completed, if you want to wait)
          setShowKnowledgeEditor(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
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
            >
              <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {viewingItem.filename || "Knowledge Content"}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingItem(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewingItem.content_type === "text"
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                          : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                      }`}
                    >
                      {viewingItem.content_type}
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
                      {viewingItem.processed ? "Processed" : "Not Processed"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Added: {new Date(viewingItem.created_at).toLocaleString()}
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
                  Close
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
                    Edit
                  </button>
                  <button
                    onClick={() => handleDownload(viewingItem)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-green-600 dark:bg-green-700 border border-transparent rounded-xl hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2 inline" />
                    Download
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

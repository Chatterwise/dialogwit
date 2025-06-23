import { useState } from "react";
import { FileText, Plus, Trash2, Search, Upload, File } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useChatbots } from "../hooks/useChatbots";
import {
  useKnowledgeBase,
  useAddKnowledgeBase,
  useDeleteKnowledgeBase,
} from "../hooks/useKnowledgeBase";
import { FileUpload } from "./FileUpload";
import { ChatbotSelector } from "./ChatbotSelector";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "document">(
    "all"
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { data: knowledgeBase = [], isLoading } =
    useKnowledgeBase(selectedChatbot);
  const addKnowledgeBase = useAddKnowledgeBase();
  const deleteKnowledgeBase = useDeleteKnowledgeBase();

  const [newContent, setNewContent] = useState({
    content: "",
    contentType: "text" as "text" | "document",
    filename: "",
  });

  const filteredKnowledge = knowledgeBase.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.filename &&
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterType === "all" || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });

  console.log(filteredKnowledge);

  const handleAddKnowledge = async () => {
    if (!selectedChatbot || !newContent.content.trim()) return;

    try {
      await addKnowledgeBase.mutateAsync({
        chatbot_id: selectedChatbot,
        content: newContent.content,
        content_type: newContent.contentType,
        filename: newContent.filename || null,
        processed: false,
      });

      setNewContent({ content: "", contentType: "text", filename: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding Bot Knowledge:", error);
    }
  };

  const handleFilesSelected = async (files: ProcessedFile[]) => {
    if (!selectedChatbot) return;

    for (const file of files) {
      if (file.status === "completed" && file.content) {
        try {
          await addKnowledgeBase.mutateAsync({
            chatbot_id: selectedChatbot,
            content: file.content,
            content_type: "document",
            filename: file.name,
            processed: false,
          });
        } catch (error) {
          console.error("Error adding file to Bot Knowledge:", error);
        }
      }
    }
    setShowFileUpload(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Bot Knowledge item?")) {
      try {
        await deleteKnowledgeBase.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting Bot Knowledge:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (
      confirm(`Are you sure you want to delete ${selectedItems.length} items?`)
    ) {
      try {
        await Promise.all(
          selectedItems.map((id) => deleteKnowledgeBase.mutateAsync(id))
        );
        setSelectedItems([]);
      } catch (error) {
        console.error("Error bulk deleting Bot Knowledge items:", error);
      }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mb-1">
            Bot Knowledge
          </h1>
          <p className="text-gray-500">
            Manage the content that powers your chatbots.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFileUpload(true)}
            disabled={!selectedChatbot}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!selectedChatbot}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-card text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </button>
        </div>
      </div>

      {/* Bot Knowledge Content */}
      {selectedChatbot && (
        <div className="bg-white/80 rounded-2xl shadow-xl border border-gray-100">
          {/* Filters */}
          <div className="px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-primary-50 via-white to-accent-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Bot Knowledge Items
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                >
                  <option value="all">All Types</option>
                  <option value="text">Text</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {filteredKnowledge.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === filteredKnowledge.length &&
                        filteredKnowledge.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Select all ({filteredKnowledge.length})
                    </span>
                  </label>
                  {selectedItems.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selected
                    </span>
                  )}
                </div>

                {selectedItems.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors"
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-400">
                  Loading Bot Knowledge...
                </p>
              </div>
            ) : filteredKnowledge.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  {searchTerm || filterType !== "all"
                    ? "No matching items"
                    : "No Bot Knowledge items"}
                </h3>
                <p className="text-gray-400">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Add content to help your chatbot answer questions."}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredKnowledge.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 border border-gray-100 rounded-xl shadow-subtle bg-white/90"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-3"
                        />
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-semibold text-gray-900">
                          {item.filename || `${item.content_type} content`}
                        </span>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.content_type === "text"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-accent-100 text-accent-700"
                          }`}
                        >
                          {item.content_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.processed
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {item.processed ? "Processed" : "Processing"}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.content.substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span>{item.content.length} characters</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chatbot Selection */}
      <ChatbotSelector
        chatbots={chatbots}
        selectedChatbot={selectedChatbot}
        setSelectedChatbot={setSelectedChatbot}
      />

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Upload Files to Bot Knowledge
              </h3>
            </div>
            <div className="p-8">
              <FileUpload onFilesSelected={handleFilesSelected} />
            </div>
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end space-x-3 bg-gradient-to-r from-white via-primary-50 to-accent-50 rounded-b-2xl">
              <button
                onClick={() => setShowFileUpload(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-100">
            <div className="px-8 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Add Bot Knowledge Content
              </h3>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={newContent.contentType}
                  onChange={(e) =>
                    setNewContent({
                      ...newContent,
                      contentType: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                >
                  <option value="text">Text Content</option>
                  <option value="document">Document</option>
                </select>
              </div>

              {newContent.contentType === "document" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Filename (optional)
                  </label>
                  <input
                    type="text"
                    value={newContent.filename}
                    onChange={(e) =>
                      setNewContent({ ...newContent, filename: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                    placeholder="document.pdf"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newContent.content}
                  onChange={(e) =>
                    setNewContent({ ...newContent, content: e.target.value })
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition"
                  placeholder="Paste your content here..."
                />
              </div>
            </div>
            <div className="px-8 py-5 border-t border-gray-100 flex justify-end space-x-3 bg-gradient-to-r from-white via-primary-50 to-accent-50 rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddKnowledge}
                disabled={
                  !newContent.content.trim() || addKnowledgeBase.isPending
                }
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-500 border border-transparent rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {addKnowledgeBase.isPending ? "Adding..." : "Add Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

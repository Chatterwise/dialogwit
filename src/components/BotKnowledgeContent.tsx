import {
  FileText,
  Trash2,
  Search,
  Edit,
  Download,
  Eye,
  CheckCircle,
  Play,
  Loader as LoaderIcon,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../lib/toastStore";
import { BotKnowledgeContentProps, KnowledgeItem } from "./utils/types";

const BotKnowledgeContent = ({
  knowledgeBase = [],
  selectedItems = [],
  setSelectedItems,
  searchTerm = "",
  setSearchTerm,
  filterType = "all",
  setFilterType,
  handleDelete,
  handleBulkDelete,
  handleEdit,
  handleView,
  handleDownload,
  handleProcess,
  processing,
}: BotKnowledgeContentProps) => {
  const filteredKnowledge = knowledgeBase.filter((item) => {
    const matchesSearch =
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.filename &&
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterType === "all" || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });
  const toast = useToast();

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === filteredKnowledge.length
        ? []
        : filteredKnowledge.map((item) => item.id)
    );
  };

  const getStatusBadge = (item: KnowledgeItem) => {
    if (item.processed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Processed
        </span>
      );
    } else if (item.status === "processing") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
          <LoaderIcon className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      );
    }
  };

  const handleProcessItem = (item: KnowledgeItem) => {
    if (handleProcess) {
      toast.info(`Processing "${item.filename || item.id}"...`);

      handleProcess(item);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
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
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "text" | "document")
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-600 focus:border-primary-400 dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="document">Document</option>
            </select>
          </div>
        </div>

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
                onClick={() => {
                  handleBulkDelete();
                  toast.success("Selected items deleted");
                }}
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
                    <span className="text-sm font1-semibold text-gray-900 dark:text-white">
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
                    {getStatusBadge(item)}
                    {handleProcess && !item.processed && (
                      <button
                        onClick={() => handleProcessItem(item)}
                        disabled={processing}
                        className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors duration-200 disabled:opacity-50 flex items-center"
                        title="Process"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span className="text-xs">Process</span>
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
                      onClick={() => {
                        handleDelete(item.id);
                        toast.success(`${item.filename || item.id} deleted`);
                      }}
                      disabled={processing}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                  {item.content?.substring(0, 200)}...
                </p>
                {item.status === "error" && (
                  <p className="text-xs text-red-500 mt-1">
                    Error: {item.error_message || "Processing failed"}
                  </p>
                )}
                {item.status === "processing" && (
                  <div className="w-full mt-2 h-1 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                      style={{
                        width: `${item.progress || 25}%`,
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                  <span>
                    Added{" "}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "unknown date"}
                  </span>
                  <span>{item.content?.length || 0} characters</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotKnowledgeContent;

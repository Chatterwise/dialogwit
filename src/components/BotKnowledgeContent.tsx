// BotKnowledgeContent.tsx
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
import React from "react";
import { supabase } from "../lib/supabase";
import { useTranslation } from "../hooks/useTranslation";

type LocalStatus = "processing" | "completed" | "error";

// Extend base item with optional runtime fields the UI may receive/display.
type KnowledgeItemWithRuntime = KnowledgeItem & {
  progress?: number | null;
  error_message?: string | null;
};

const toBase = (i: KnowledgeItemWithRuntime): KnowledgeItem => ({
  ...i,
  content: i.content ?? undefined,
});

export default function BotKnowledgeContent({
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
}: BotKnowledgeContentProps) {
  const toast = useToast();

  // Local, optimistic progress/state for nicer UX during batch
  const { t } = useTranslation();

  const [batchActive, setBatchActive] = React.useState(false);
  const [batchTotals, setBatchTotals] = React.useState({
    total: 0,
    completed: 0,
    failed: 0,
  });
  const [progressMap, setProgressMap] = React.useState<Record<string, number>>(
    {}
  );
  const [statusMap, setStatusMap] = React.useState<Record<string, LocalStatus>>(
    {}
  );

  // Track live watchers (realtime channels + polling timers) to clean up.
  const channelsRef = React.useRef<
    Record<string, ReturnType<typeof supabase.channel> | null>
  >({});
  const pollersRef = React.useRef<Record<string, number>>({});

  React.useEffect(() => {
    return () => {
      // cleanup on unmount
      for (const id in channelsRef.current) {
        const ch = channelsRef.current[id];
        if (ch) supabase.removeChannel(ch);
      }
      channelsRef.current = {};
      for (const id in pollersRef.current) {
        clearInterval(pollersRef.current[id]);
      }
      pollersRef.current = {};
    };
  }, []);

  const filteredKnowledge = (
    knowledgeBase as KnowledgeItemWithRuntime[]
  ).filter((item) => {
    const matchesSearch =
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.filename &&
        item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter =
      filterType === "all" || item.content_type === filterType;
    return matchesSearch && matchesFilter;
  });

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

  const setLocalStatus = (id: string, status: LocalStatus) =>
    setStatusMap((prev) => ({ ...prev, [id]: status }));

  const setLocalProgress = (id: string, pct: number) =>
    setProgressMap((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(100, pct)),
    }));

  const stopWatching = (id: string) => {
    const ch = channelsRef.current[id];
    if (ch) supabase.removeChannel(ch);
    channelsRef.current[id] = null;
    const t = pollersRef.current[id];
    if (t) clearInterval(t);
    delete pollersRef.current[id];
  };

  const watchItemRealtime = (id: string) => {
    if (channelsRef.current[id]) return; // already watching
    const channel = supabase
      .channel(`kb:${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "knowledge_base",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as KnowledgeItemWithRuntime;
          if (typeof row.progress === "number")
            setLocalProgress(id, row.progress);
          if (row.status === "error") {
            setLocalStatus(id, "error");
            stopWatching(id);
          } else if (row.processed) {
            setLocalStatus(id, "completed");
            setLocalProgress(id, 100);
            stopWatching(id);
          } else {
            // keep processing
            setLocalStatus(id, "processing");
          }
        }
      )
      .subscribe((status) => {
        // Fallback to polling if channel fails or times out
        if (status !== "SUBSCRIBED") startPolling(id);
      });

    channelsRef.current[id] = channel;
  };

  const startPolling = (id: string) => {
    if (pollersRef.current[id]) return;
    const interval = 2000;
    const t = window.setInterval(async () => {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("status, processed, progress, error_message")
        .eq("id", id)
        .maybeSingle();

      if (error) return; // keep trying
      if (!data) return;

      const row = data as KnowledgeItemWithRuntime;
      if (typeof row.progress === "number") setLocalProgress(id, row.progress);

      if (row.status === "error") {
        setLocalStatus(id, "error");
        clearInterval(t);
        delete pollersRef.current[id];
      } else if (row.processed) {
        setLocalStatus(id, "completed");
        setLocalProgress(id, 100);
        clearInterval(t);
        delete pollersRef.current[id];
      } else {
        setLocalStatus(id, "processing");
      }
    }, interval);

    pollersRef.current[id] = t;
  };

  const getStatusBadge = (item: KnowledgeItemWithRuntime) => {
    // Prefer remote DB flags if present; fall back to local batch state
    const local = statusMap[item.id];

    const isProcessed = item.processed || local === "completed";
    const isProcessing = item.status === "processing" || local === "processing";

    if (isProcessed) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t("kb.status.processed")}
        </span>
      );
    } else if (isProcessing) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
          <LoaderIcon className="h-3 w-3 mr-1 animate-spin" />
          {t("kb.status.processing")}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400">
          <Clock className="h-3 w-3 mr-1" />
          {t("kb.status.pending")}
        </span>
      );
    }
  };

  // Single-item: do NOT mark completed on resolve. We queue, then watch for DB updates.
  const processOne = async (item: KnowledgeItemWithRuntime) => {
    if (!handleProcess) return;

    setLocalStatus(item.id, "processing");
    setLocalProgress(item.id, 0);

    // smooth optimistic progress up to 90% while we wait for server updates
    let pct = 0;
    const step = 6 + Math.floor(Math.random() * 6);
    const tickMs = 450;
    const timer = window.setInterval(() => {
      pct = Math.min(pct + step, 90);
      setLocalProgress(item.id, pct);
    }, tickMs);

    try {
      await handleProcess(toBase(item)); // kick off server job (likely returns quickly)
      window.clearInterval(timer);
      // Stay in "processing" and attach watchers
      watchItemRealtime(item.id);
      startPolling(item.id); // fallback
      return { ok: true as const };
    } catch {
      window.clearInterval(timer);
      setLocalStatus(item.id, "error");
      setLocalProgress(item.id, Math.max(5, pct));
      return { ok: false as const };
    }
  };

  const handleProcessItem = async (item: KnowledgeItemWithRuntime) => {
    if (!handleProcess) return;
    toast.info(`${t("kb.toast.processing")} "${item.filename || item.id}"...`);
    await processOne(item);
  };

  // Batch process selected (sequential for clarity; can be parallelized)
  const handleProcessSelected = async () => {
    if (!handleProcess) return;

    const items = filteredKnowledge.filter(
      (it) => selectedItems.includes(it.id) && !it.processed
    );
    if (items.length === 0) {
      toast.info(t("kb.toast.nothing_to_process"));
      return;
    }

    toast.info(
      `${t("kb.toast.processing")} ${items.length} ${t(
        "kb.toast.items_suffix"
      )}`
    );
    setBatchActive(true);
    setBatchTotals({ total: items.length, completed: 0, failed: 0 });

    let done = 0;
    let failed = 0;

    for (const item of items) {
      const res = await processOne(item);
      if (res?.ok) {
        // completion will be reflected by realtime/poll later
        done += 1;
      } else {
        failed += 1;
      }
      setBatchTotals({ total: items.length, completed: done, failed });
    }

    setBatchActive(false);
    if (failed === 0) {
      toast.success(t("kb.toast.batch_submitted"));
    } else if (done === 0) {
      toast.error(t("kb.toast.all_failed"));
    } else {
      toast.info(
        `${done} ${t("kb.toast.submitted")}, ${failed} ${t(
          "kb.toast.failed_to_submit"
        )}.`
      );
    }
  };

  const batchPct =
    batchTotals.total > 0
      ? Math.round(
          ((batchTotals.completed + batchTotals.failed) / batchTotals.total) *
            100
        )
      : 0;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 via-white to-accent-50 dark:from-primary-900/20 dark:via-gray-900/40 dark:to-accent-900/20 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("kb.header.title")}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={t("kb.search.placeholder")}
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
              <option value="all">{t("kb.filter.all")}</option>
              <option value="text">{t("kb.filter.text")}</option>
              <option value="document">{t("kb.filter.document")}</option>
            </select>
          </div>
        </div>

        {filteredKnowledge.length > 0 && (
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
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
                    {t("kb.select_all_label")} ({filteredKnowledge.length})
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItems.length} {t("kb.selected_label")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <button
                      onClick={handleProcessSelected}
                      disabled={processing || batchActive}
                      className="inline-flex items-center px-3 py-1.5 border border-purple-300 dark:border-purple-700 text-sm font-medium rounded-lg text-purple-700 dark:text-purple-300 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {t("kb.actions.process_selected")}
                    </button>
                    <button
                      onClick={() => {
                        handleBulkDelete();
                        toast.success(t("kb.toast.selected_items_deleted"));
                      }}
                      disabled={processing || batchActive}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 dark:border-red-700 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t("kb.actions.delete_selected")}
                    </button>
                  </>
                )}
              </div>
            </div>

            {batchActive && (
              <div className="w-full">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>
                    {t("kb.batch.submitted")}{" "}
                    {batchTotals.completed + batchTotals.failed}/
                    {batchTotals.total}
                  </span>
                  <span>
                    {batchTotals.completed} {t("kb.batch.ok")} •{" "}
                    {batchTotals.failed} {t("kb.batch.failed_to_submit")}
                  </span>
                </div>
                <div className="w-full h-2 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 dark:bg-purple-400 transition-all duration-300"
                    style={{ width: `${batchPct}%` }}
                  />
                </div>
              </div>
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
                ? t("kb.empty.no_matching_title")
                : t("kb.empty.no_items_title")}
            </h3>
            <p className="text-gray-400 dark:text-gray-500">
              {searchTerm || filterType !== "all"
                ? t("kb.empty.no_matching_desc")
                : t("kb.empty.no_items_desc")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredKnowledge.map((item: KnowledgeItemWithRuntime) => {
              const localStatus = statusMap[item.id];
              const localProgress = progressMap[item.id];

              const isProcessing =
                item.status === "processing" || localStatus === "processing";
              const isCompleted = item.processed || localStatus === "completed";
              const hasError =
                localStatus === "error" || item.status === "error";

              const progress =
                typeof localProgress === "number"
                  ? localProgress
                  : typeof item.progress === "number"
                  ? item.progress
                  : isProcessing
                  ? 25
                  : 0;

              const contentTypeLabel =
                item.content_type === "text"
                  ? t("kb.item.type.text")
                  : t("kb.item.type.document");

              return (
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
                        {item.filename ||
                          `${contentTypeLabel} ${t("kb.item.content_suffix")}`}
                      </span>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.content_type === "text"
                            ? "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                            : "bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400"
                        }`}
                      >
                        {contentTypeLabel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(item)}
                      {handleProcess && !isCompleted && (
                        <button
                          onClick={() => handleProcessItem(item)}
                          disabled={processing || batchActive}
                          className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors duration-200 disabled:opacity-50 flex items-center"
                          title={t("kb.tooltip.process")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          <span className="text-xs">
                            {t("kb.tooltip.process")}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => handleView(toBase(item))}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                        title={t("kb.tooltip.view")}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(toBase(item))}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                        title={t("kb.tooltip.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(toBase(item))}
                        className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
                        title={t("kb.tooltip.download")}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(item.id);
                          toast.success(
                            `${item.filename || item.id} ${t(
                              "kb.toast.deleted_suffix"
                            )}`
                          );
                        }}
                        disabled={processing || batchActive}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50"
                        title={t("kb.tooltip.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                    {item.content?.substring(0, 200)}...
                  </p>

                  {hasError && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {item.error_message || "Processing failed"}
                    </p>
                  )}

                  {isProcessing && (
                    <div className="w-full mt-2 h-1 bg-purple-100 dark:bg-purple-900/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 dark:bg-purple-400 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
                    <span>
                      {t("kb.item.added_prefix")}{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : t("kb.item.unknown_date")}
                    </span>
                    <span>
                      {item.content?.length || 0}{" "}
                      {t("kb.item.characters_suffix")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

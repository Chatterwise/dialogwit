import React, { useState } from "react";
import { AlertTriangle, Trash2, Loader, Check, Info } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

type Action = {
  title: string;
  description: string;
  affectedItems?: string[];
  onConfirm: () => Promise<void>;
  actionLabel: string;
  actionColor: "red" | "green" | "blue" | "gray";
  actionIcon?: React.ReactNode;
  requireType?: boolean;
  confirmationWord?: string;
  note?: string;
};

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: Action;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  action,
}) => {
  const { t } = useTranslation();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const Icon =
    action.actionColor === "red"
      ? Trash2
      : action.actionColor === "green"
      ? Check
      : Info;
  const actionIcon = action.actionIcon || <Icon className="h-4 w-4 mr-2" />;

  const handleAction = async () => {
    const word = action.confirmationWord || "CONFIRM";
    if (action.requireType && confirmation !== word) {
      setError(t("actionmodal_error_type_word", { word }));
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await action.onConfirm();
      onClose();
    } catch (err) {
      console.error("Failed to perform action:", err);
      setError(t("actionmodal_error_generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const colorMap = {
    red: {
      bg: "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
      border: "border-red-200 dark:border-red-800",
      text: "text-white dark:text-white",
      icon: "text-red-600 dark:text-red-400",
    },
    green: {
      bg: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
      border: "border-green-200 dark:border-green-800",
      text: "text-white dark:text-white",
      icon: "text-green-600 dark:text-green-400",
    },
    blue: {
      bg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-white dark:text-white",
      icon: "text-blue-600 dark:text-blue-400",
    },
    gray: {
      bg: "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700",
      text: "text-white dark:text-white",
      icon: "text-gray-600 dark:text-gray-400",
    },
  } as const;

  const confirmWord = action.confirmationWord || "CONFIRM";

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-40 dark:bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="actionmodal_title"
      aria-describedby="actionmodal_desc"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
          <h3
            id="actionmodal_title"
            className="text-lg font-bold text-gray-900 dark:text-gray-100"
          >
            {action.title}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 border border-gray-200 dark:bg-gray-900/50 dark:border-gray-700 rounded-lg p-4">
            <p
              id="actionmodal_desc"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {action.description}
            </p>
            {action.affectedItems && (
              <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                {action.affectedItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            {action.note && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
                {action.note}
              </p>
            )}
          </div>

          {action.requireType && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("actionmodal_type_below", { word: confirmWord })}
              </p>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 dark:focus:ring-red-500 focus:border-red-400 dark:focus:border-red-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100"
                placeholder={t("actionmodal_placeholder", {
                  word: confirmWord,
                })}
                aria-label={t("actionmodal_placeholder", { word: confirmWord })}
              />
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t("actionmodal_cancel")}
          </button>
          <button
            onClick={handleAction}
            disabled={
              (action.requireType && confirmation !== confirmWord) || isLoading
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
              colorMap[action.actionColor].bg
            } ${colorMap[action.actionColor].text}`}
          >
            {isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              actionIcon
            )}
            {isLoading ? t("actionmodal_processing") : action.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

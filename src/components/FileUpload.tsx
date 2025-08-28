import React, { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";
import { FileUploadProps, ProcessedFile } from "./types/knowledge";

// Local display labels for helper text (not used for typing)
const ACCEPTED_TYPES = {
  "application/pdf": { label: "PDF" },
  "application/msword": { label: "Word" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "Word",
  },
  "application/vnd.ms-excel": { label: "Excel" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    label: "Excel",
  },
  "application/vnd.ms-powerpoint": { label: "PowerPoint" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    label: "PowerPoint",
  },
  "image/jpeg": { label: "JPEG" },
  "image/png": { label: "PNG" },
  "image/gif": { label: "GIF" },
  "text/plain": { label: "Text" },
} as const;

const processFileEntry = async (entry: FileSystemEntry): Promise<File[]> => {
  if (entry.isDirectory)
    return readDirectory(entry as FileSystemDirectoryEntry);
  const file = await getFile(entry);
  return [file];
};

const readDirectory = async (
  dir: FileSystemDirectoryEntry
): Promise<File[]> => {
  const files: File[] = [];
  const reader = dir.createReader();
  return new Promise((resolve) => {
    const readEntries = async () => {
      const entries = await new Promise<FileSystemEntry[]>((res) =>
        reader.readEntries(res)
      );
      if (entries.length === 0) return resolve(files);
      for (const entry of entries) {
        const newFiles = await processFileEntry(entry);
        files.push(...newFiles);
      }
      await readEntries();
    };
    readEntries();
  });
};

const getFile = (entry: FileSystemEntry): Promise<File> =>
  new Promise((resolve) => (entry as FileSystemFileEntry).file(resolve));

// Safe id generator (Node/test envs may not have crypto.randomUUID)
const genId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 20,
  maxSizePerFile = 25, // MB
  acceptedTypes = Object.keys(ACCEPTED_TYPES) as readonly string[],
  allowMultiple = true,
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateFiles = (files: File[]) => {
    if (files.length > maxFiles) {
      const trimmed = files.slice(0, maxFiles);
      return {
        valid: trimmed,
        dropped: files.length - maxFiles,
        reason: "maxFiles" as const,
      };
    }
    return { valid: files, dropped: 0, reason: null };
  };

  const filterAcceptAndSize = (files: File[]) =>
    files.filter(
      (f) =>
        (acceptedTypes.length === 0 || acceptedTypes.includes(f.type)) &&
        f.size <= maxSizePerFile * 1024 * 1024
    );

  const toProcessed = (files: File[]): ProcessedFile[] =>
    files.map((file) => ({
      file,
      id: `${file.name}_${file.size}_${genId()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
    }));

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const all = Array.from(fileList);
      const filtered = filterAcceptAndSize(all);
      const { valid } = validateFiles(filtered);

      // dedupe by name+size within this selection
      const seen = new Set<string>();
      const deduped = valid.filter((f) => {
        const key = `${f.name}__${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (deduped.length === 0) return;

      const processed = toProcessed(deduped);
      onFilesSelected(processed);

      if (inputRef.current) inputRef.current.value = "";
    },
    [onFilesSelected, maxFiles, maxSizePerFile, acceptedTypes]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      if (
        items &&
        items.length > 0 &&
        "webkitGetAsEntry" in items[0] &&
        typeof (
          items[0] as DataTransferItem & {
            webkitGetAsEntry?: () => FileSystemEntry;
          }
        ).webkitGetAsEntry === "function"
      ) {
        const entries = Array.from(items)
          .map((item) =>
            (
              item as DataTransferItem & {
                webkitGetAsEntry?: () => FileSystemEntry | null;
              }
            ).webkitGetAsEntry?.()
          )
          .filter((entry): entry is FileSystemEntry => entry != null);

        const allFiles: File[] = [];
        for (const entry of entries) {
          const files = await processFileEntry(entry);
          allFiles.push(...files);
        }
        handleFiles(allFiles);
      } else if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-4 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-primary-500 bg-primary-50/50"
            : "border-gray-300 hover:border-primary-400"
        }`}
        role="region"
        aria-label={t("fileUpload.dropZoneAria", "File upload drop zone")}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-primary-50/50 backdrop-blur-sm rounded-xl" />
        )}

        <div
          className={`transform transition-transform duration-200 ${
            isDragOver ? "scale-105" : "scale-100"
          }`}
        >
          <Upload
            className={`h-12 w-12 mx-auto mb-4 ${
              isDragOver ? "text-primary-600 animate-pulse" : "text-gray-400"
            }`}
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isDragOver
              ? t("fileUpload.title.dragOver", "Drop files here")
              : t("fileUpload.title.default", "Upload Bot Knowledge Files")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t(
              "fileUpload.subtitle",
              "Drag & drop files or folders here, or click to browse"
            )}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple={allowMultiple}
          accept={(acceptedTypes as readonly string[]).join(",")}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
          {allowMultiple
            ? t("fileUpload.chooseFiles", "Choose Files")
            : t("fileUpload.chooseFile", "Choose File")}
        </label>

        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <p>
            {t(
              "fileUpload.supported",
              "Supported: PDF, Word, Excel, PowerPoint, Images, Text"
            )}
          </p>
          <p>
            {t(
              "fileUpload.limits",
              "Max size: {{size}}MB • Max per selection: {{count}}",
              { size: maxSizePerFile, count: maxFiles }
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

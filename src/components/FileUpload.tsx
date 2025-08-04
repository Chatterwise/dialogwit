import React, { useState, useCallback } from "react";
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: ProcessedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
}

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

const ACCEPTED_TYPES = {
  "application/pdf": { icon: FileText, label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: FileText,
    label: "Word",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    icon: File,
    label: "Excel",
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    icon: File,
    label: "PowerPoint",
  },
  "image/jpeg": { icon: Image, label: "JPEG" },
  "image/png": { icon: Image, label: "PNG" },
  "image/gif": { icon: Image, label: "GIF" },
  "text/plain": { icon: FileText, label: "Text" },
};

// Helper to process a file entry (file or directory)
const processFileEntry = async (entry: any): Promise<File[]> => {
  if (entry.isDirectory) {
    return readDirectory(entry);
  } else {
    const file = await getFile(entry);
    return [file];
  }
};

const readDirectory = async (dir: any): Promise<File[]> => {
  const files: File[] = [];
  const reader = dir.createReader();

  return new Promise((resolve) => {
    const readEntries = async () => {
      const entries = await new Promise<any[]>((resolve) => {
        reader.readEntries(resolve);
      });
      if (entries.length === 0) {
        resolve(files);
        return;
      }
      for (const entry of entries) {
        const newFiles = await processFileEntry(entry);
        files.push(...newFiles);
      }
      await readEntries();
    };
    readEntries();
  });
};

const getFile = (entry: any): Promise<File> => {
  return new Promise((resolve) => {
    entry.file(resolve);
  });
};

// Custom FileList wrapper for directory drops
class FileListWrapper {
  private files: File[];
  constructor(files: File[]) {
    this.files = files;
  }
  get length() {
    return this.files.length;
  }
  item(index: number) {
    return this.files[index];
  }
  *[Symbol.iterator]() {
    for (const file of this.files) {
      yield file;
    }
  }
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxSizePerFile = 10,
  acceptedTypes = Object.keys(ACCEPTED_TYPES),
}) => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File): Promise<ProcessedFile> => {
    const processedFile: ProcessedFile = {
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "processing",
    };

    try {
      let content = "";
      if (file.type === "text/plain") {
        content = await file.text();
      } else if (file.type === "application/pdf") {
        content = `[PDF Content] ${file.name} - ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`;
      } else if (file.type.includes("image/")) {
        content = `[Image Content] ${file.name} - ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`;
      } else if (file.type.includes("officedocument")) {
        content = `[Document Content] ${file.name} - ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`;
      } else {
        throw new Error("Unsupported file type");
      }

      return {
        ...processedFile,
        content,
        status: "completed",
      };
    } catch (error) {
      return {
        ...processedFile,
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to process file",
      };
    }
  };

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList);

      // Validate file count
      if (files.length + newFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate file types and sizes
      const validFiles = newFiles.filter((file) => {
        if (!acceptedTypes.includes(file.type)) {
          return false;
        }
        if (file.size > maxSizePerFile * 1024 * 1024) {
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      setIsProcessing(true);

      // Process files
      const processedFiles = await Promise.all(
        validFiles.map((file) => processFile(file))
      );

      const updatedFiles = [...files, ...processedFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
      setIsProcessing(false);
    },
    [files, maxFiles, maxSizePerFile, acceptedTypes, onFilesSelected]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const items = e.dataTransfer.items;
      if (items && items.length > 0 && items[0].webkitGetAsEntry) {
        // Handle directory drop (Chrome, Edge, Opera)
        const entries = Array.from(items).map((item) =>
          item.webkitGetAsEntry()
        );
        const allFiles: File[] = [];
        for (const entry of entries) {
          const files = await processFileEntry(entry);
          allFiles.push(...files);
        }
        handleFiles(new FileListWrapper(allFiles));
      } else if (e.dataTransfer.files) {
        // Handle file drop
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

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    const fileType = ACCEPTED_TYPES[type as keyof typeof ACCEPTED_TYPES];
    return fileType?.icon || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
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
        aria-label="File upload drop zone"
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
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-400 mb-2">
            {isDragOver ? "Drop files here" : "Upload Bot Knowledge Files"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Drag and drop files or folders here, or click to browse
          </p>
        </div>
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 cursor-pointer transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
        </label>
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <p>Supported formats: PDF, Word, Excel, PowerPoint, Images, Text</p>
          <p>
            Maximum file size: {maxSizePerFile}MB • Maximum files: {maxFiles}
          </p>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <Loader className="h-5 w-5 animate-spin text-primary-600 mr-3" />
          <span className="text-sm text-gray-600">Processing files...</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-400">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {file.status === "processing" && (
                      <Loader className="h-4 w-4 animate-spin text-primary-600" />
                    )}
                    {file.status === "completed" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle
                        className="h-4 w-4 text-red-600"
                        title={file.error}
                      />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export type KnowledgeItem = {
  id: string;
  content?: string;
  filename?: string;
  content_type: string;
  processed?: boolean;
  status?: string;
  error_message?: string;
  created_at?: string;
  progress?: number;
};

export type BotKnowledgeContentProps = {
  knowledgeBase?: KnowledgeItem[];
  selectedItems?: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  searchTerm?: string;
  setSearchTerm: (value: string) => void;
  filterType?: "all" | "text" | "document";
  setFilterType: React.Dispatch<
    React.SetStateAction<"all" | "text" | "document">
  >;
  handleDelete: (id: string) => void;
  handleBulkDelete: () => void;
  handleEdit: (item: KnowledgeItem) => void
  handleView: (item: KnowledgeItem) => void
  handleDownload: (item: KnowledgeItem) => void;
  handleProcess?: (item: KnowledgeItem) => void;
  processing?: boolean;
  update?:() => void;
};

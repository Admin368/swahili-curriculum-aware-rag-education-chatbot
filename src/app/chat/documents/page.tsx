"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  FileText,
  FolderOpen,
  Layers,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { SUBJECTS, LEVELS, LANGUAGES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { upload } from "@vercel/blob/client";

type DocumentStatus = "pending" | "processing" | "ready" | "error";

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = {
    ready: {
      label: "Indexed",
      icon: CheckCircle2,
      variant: "default" as const,
    },
    processing: {
      label: "Processing",
      icon: Clock,
      variant: "secondary" as const,
    },
    pending: { label: "Pending", icon: Clock, variant: "outline" as const },
    error: {
      label: "Error",
      icon: AlertCircle,
      variant: "destructive" as const,
    },
  };
  const { label, icon: Icon, variant } = config[status];
  return (
    <Badge className="gap-1 text-xs" variant={variant}>
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSubject, setUploadSubject] = useState("History");
  const [uploadLevel, setUploadLevel] = useState("Form 1");
  const [uploadLanguage, setUploadLanguage] = useState("sw");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail dialog state
  const [detailDocId, setDetailDocId] = useState<string | null>(null);

  // tRPC queries
  const { data: documents, refetch: refetchDocs } = api.document.list.useQuery({
    search: search || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "pending" | "processing" | "ready" | "error")
        : undefined,
  });
  const { data: stats } = api.document.getStats.useQuery();
  const { data: detailDoc } = api.document.getById.useQuery(
    { id: detailDocId! },
    { enabled: !!detailDocId },
  );

  // tRPC mutations
  const createDoc = api.document.create.useMutation();
  const processDoc = api.document.processDocument.useMutation();
  const deleteDoc = api.document.delete.useMutation();
  const utils = api.useUtils();

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      setSelectedFile(files[0] ?? null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // 1. Upload file to Vercel Blob
      const blob = await upload(selectedFile.name, selectedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      // 2. Create document record
      const doc = await createDoc.mutateAsync({
        title: selectedFile.name.replace(/\.[^.]+$/, ""),
        filename: selectedFile.name,
        blobUrl: blob.url,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type || "application/pdf",
        subject: uploadSubject,
        level: uploadLevel,
        language: uploadLanguage,
      });

      // 3. Trigger processing (async — chunking + embedding)
      if (doc) {
        void processDoc.mutateAsync({ documentId: doc.id }).then(() => {
          void utils.document.list.invalidate();
          void utils.document.getStats.invalidate();
        });
      }

      setUploadOpen(false);
      setSelectedFile(null);
      void refetchDocs();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document and its chunks?")) return;
    try {
      await deleteDoc.mutateAsync({ id });
      void utils.document.list.invalidate();
      void utils.document.getStats.invalidate();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const docList = documents ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge className="gap-1" variant="secondary">
            <FolderOpen className="size-3" />
            Document Management
          </Badge>
        </div>
        <Dialog onOpenChange={setUploadOpen} open={uploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" size="sm">
              <Upload className="size-3.5" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a PDF to be chunked and embedded for curriculum RAG
                retrieval.
              </DialogDescription>
            </DialogHeader>

            <div
              aria-label="File drop zone"
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
                dragOver ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
              onDragLeave={() => setDragOver(false)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              role="region"
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="size-8 text-primary" />
                  <p className="font-medium text-foreground text-sm">
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    size="sm"
                    variant="outline"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <p className="mt-3 font-medium text-foreground text-sm">
                    Drag and drop a PDF here
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    PDF files up to 50MB
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    variant="outline"
                  >
                    Browse Files
                  </Button>
                  <input
                    accept=".pdf"
                    aria-label="Select PDF file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    ref={fileInputRef}
                    type="file"
                  />
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-foreground text-xs">
                  Subject
                </label>
                <Select value={uploadSubject} onValueChange={setUploadSubject}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-foreground text-xs">
                  Level
                </label>
                <Select value={uploadLevel} onValueChange={setUploadLevel}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-foreground text-xs">
                  Language
                </label>
                <Select
                  value={uploadLanguage}
                  onValueChange={setUploadLanguage}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setUploadOpen(false);
                  setSelectedFile(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedFile || uploading}
                onClick={() => void handleUpload()}
              >
                <Cpu className="size-4" />
                {uploading ? "Uploading..." : "Upload & Process"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-muted-foreground text-xs">Total Documents</p>
              <p className="mt-1 font-semibold text-2xl text-foreground">
                {stats?.total ?? 0}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-muted-foreground text-xs">Indexed</p>
              <p className="mt-1 font-semibold text-2xl text-foreground">
                {stats?.indexed ?? 0}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-muted-foreground text-xs">Total Chunks</p>
              <p className="mt-1 font-semibold text-2xl text-foreground">
                {stats?.totalChunks ?? 0}
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents..."
                value={search}
              />
              {search && (
                <Button
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setSearch("")}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Indexed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Table */}
          <div className="mt-6 rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Subject
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Level</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Chunks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docList.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium text-sm">
                          {doc.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant="secondary">
                        {doc.subject ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                      {doc.level ?? "-"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                      {formatFileSize(doc.fileSize ?? 0)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground text-sm md:table-cell">
                      {doc.status === "ready" ? (doc.chunkCount ?? 0) : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status as DocumentStatus} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label="Document options"
                            size="icon-sm"
                            variant="ghost"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => setDetailDocId(doc.id)}
                          >
                            <Eye className="size-3.5" />
                            View Details
                          </DropdownMenuItem>
                          {doc.status === "error" && (
                            <DropdownMenuItem
                              onClick={() => {
                                void processDoc
                                  .mutateAsync({ documentId: doc.id })
                                  .then(() => {
                                    void utils.document.list.invalidate();
                                    void utils.document.getStats.invalidate();
                                  });
                              }}
                            >
                              <Layers className="size-3.5" />
                              Retry Processing
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => void handleDelete(doc.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {docList.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="h-32 text-center text-muted-foreground text-sm"
                      colSpan={7}
                    >
                      No documents found. Upload your first curriculum PDF.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog onOpenChange={() => setDetailDocId(null)} open={!!detailDocId}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>{detailDoc?.title}</DialogDescription>
          </DialogHeader>
          {detailDoc && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Filename</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.filename}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Size</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {formatFileSize(detailDoc.fileSize ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Subject</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.subject ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Level</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.level ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Chunks</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.chunkCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={detailDoc.status as DocumentStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Language</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.language === "sw"
                      ? "Swahili"
                      : detailDoc.language === "en"
                        ? "English"
                        : (detailDoc.language ?? "-")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Uploaded</p>
                  <p className="mt-0.5 font-medium text-foreground text-sm">
                    {detailDoc.createdAt
                      ? new Date(detailDoc.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              {detailDoc.status === "ready" && (
                <div>
                  <p className="text-muted-foreground text-xs">
                    Processing Pipeline
                  </p>
                  <div className="mt-2 flex flex-col gap-2">
                    {[
                      "Uploaded",
                      "Text Extracted",
                      "Chunked",
                      "Embedded",
                      "Indexed",
                    ].map((step) => (
                      <div className="flex items-center gap-2" key={step}>
                        <CheckCircle2 className="size-4 text-accent" />
                        <span className="text-foreground text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDocId(null)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

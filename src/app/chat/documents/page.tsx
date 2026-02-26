"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FolderOpen,
  Upload,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Layers,
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type DocumentStatus = "ready" | "processing" | "error" | "pending"

interface DocumentItem {
  id: string
  name: string
  type: string
  size: string
  chunks: number
  status: DocumentStatus
  uploadedAt: string
  chunkStrategy: string
}

const mockDocuments: DocumentItem[] = [
  {
    id: "1",
    name: "Biology 101 - Chapter 8 Photosynthesis.pdf",
    type: "PDF",
    size: "2.4 MB",
    chunks: 47,
    status: "ready",
    uploadedAt: "2026-02-24",
    chunkStrategy: "Semantic",
  },
  {
    id: "2",
    name: "Lecture Notes - Week 5 Energy Metabolism.pdf",
    type: "PDF",
    size: "1.1 MB",
    chunks: 23,
    status: "ready",
    uploadedAt: "2026-02-23",
    chunkStrategy: "Fixed (512 tokens)",
  },
  {
    id: "3",
    name: "Campbell Biology Ch10.pdf",
    type: "PDF",
    size: "5.8 MB",
    chunks: 112,
    status: "ready",
    uploadedAt: "2026-02-22",
    chunkStrategy: "Semantic",
  },
  {
    id: "4",
    name: "Lab Report Template.docx",
    type: "DOCX",
    size: "340 KB",
    chunks: 0,
    status: "processing",
    uploadedAt: "2026-02-25",
    chunkStrategy: "Fixed (256 tokens)",
  },
  {
    id: "5",
    name: "Midterm Study Guide.txt",
    type: "TXT",
    size: "89 KB",
    chunks: 0,
    status: "pending",
    uploadedAt: "2026-02-25",
    chunkStrategy: "Pending",
  },
  {
    id: "6",
    name: "Corrupted_file.pdf",
    type: "PDF",
    size: "0 KB",
    chunks: 0,
    status: "error",
    uploadedAt: "2026-02-20",
    chunkStrategy: "N/A",
  },
]

function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = {
    ready: { label: "Indexed", icon: CheckCircle2, variant: "default" as const },
    processing: { label: "Processing", icon: Clock, variant: "secondary" as const },
    pending: { label: "Pending", icon: Clock, variant: "outline" as const },
    error: { label: "Error", icon: AlertCircle, variant: "destructive" as const },
  }
  const { label, icon: Icon, variant } = config[status]
  return (
    <Badge variant={variant} className="gap-1 text-xs">
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [detailDoc, setDetailDoc] = useState<DocumentItem | null>(null)

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: documents.length,
    indexed: documents.filter((d) => d.status === "ready").length,
    totalChunks: documents.reduce((acc, d) => acc + d.chunks, 0),
  }

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge variant="secondary" className="gap-1">
            <FolderOpen className="size-3" />
            Document Management
          </Badge>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Upload className="size-3.5" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Upload course materials to be chunked and vectorized for RAG retrieval.
              </DialogDescription>
            </DialogHeader>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
                dragOver
                  ? "border-primary/50 bg-primary/5"
                  : "border-border"
              )}
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Drag and drop files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOCX, TXT up to 50MB each
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Browse Files
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Chunking Strategy</label>
                <Select defaultValue="semantic">
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic Chunking</SelectItem>
                    <SelectItem value="fixed-256">Fixed Size (256 tokens)</SelectItem>
                    <SelectItem value="fixed-512">Fixed Size (512 tokens)</SelectItem>
                    <SelectItem value="fixed-1024">Fixed Size (1024 tokens)</SelectItem>
                    <SelectItem value="paragraph">Paragraph-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Embedding Model</label>
                <Select defaultValue="text-3-small">
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-3-large">text-embedding-3-large</SelectItem>
                    <SelectItem value="ada-002">text-embedding-ada-002</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setUploadOpen(false)}>
                <Cpu className="size-4" />
                Upload & Process
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
              <p className="text-xs text-muted-foreground">Total Documents</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Indexed</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stats.indexed}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">Total Chunks</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stats.totalChunks}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Select defaultValue="all">
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
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Chunks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Strategy</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{doc.size}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {doc.status === "ready" ? doc.chunks : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {doc.chunkStrategy}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Document options">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setDetailDoc(doc)}>
                            <Eye className="size-3.5" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="size-3.5" />
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Layers className="size-3.5" />
                            Re-chunk
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Cpu className="size-3.5" />
                            Re-vectorize
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      {/* Detail Dialog */}
      <Dialog open={!!detailDoc} onOpenChange={() => setDetailDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>{detailDoc?.name}</DialogDescription>
          </DialogHeader>
          {detailDoc && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{detailDoc.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Size</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{detailDoc.size}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Chunks</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{detailDoc.chunks}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={detailDoc.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chunking Strategy</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{detailDoc.chunkStrategy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded</p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{detailDoc.uploadedAt}</p>
                </div>
              </div>

              {detailDoc.status === "ready" && (
                <div>
                  <p className="text-xs text-muted-foreground">Processing Pipeline</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {["Uploaded", "Parsed", "Chunked", "Embedded", "Indexed"].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-accent" />
                        <span className="text-sm text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDoc(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

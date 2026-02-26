"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  SendHorizontal,
  BookOpen,
  FileText,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Reference {
  title: string
  page: string
  snippet: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  references?: Reference[]
  timestamp: string
}

const mockMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Explain the process of photosynthesis and how it relates to cellular respiration.",
    timestamp: "2:30 PM",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. It occurs primarily in the chloroplasts of plant cells and involves two main stages:\n\n**Light-dependent reactions** take place in the thylakoid membranes, where water molecules are split using solar energy, producing ATP and NADPH as energy carriers, along with oxygen as a byproduct.\n\n**The Calvin Cycle** (light-independent reactions) occurs in the stroma, where CO2 is fixed into glucose using the ATP and NADPH from the light reactions.\n\nThe relationship to cellular respiration is essentially reciprocal: photosynthesis produces glucose and oxygen, which are the exact inputs needed for cellular respiration. Conversely, cellular respiration produces CO2 and water, which are the inputs for photosynthesis. This creates a complementary metabolic cycle in ecosystems.",
    references: [
      {
        title: "Biology 101 - Chapter 8: Photosynthesis",
        page: "Pages 142-156",
        snippet: "The light reactions of photosynthesis occur in the thylakoid membranes...",
      },
      {
        title: "Lecture Notes - Week 5: Energy Metabolism",
        page: "Slide 23-31",
        snippet: "Cellular respiration and photosynthesis are complementary processes...",
      },
      {
        title: "Campbell Biology, 12th Edition",
        page: "Chapter 10, p. 201",
        snippet: "The Calvin cycle uses ATP and NADPH to convert CO2 to sugar...",
      },
    ],
    timestamp: "2:30 PM",
  },
]

function ReferenceCard({ reference }: { reference: Reference }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{reference.title}</p>
        <p className="text-xs text-muted-foreground">{reference.page}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {reference.snippet}
        </p>
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="mt-1 size-7 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            <Sparkles className="size-3.5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-2xl", isUser && "max-w-xl")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border text-foreground"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {!isUser && message.references && message.references.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="size-3" />
              Sources ({message.references.length})
            </p>
            <div className="flex flex-col gap-2">
              {message.references.map((ref, i) => (
                <ReferenceCard key={i} reference={ref} />
              ))}
            </div>
          </div>
        )}

        {!isUser && (
          <div className="mt-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-foreground" aria-label="Copy">
                  <Copy className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-foreground" aria-label="Good response">
                  <ThumbsUp className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-foreground" aria-label="Bad response">
                  <ThumbsDown className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bad response</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-foreground" aria-label="Regenerate">
                  <RotateCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerate</TooltipContent>
            </Tooltip>
          </div>
        )}

        <p className={cn("mt-1 text-xs text-muted-foreground", isUser && "text-right")}>
          {message.timestamp}
        </p>
      </div>

      {isUser && (
        <Avatar className="mt-1 size-7 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            JD
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

const suggestions = [
  "Summarize Chapter 8 on Photosynthesis",
  "Create flashcards for this week's lecture",
  "Quiz me on cellular respiration",
  "Explain the Krebs cycle step by step",
]

export default function GeneralChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="size-3" />
            General Chat
          </Badge>
        </div>
        <Badge variant="outline" className="text-xs">
          3 documents indexed
        </Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-3xl px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                How can I help you study?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask questions about your course materials.
              </p>
              <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-lg border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <Textarea
            placeholder="Ask a question about your curriculum..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-10 max-h-36 resize-none"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
          Responses are generated from your uploaded course materials using RAG.
        </p>
      </div>
    </div>
  )
}

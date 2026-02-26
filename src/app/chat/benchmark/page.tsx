"use client";

import {
  BookOpen,
  Copy,
  FileText,
  GitCompareArrows,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SUBJECTS, LEVELS, MODELS, type MODELS_NAMES } from "@/lib/constants";
import { api } from "@/trpc/react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Reference {
  chunkId: string;
  content: string;
  subject?: string;
  level?: string;
  similarity?: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getReferencesForMessage(msg: UIMessage): Reference[] {
  if (msg.role !== "assistant") return [];
  const refs: Reference[] = [];
  for (const part of msg.parts) {
    if (
      "toolCallId" in part &&
      "state" in part &&
      part.state === "output-available" &&
      "output" in part
    ) {
      const toolType = part.type as string;
      if (
        toolType === "tool-getInformation" ||
        (toolType === "dynamic-tool" &&
          "toolName" in part &&
          (part as { toolName: string }).toolName === "getInformation")
      ) {
        const result = (part as { output: unknown }).output;
        if (Array.isArray(result)) {
          for (const item of result as Array<Record<string, unknown>>) {
            refs.push({
              chunkId: (item.chunkId as string) ?? "",
              content:
                typeof item.content === "string"
                  ? item.content.slice(0, 200)
                  : "",
              subject: item.subject as string | undefined,
              level: item.level as string | undefined,
              similarity: item.similarity as number | undefined,
            });
          }
        }
      }
    }
  }
  return refs;
}

const MODEL_ENTRIES = Object.entries(MODELS) as [
  MODELS_NAMES,
  { key: string; label: string },
][];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ReferenceChip({ reference }: { reference: Reference }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all hover:bg-muted/80",
        expanded ? "bg-muted/60" : "bg-muted/30",
      )}
    >
      <FileText className="size-3 shrink-0 text-muted-foreground" />
      {reference.subject && (
        <span className="font-medium">{reference.subject}</span>
      )}
      {reference.level && (
        <span className="text-muted-foreground">{reference.level}</span>
      )}
      {reference.similarity !== undefined && (
        <span className="text-muted-foreground">
          {(reference.similarity * 100).toFixed(0)}%
        </span>
      )}
      {expanded && (
        <span className="ml-1 max-w-xs text-left text-muted-foreground line-clamp-2">
          {reference.content}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);
  const references = getReferencesForMessage(message);

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
              : "border bg-card text-foreground",
          )}
        >
          <div className="whitespace-pre-wrap">{text}</div>
        </div>

        {!isUser && references.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <BookOpen className="size-3" />
              Sources:
            </span>
            {references.map((ref, i) => (
              <ReferenceChip key={ref.chunkId || i} reference={ref} />
            ))}
          </div>
        )}

        {!isUser && (
          <div className="mt-1 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Copy"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(text)}
                >
                  <Copy className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="mt-1 size-7 shrink-0">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            ST
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Panel: one model's response stream                                */
/* ------------------------------------------------------------------ */

function ModelPanel({
  modelName,
  modelLabel,
  messages,
  isLoading,
}: {
  modelName: MODELS_NAMES;
  modelLabel: string;
  messages: UIMessage[];
  isLoading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
        <Badge variant="outline" className="gap-1 text-xs">
          <Sparkles className="size-3" />
          {modelLabel}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="px-4 py-4">
          <div className="flex flex-col gap-4">
            {messages
              .filter((msg) => getMessageText(msg) || msg.role === "user")
              .map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="mt-1 size-7 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    <Sparkles className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl border bg-card px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                    </div>
                    Searching curriculum...
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="mb-2 size-8 opacity-30" />
                <p className="text-sm">Waiting for question...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function BenchmarkPage() {
  const [modelLeft, setModelLeft] = useState<MODELS_NAMES>("gpt_4o_mini");
  const [modelRight, setModelRight] = useState<MODELS_NAMES>("gpt_4o");
  const [subject, setSubject] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Conversation IDs for persistence — created on first send
  const [convIdLeft, setConvIdLeft] = useState<string | null>(null);
  const [convIdRight, setConvIdRight] = useState<string | null>(null);

  const createConversation = api.chat.createConversation.useMutation();
  const addMessage = api.chat.addMessage.useMutation();
  const utils = api.useUtils();

  /* -- Transport for model A (left panel) -- */
  const transportLeft = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          conversationId: convIdLeft ?? undefined,
          subject: subject || undefined,
          level: level || undefined,
          model: MODELS[modelLeft].key,
        },
      }),
    [subject, level, modelLeft, convIdLeft],
  );

  /* -- Transport for model B (right panel) -- */
  const transportRight = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          conversationId: convIdRight ?? undefined,
          subject: subject || undefined,
          level: level || undefined,
          model: MODELS[modelRight].key,
        },
      }),
    [subject, level, modelRight, convIdRight],
  );

  const chatLeft = useChat({
    id: "bench-left",
    transport: transportLeft,
    onFinish: () => {
      void utils.chat.listConversations.invalidate();
    },
  });
  const chatRight = useChat({
    id: "bench-right",
    transport: transportRight,
    onFinish: () => {
      void utils.chat.listConversations.invalidate();
    },
  });

  const isLoadingLeft =
    chatLeft.status === "streaming" || chatLeft.status === "submitted";
  const isLoadingRight =
    chatRight.status === "streaming" || chatRight.status === "submitted";
  const isLoading = isLoadingLeft || isLoadingRight;

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isSending || isLoading) return;
      setIsSending(true);

      const text = input.trim();
      setInput("");

      try {
        // Ensure conversations exist for persistence
        let leftId = convIdLeft;
        let rightId = convIdRight;

        if (!leftId) {
          const conv = await createConversation.mutateAsync({
            title: `[Benchmark] ${MODELS[modelLeft].label}`,
            subject: subject || undefined,
            level: level || undefined,
          });
          leftId = conv!.id;
          setConvIdLeft(leftId);
        }

        if (!rightId) {
          const conv = await createConversation.mutateAsync({
            title: `[Benchmark] ${MODELS[modelRight].label}`,
            subject: subject || undefined,
            level: level || undefined,
          });
          rightId = conv!.id;
          setConvIdRight(rightId);
        }

        // Persist user message to both conversations
        void addMessage.mutateAsync({
          conversationId: leftId,
          role: "user",
          content: text,
        });
        void addMessage.mutateAsync({
          conversationId: rightId,
          role: "user",
          content: text,
        });

        // Fire both model requests simultaneously
        void chatLeft.sendMessage({ text });
        void chatRight.sendMessage({ text });
      } finally {
        setIsSending(false);
      }
    },
    [
      input,
      isSending,
      isLoading,
      chatLeft,
      chatRight,
      convIdLeft,
      convIdRight,
      createConversation,
      addMessage,
      modelLeft,
      modelRight,
      subject,
      level,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClear = useCallback(() => {
    chatLeft.setMessages([]);
    chatRight.setMessages([]);
    setConvIdLeft(null);
    setConvIdRight(null);
  }, [chatLeft, chatRight]);

  return (
    <div className="flex h-full flex-col">
      {/* ---- Top bar ---- */}
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2">
        <Badge className="gap-1" variant="secondary">
          <GitCompareArrows className="size-3" />
          Model Benchmark
        </Badge>

        {/* Subject / Level shared filters */}
        <div className="ml-auto flex items-center gap-2">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
        </div>
      </header>

      {/* ---- Model selectors row ---- */}
      <div className="grid shrink-0 grid-cols-2 border-b">
        {/* Left model selector */}
        <div className="flex items-center gap-2 border-r px-4 py-2">
          <span className="text-muted-foreground text-xs font-medium">
            Model A:
          </span>
          <Select
            value={modelLeft}
            onValueChange={(v) => setModelLeft(v as MODELS_NAMES)}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_ENTRIES.map(([name, m]) => (
                <SelectItem key={name} value={name}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right model selector */}
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="text-muted-foreground text-xs font-medium">
            Model B:
          </span>
          <Select
            value={modelRight}
            onValueChange={(v) => setModelRight(v as MODELS_NAMES)}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODEL_ENTRIES.map(([name, m]) => (
                <SelectItem key={name} value={name}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ---- Side-by-side panels ---- */}
      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="border-r">
          <ModelPanel
            modelName={modelLeft}
            modelLabel={MODELS[modelLeft].label}
            messages={chatLeft.messages}
            isLoading={isLoadingLeft}
          />
        </div>
        <div>
          <ModelPanel
            modelName={modelRight}
            modelLabel={MODELS[modelRight].label}
            messages={chatRight.messages}
            isLoading={isLoadingRight}
          />
        </div>
      </div>

      {/* ---- Shared input ---- */}
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => void handleSend(e)}
        >
          <Textarea
            className="max-h-36 min-h-10 resize-none"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a question to compare model responses side by side..."
            rows={1}
            value={input}
          />
          <Button
            aria-label="Send message"
            disabled={!input.trim() || isLoading || isSending}
            type="submit"
            size="icon"
          >
            <SendHorizontal className="size-4" />
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-muted-foreground text-xs">
          Both models use the same RAG pipeline. Conversations are saved for
          review.
        </p>
      </div>
    </div>
  );
}

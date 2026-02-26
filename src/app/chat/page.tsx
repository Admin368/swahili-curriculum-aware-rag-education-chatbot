"use client";

import {
  BookOpen,
  Copy,
  FileText,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { SUBJECTS, LEVELS } from "@/lib/constants";
import { api } from "@/trpc/react";

interface Reference {
  chunkId: string;
  content: string;
  subject?: string;
  level?: string;
  similarity?: number;
}

/** Helper to extract text content from UIMessage parts */
function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

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

function ChatMessage({
  message,
  references,
}: {
  message: UIMessage;
  references?: Reference[];
}) {
  const isUser = message.role === "user";
  const text = getMessageText(message);

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

        {!isUser && references && references.length > 0 && (
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
          <div className="mt-2 flex items-center gap-1">
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Good response"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  size="icon-sm"
                  variant="ghost"
                >
                  <ThumbsUp className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Good response</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Bad response"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  size="icon-sm"
                  variant="ghost"
                >
                  <ThumbsDown className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bad response</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label="Regenerate"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  size="icon-sm"
                  variant="ghost"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Regenerate</TooltipContent>
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

const suggestions = [
  "Eleza maana ya Historia ya Tanzania",
  "What was the Ngoni migration?",
  "Taja sababu za mwingiliano wa Waafrika",
  "Explain factors for African interactions",
];

export default function GeneralChatPage() {
  const router = useRouter();
  const [subject, setSubject] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const createConversation = api.chat.createConversation.useMutation();
  const addMessage = api.chat.addMessage.useMutation();
  const autoTitle = api.chat.autoTitle.useMutation();
  const utils = api.useUtils();

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        conversationId,
        subject: subject || undefined,
        level: level || undefined,
      },
    }),
    onFinish: () => {
      void utils.chat.listConversations.invalidate();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length === 0) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isSending) return;
      setIsSending(true);

      const messageText = input.trim();
      setInput("");
      let activeConvId = conversationId;

      // Create conversation on first message
      if (!activeConvId) {
        try {
          const conv = await createConversation.mutateAsync({
            subject: subject || undefined,
            level: level || undefined,
          });
          if (conv) {
            activeConvId = conv.id;
            setConversationId(conv.id);

            // Navigate to the conversation URL so messages persist
            router.replace(`/chat/${conv.id}`);

            // Auto-title from first message
            void autoTitle.mutateAsync({
              id: conv.id,
              firstMessage: messageText,
            });
          }
        } catch {
          // Continue without persistence if creation fails
        }
      }

      // Persist user message
      if (activeConvId) {
        void addMessage.mutateAsync({
          conversationId: activeConvId,
          role: "user",
          content: messageText,
        });
      }

      // Send to AI (useChat v6 handles the rest)
      void sendMessage({ text: messageText });
      setIsSending(false);
    },
    [
      input,
      isSending,
      conversationId,
      createConversation,
      autoTitle,
      addMessage,
      sendMessage,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  // Extract references from assistant messages' tool invocations (v6 parts)
  const getReferencesForMessage = (msg: UIMessage): Reference[] => {
    if (msg.role !== "assistant") return [];
    const refs: Reference[] = [];
    for (const part of msg.parts) {
      // In v6, tool parts have type 'tool-${toolName}' or 'dynamic-tool'
      if (
        "toolCallId" in part &&
        "state" in part &&
        part.state === "output-available" &&
        "output" in part
      ) {
        // Check if this is the getInformation tool
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
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge className="gap-1" variant="secondary">
            <Sparkles className="size-3" />
            Elimu AI Chat
          </Badge>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-3xl px-6 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground text-lg">
                Karibu! How can I help you study?
              </h2>
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Ask questions about your curriculum materials in English or
                Swahili.
              </p>
              <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    className="rounded-lg border bg-card p-3 text-left text-muted-foreground text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
                    key={s}
                    onClick={() => setInput(s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages
                .filter((msg) => getMessageText(msg) || msg.role === "user")
                .map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    references={getReferencesForMessage(msg)}
                  />
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
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <form
          className="mx-auto flex max-w-3xl items-end gap-2"
          onSubmit={(e) => void handleSendMessage(e)}
        >
          <Textarea
            className="max-h-36 min-h-10 resize-none"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Uliza swali kuhusu mtaala wako... / Ask a question about your curriculum..."
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
          Majibu yanatokana na vitabu vya mtaala wa Tanzania / Responses
          generated from Tanzanian curriculum materials using RAG.
        </p>
      </div>
    </div>
  );
}

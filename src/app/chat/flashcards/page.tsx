"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Loader2,
  RotateCcw,
  Shuffle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SUBJECTS, LEVELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  source: string;
  mastered: boolean;
}

export default function FlashcardsPage() {
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSource, setShowSource] = useState(false);

  // Form state
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [level, setLevel] = useState<string>(LEVELS[0]);
  const [topic, setTopic] = useState("");
  const [cardCount, setCardCount] = useState("6");

  const generateFlashcards = api.chat.generateFlashcards.useMutation({
    onSuccess: (data) => {
      setCards(data.map((c) => ({ ...c, mastered: false })));
      setCurrentIndex(0);
      setFlipped(false);
      setShowSource(false);
      setStarted(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate flashcards");
    },
  });

  const current = cards[currentIndex];
  const masteredCount = cards.filter((c) => c.mastered).length;
  const progress =
    cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
      setShowSource(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setFlipped(false);
      setShowSource(false);
    }
  };

  const handleMark = (mastered: boolean) => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, mastered } : c)),
    );
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setFlipped(false);
    setShowSource(false);
  };

  const handleRestart = () => {
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setShowSource(false);
    setStarted(false);
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    generateFlashcards.mutate({
      subject,
      level,
      topic: topic.trim(),
      count: parseInt(cardCount),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge className="gap-1" variant="secondary">
            <Layers className="size-3" />
            Flashcards
          </Badge>
        </div>
        {started && (
          <div className="flex items-center gap-3">
            <Badge className="text-xs" variant="outline">
              {masteredCount}/{cards.length} mastered
            </Badge>
            <Button
              aria-label="Shuffle"
              onClick={handleShuffle}
              size="icon-sm"
              variant="ghost"
            >
              <Shuffle className="size-4" />
            </Button>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {!started ? (
            /* Setup */
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Layers className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground text-xl">
                Generate Flashcards
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground text-sm">
                AI will create flashcards from your course materials using
                spaced-repetition principles.
              </p>

              <div className="mt-8 grid w-full max-w-sm gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Subject
                  </label>
                  <Select value={subject} onValueChange={(v) => setSubject(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
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

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Level
                  </label>
                  <Select value={level} onValueChange={(v) => setLevel(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
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

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Topic / Custom Prompt
                  </label>
                  <Input
                    placeholder="e.g. Photosynthesis, Ngoni migration..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Number of Cards
                  </label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 cards</SelectItem>
                      <SelectItem value="12">12 cards</SelectItem>
                      <SelectItem value="20">20 cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="mt-2"
                  onClick={handleGenerate}
                  disabled={generateFlashcards.isPending || !topic.trim()}
                >
                  {generateFlashcards.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Flashcards
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Flashcard */
            <div className="flex flex-col items-center">
              <Progress className="mb-6 h-1.5 w-full" value={progress} />
              <p className="mb-4 text-muted-foreground text-sm">
                Card {currentIndex + 1} of {cards.length}
              </p>

              {/* Card */}
              <button
                aria-label={flipped ? "Show question" : "Show answer"}
                className={cn(
                  "group flex min-h-70 w-full cursor-pointer flex-col justify-center rounded-2xl border p-8 text-left transition-all hover:shadow-md",
                  flipped ? "bg-muted/30" : "bg-card",
                  current?.mastered && "border-accent",
                )}
                onClick={() => setFlipped(!flipped)}
                type="button"
              >
                <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {flipped ? "Answer" : "Question"}
                </p>
                <p className="text-foreground text-lg leading-relaxed">
                  {flipped ? current?.back : current?.front}
                </p>

                {!flipped && (
                  <p className="mt-6 text-muted-foreground text-xs">
                    Click to reveal answer
                  </p>
                )}

                {flipped && showSource && (
                  <div className="mt-4 flex items-center gap-1.5 text-muted-foreground text-xs">
                    <FileText className="size-3" />
                    {current?.source}
                  </div>
                )}
              </button>

              {/* Controls */}
              <div className="mt-6 flex flex-col items-center gap-4">
                {flipped && (
                  <div className="flex items-center gap-3">
                    <Button
                      className="gap-1.5"
                      onClick={() => handleMark(false)}
                      variant="outline"
                    >
                      <XCircle className="size-4 text-destructive" />
                      Still Learning
                    </Button>
                    <Button
                      className="gap-1.5"
                      onClick={() => handleMark(true)}
                    >
                      <CheckCircle2 className="size-4" />
                      Mastered
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    aria-label="Previous card"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  <Button
                    className="gap-1.5 text-xs"
                    onClick={() => setShowSource(!showSource)}
                    size="sm"
                    variant="ghost"
                  >
                    {showSource ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    Source
                  </Button>

                  <Button
                    aria-label="Next card"
                    disabled={currentIndex === cards.length - 1}
                    onClick={handleNext}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                <Button
                  className="text-muted-foreground text-xs"
                  onClick={handleRestart}
                  size="sm"
                  variant="ghost"
                >
                  <RotateCcw className="size-3.5" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

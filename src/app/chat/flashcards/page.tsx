"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Shuffle,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Flashcard {
  id: string
  front: string
  back: string
  source: string
  mastered: boolean
}

const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is the role of chlorophyll in photosynthesis?",
    back: "Chlorophyll absorbs light energy (primarily red and blue wavelengths) and converts it into chemical energy. It is located in the thylakoid membranes of chloroplasts and is essential for the light-dependent reactions.",
    source: "Biology 101 - Chapter 8",
    mastered: false,
  },
  {
    id: "2",
    front: "Define the term 'carbon fixation' in the context of the Calvin Cycle.",
    back: "Carbon fixation is the process by which CO2 from the atmosphere is incorporated into organic molecules (specifically, ribulose bisphosphate) by the enzyme RuBisCO. This is the first step of the Calvin Cycle.",
    source: "Lecture Notes - Week 5",
    mastered: false,
  },
  {
    id: "3",
    front: "What are the products of the light-dependent reactions?",
    back: "The light-dependent reactions produce ATP, NADPH, and O2. ATP and NADPH are used as energy carriers in the Calvin Cycle, while O2 is released as a byproduct of water splitting (photolysis).",
    source: "Campbell Biology - Chapter 10",
    mastered: false,
  },
  {
    id: "4",
    front: "How does chemiosmosis work in chloroplasts?",
    back: "In chloroplasts, the electron transport chain pumps H+ ions into the thylakoid lumen, creating a concentration gradient. H+ ions flow back through ATP synthase, which uses this flow to phosphorylate ADP into ATP (photophosphorylation).",
    source: "Biology 101 - Chapter 8",
    mastered: false,
  },
  {
    id: "5",
    front: "What is the difference between Photosystem I and Photosystem II?",
    back: "Photosystem II (P680) absorbs light at 680nm and splits water to replace lost electrons. Photosystem I (P700) absorbs at 700nm and reduces NADP+ to NADPH. PS II comes first in the electron transport chain despite its numbering.",
    source: "Lecture Notes - Week 5",
    mastered: false,
  },
  {
    id: "6",
    front: "What is photorespiration and why is it a problem?",
    back: "Photorespiration occurs when RuBisCO fixes O2 instead of CO2, producing a toxic 2-carbon compound. It wastes energy and reduces photosynthetic efficiency. C4 and CAM plants have evolved mechanisms to minimize it.",
    source: "Campbell Biology - Chapter 10",
    mastered: false,
  },
]

export default function FlashcardsPage() {
  const [started, setStarted] = useState(false)
  const [cards, setCards] = useState<Flashcard[]>(mockFlashcards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showSource, setShowSource] = useState(false)

  const current = cards[currentIndex]
  const masteredCount = cards.filter((c) => c.mastered).length
  const progress = ((currentIndex + 1) / cards.length) * 100

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1)
      setFlipped(false)
      setShowSource(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setFlipped(false)
      setShowSource(false)
    }
  }

  const handleMark = (mastered: boolean) => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIndex ? { ...c, mastered } : c))
    )
    handleNext()
  }

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setFlipped(false)
    setShowSource(false)
  }

  const handleRestart = () => {
    setCards(mockFlashcards.map((c) => ({ ...c, mastered: false })))
    setCurrentIndex(0)
    setFlipped(false)
    setShowSource(false)
    setStarted(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge variant="secondary" className="gap-1">
            <Layers className="size-3" />
            Flashcards
          </Badge>
        </div>
        {started && (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {masteredCount}/{cards.length} mastered
            </Badge>
            <Button variant="ghost" size="icon-sm" onClick={handleShuffle} aria-label="Shuffle">
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
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Generate Flashcards
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                AI will create flashcards from your course materials using spaced-repetition principles.
              </p>

              <div className="mt-8 grid w-full max-w-sm gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Topic</label>
                  <Select defaultValue="photosynthesis">
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photosynthesis">Photosynthesis</SelectItem>
                      <SelectItem value="cellular-respiration">Cellular Respiration</SelectItem>
                      <SelectItem value="cell-division">Cell Division</SelectItem>
                      <SelectItem value="genetics">Genetics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Number of Cards</label>
                  <Select defaultValue="6">
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

                <Button className="mt-2" onClick={() => setStarted(true)}>
                  Generate Flashcards
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Flashcard */
            <div className="flex flex-col items-center">
              <Progress value={progress} className="mb-6 h-1.5 w-full" />
              <p className="mb-4 text-sm text-muted-foreground">
                Card {currentIndex + 1} of {cards.length}
              </p>

              {/* Card */}
              <button
                onClick={() => setFlipped(!flipped)}
                className={cn(
                  "group w-full cursor-pointer rounded-2xl border p-8 text-left transition-all hover:shadow-md min-h-[280px] flex flex-col justify-center",
                  flipped ? "bg-muted/30" : "bg-card",
                  current.mastered && "border-accent"
                )}
                aria-label={flipped ? "Show question" : "Show answer"}
              >
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {flipped ? "Answer" : "Question"}
                </p>
                <p className="text-lg leading-relaxed text-foreground">
                  {flipped ? current.back : current.front}
                </p>

                {!flipped && (
                  <p className="mt-6 text-xs text-muted-foreground">
                    Click to reveal answer
                  </p>
                )}

                {flipped && showSource && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3" />
                    {current.source}
                  </div>
                )}
              </button>

              {/* Controls */}
              <div className="mt-6 flex flex-col items-center gap-4">
                {flipped && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleMark(false)}
                      className="gap-1.5"
                    >
                      <XCircle className="size-4 text-destructive" />
                      Still Learning
                    </Button>
                    <Button onClick={() => handleMark(true)} className="gap-1.5">
                      <CheckCircle2 className="size-4" />
                      Mastered
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="Previous card"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSource(!showSource)}
                    className="gap-1.5 text-xs"
                  >
                    {showSource ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    Source
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    aria-label="Next card"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm" onClick={handleRestart} className="text-xs text-muted-foreground">
                  <RotateCcw className="size-3.5" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

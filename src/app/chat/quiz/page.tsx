"use client";

import {
  CheckCircle2,
  ChevronRight,
  FileText,
  FlaskConical,
  Loader2,
  RotateCcw,
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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}

export default function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Form state
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [level, setLevel] = useState<string>(LEVELS[0]);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [questionCount, setQuestionCount] = useState("4");

  const generateQuiz = api.chat.generateQuiz.useMutation({
    onSuccess: (data) => {
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setAnsweredCount(0);
      setQuizComplete(false);
      setQuizStarted(true);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate quiz");
    },
  });

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100
      : 0;

  const handleAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnsweredCount((c) => c + 1);
    if (index === currentQuestion?.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredCount(0);
    setQuizComplete(false);
    setQuizStarted(false);
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    generateQuiz.mutate({
      subject,
      level,
      topic: topic.trim(),
      difficulty,
      count: parseInt(questionCount),
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2 pl-10 md:pl-0">
          <Badge className="gap-1" variant="secondary">
            <FlaskConical className="size-3" />
            Quiz Mode
          </Badge>
        </div>
        {quizStarted && !quizComplete && (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">
              {currentIndex + 1} of {questions.length}
            </span>
            <Badge className="text-xs" variant="outline">
              Score: {score}/{answeredCount}
            </Badge>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {!quizStarted ? (
            /* Quiz Setup */
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <FlaskConical className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground text-xl">
                Generate a Quiz
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground text-sm">
                AI will generate questions from your uploaded curriculum
                materials. Choose a topic and difficulty to get started.
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
                    Difficulty
                  </label>
                  <Select
                    value={difficulty}
                    onValueChange={(v) =>
                      setDifficulty(v as "easy" | "medium" | "hard")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-medium text-foreground text-sm">
                    Number of Questions
                  </label>
                  <Select
                    value={questionCount}
                    onValueChange={setQuestionCount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="mt-2"
                  onClick={handleGenerate}
                  disabled={generateQuiz.isPending || !topic.trim()}
                >
                  {generateQuiz.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Quiz
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : quizComplete ? (
            /* Results */
            <div className="flex flex-col items-center pt-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground text-xl">
                Quiz Complete
              </h2>
              <p className="mt-2 text-muted-foreground text-sm">
                You scored {score} out of {questions.length}
              </p>

              <div className="mt-6 w-full max-w-xs">
                <Progress
                  className="h-3"
                  value={(score / questions.length) * 100}
                />
                <p className="mt-2 font-semibold text-2xl text-foreground">
                  {Math.round((score / questions.length) * 100)}%
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <Button onClick={handleRestart} variant="outline">
                  <RotateCcw className="size-4" />
                  Try Again
                </Button>
                <Button onClick={handleRestart}>New Quiz</Button>
              </div>
            </div>
          ) : (
            /* Question */
            <div>
              <Progress className="mb-8 h-1.5" value={progress} />

              <p className="font-medium text-muted-foreground text-xs">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <h3 className="mt-2 font-semibold text-foreground text-lg leading-relaxed">
                {currentQuestion?.question}
              </h3>

              <div className="mt-6 flex flex-col gap-3">
                {currentQuestion?.options.map((option, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === currentQuestion.correctIndex;
                  const showResult = showExplanation;

                  return (
                    <button
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors",
                        !showResult &&
                          "hover:border-foreground/20 hover:bg-muted/50",
                        !showResult &&
                          isSelected &&
                          "border-foreground/30 bg-muted/50",
                        showResult &&
                          isCorrect &&
                          "border-accent bg-accent/10 text-foreground",
                        showResult &&
                          isSelected &&
                          !isCorrect &&
                          "border-destructive bg-destructive/5 text-foreground",
                        showResult && !isSelected && !isCorrect && "opacity-50",
                      )}
                      disabled={showExplanation}
                      key={i}
                      onClick={() => handleAnswer(i)}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border font-medium text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="size-5 shrink-0 text-accent" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="size-5 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className="mt-6 rounded-xl border bg-muted/30 p-4">
                  <p className="font-medium text-foreground text-sm">
                    Explanation
                  </p>
                  <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                    {currentQuestion?.explanation}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-muted-foreground text-xs">
                    <FileText className="size-3" />
                    <span>{currentQuestion?.source}</span>
                  </div>
                  <Button className="mt-4" onClick={handleNext}>
                    {currentIndex < questions.length - 1
                      ? "Next Question"
                      : "See Results"}
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

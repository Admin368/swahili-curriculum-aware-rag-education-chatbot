import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center lg:pt-32">
        <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5 text-sm font-normal">
          <Sparkles className="size-3.5" />
          AI-Powered Education Platform
        </Badge>

        <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Learn smarter with curriculum-aware AI
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Upload your course materials and let AI transform them into personalized study tools. Generate quizzes, flashcards, and summaries grounded in your actual curriculum.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start Learning Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">See How It Works</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-foreground">98%</span>
            <span className="mt-1 text-sm text-muted-foreground">Accuracy Rate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-foreground">50k+</span>
            <span className="mt-1 text-sm text-muted-foreground">Students</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold text-foreground">2x</span>
            <span className="mt-1 text-sm text-muted-foreground">Faster Learning</span>
          </div>
        </div>
      </div>
    </section>
  )
}

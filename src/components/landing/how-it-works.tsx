import { Upload, Cpu, GraduationCap } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Materials",
    description:
      "Upload your syllabi, lecture notes, textbooks, and any course documents. We support PDF, DOCX, and plain text.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processing",
    description:
      "Our pipeline chunks, embeds, and indexes your documents for high-precision retrieval-augmented generation.",
  },
  {
    icon: GraduationCap,
    step: "03",
    title: "Start Learning",
    description:
      "Chat with your materials, generate quizzes, create flashcards, and summarize content. All grounded in your curriculum.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Get started in three steps
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            From document upload to AI-powered study in minutes.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              <span className="font-mono text-sm font-medium text-muted-foreground">{step.step}</span>
              <div className="mt-3 flex size-14 items-center justify-center rounded-2xl border bg-card">
                <step.icon className="size-6 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

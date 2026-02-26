import { MessageSquare, BrainCircuit, FileText, Layers, FlaskConical, BookMarked } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "RAG-Powered Chat",
    description:
      "Ask questions and receive answers grounded in your uploaded curriculum materials, complete with source references.",
  },
  {
    icon: FlaskConical,
    title: "Adaptive Quizzes",
    description:
      "AI generates quizzes directly from your course content, adapting difficulty based on your performance.",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description:
      "Automatically create flashcards from your study materials using spaced-repetition techniques.",
  },
  {
    icon: FileText,
    title: "Document Summarizer",
    description:
      "Condense lengthy documents and lectures into concise, structured summaries you can review quickly.",
  },
  {
    icon: BrainCircuit,
    title: "Curriculum Awareness",
    description:
      "The AI understands your syllabus structure, learning objectives, and how topics relate to each other.",
  },
  {
    icon: BookMarked,
    title: "Document Management",
    description:
      "Upload, organize, chunk, and vectorize your course materials for optimal RAG retrieval performance.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t bg-card py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to study effectively
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Powered by retrieval-augmented generation, every answer is grounded in your actual course material.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-background p-6 transition-colors hover:border-foreground/20"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
                <feature.icon className="size-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

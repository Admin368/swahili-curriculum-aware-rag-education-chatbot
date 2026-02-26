import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="border-t bg-primary py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
          Ready to transform how you study?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/70">
          Join thousands of students already using AI-powered learning tools to study smarter and retain more.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            asChild
          >
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Swahili Chat</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {"Built for students, by students. \u00A9 2026 Swahili Chat."}
          </p>
        </div>
      </div>
    </footer>
  )
}

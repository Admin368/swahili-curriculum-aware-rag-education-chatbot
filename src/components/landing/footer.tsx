import { BookOpen } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link className="flex items-center gap-2" href="/">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Elimu</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="#"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            {"Built for students, by students. \u00A9 2026 Elimu."}
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { BookOpen, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-lg">Elimu</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="#how-it-works"
          >
            How it Works
          </Link>
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="#pricing"
          >
            Pricing
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild size="sm" variant="ghost">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        <Button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          size="icon"
          variant="ghost"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {mobileOpen && (
        <div className="border-t bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              className="text-muted-foreground text-sm"
              href="#features"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              className="text-muted-foreground text-sm"
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
            >
              How it Works
            </Link>
            <Link
              className="text-muted-foreground text-sm"
              href="#pricing"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

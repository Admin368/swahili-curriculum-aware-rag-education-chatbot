"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="text-lg font-semibold text-primary-foreground">Swahili Chat</span>
        </Link>
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-primary-foreground">
            Your AI study companion is waiting.
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/70">
            Pick up where you left off with your personalized learning experience.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">
          {"Trusted by 50,000+ students worldwide"}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Swahili Chat</span>
          </Link>

          <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account to continue learning.
          </p>

          <form className="mt-8 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            <Button className="mt-2 w-full" type="submit">
              Sign In
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" className="w-full">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/signup" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

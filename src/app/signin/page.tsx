"use client";

import { BookOpen, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/chat");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link className="flex items-center gap-2" href="/">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="font-semibold text-lg text-primary-foreground">
            Elimu
          </span>
        </Link>
        <div>
          <h2 className="max-w-md font-semibold text-3xl text-primary-foreground leading-tight">
            Your AI study companion is waiting.
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/70">
            Pick up where you left off with your personalized learning
            experience.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-sm">
          {"Trusted by 50,000+ students worldwide"}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link className="mb-8 flex items-center gap-2 lg:hidden" href="/">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">Elimu</span>
          </Link>

          <h1 className="font-semibold text-2xl text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Sign in to your account to continue learning.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          )}

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                type="email"
                value={email}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-muted-foreground text-xs hover:text-foreground"
                  href="#"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <Button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button className="mt-2 w-full" disabled={loading} type="submit">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">or</span>
            <Separator className="flex-1" />
          </div>

          <Button className="w-full" variant="outline">
            Continue with Google
          </Button> */}

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {"Don't have an account? "}
            <Link
              className="font-medium text-foreground hover:underline"
              href="/signup"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

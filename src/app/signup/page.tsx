"use client";

import { BookOpen, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = api.auth.register.useMutation({
    onSuccess: () => {
      router.push("/signin?registered=1");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    register.mutate({ name, email, password });
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
            Swahili Chat
          </span>
        </Link>
        <div>
          <h2 className="max-w-md font-semibold text-3xl text-primary-foreground leading-tight">
            Start your AI-powered learning journey today.
          </h2>
          <p className="mt-3 max-w-sm text-primary-foreground/70">
            Upload your course materials and transform them into interactive
            study tools.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-sm">
          {"Free to start. No credit card required."}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link className="mb-8 flex items-center gap-2 lg:hidden" href="/">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">
              Swahili Chat
            </span>
          </Link>

          <h1 className="font-semibold text-2xl text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Get started with your free Swahili Chat account.
          </p>

          {error && (
            <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          )}

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                type="text"
                value={name}
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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
              <p className="text-muted-foreground text-xs">
                Must be at least 8 characters with one number.
              </p>
            </div>

            <Button
              className="mt-2 w-full"
              disabled={register.isPending}
              type="submit"
            >
              {register.isPending ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">or</span>
            <Separator className="flex-1" />
          </div>

          <Button className="w-full" variant="outline">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            {"Already have an account? "}
            <Link
              className="font-medium text-foreground hover:underline"
              href="/signin"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

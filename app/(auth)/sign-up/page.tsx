// app/(auth)/sign-up/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogo, GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "Could not create your account.");
      return;
    }

    router.push("/documents");
    router.refresh();
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    await authClient.signIn.social({
      provider,
      callbackURL: "/documents",
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center pb-2 pt-8">
        <Logo href="/" className="pointer-events-none" />
        <p className="mt-1 text-center text-sm text-text-secondary">
          Create an account to start reading with Excerpta.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-8">
        {error && (
          <p
            role="alert"
            className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-text-primary">
              Name
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-primary">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-text-primary">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-text-secondary">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" type="button" onClick={() => handleSocial("google")}>
            <GoogleLogo size={18} weight="bold" />
            Continue with Google
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleSocial("github")}>
            <GithubLogo size={18} weight="bold" />
            Continue with GitHub
          </Button>
        </div>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

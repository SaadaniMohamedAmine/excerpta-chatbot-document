// app/(auth)/forgot-password/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setIsSubmitting(false);

    if (requestError) {
      setError(requestError.message ?? t("forgotPasswordPage.defaultError"));
      return;
    }

    setSubmitted(true);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center pb-2 pt-8">
        <Logo href="/" className="pointer-events-none" />
        <p className="mt-1 text-center text-sm text-text-secondary">{t("forgotPasswordPage.subtitle")}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-8">
        {submitted ? (
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-text-primary">
            {t("forgotPasswordPage.sentMessage")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
              >
                {error}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-text-primary">
                {t("email")}
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
            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? t("forgotPasswordPage.sending") : t("forgotPasswordPage.sendResetLink")}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-text-secondary">
          {t("forgotPasswordPage.rememberedIt")}{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            {t("forgotPasswordPage.backToSignIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

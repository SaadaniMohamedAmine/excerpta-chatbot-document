// app/(auth)/sign-in/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GoogleLogo, GithubLogo } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type ValidationKey } from "@/lib/validation/auth";
import { useFieldValidation } from "@/lib/validation/use-field-validation";

export default function SignInPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { errors, touched, validate, touch, touchAll } = useFieldValidation(signInSchema);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = { email, password };
    touchAll(["email", "password"]);
    if (!validate(values)) return;

    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email(values);

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message ?? t("signInPage.defaultError"));
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
        <p className="mt-1 text-center text-sm text-text-secondary">{t("signInPage.subtitle")}</p>
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-primary">
              {t("email")}
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                touch("email");
                validate({ email, password });
              }}
              aria-invalid={Boolean(touched.email && errors.email)}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-error">{t(`validation.${errors.email as ValidationKey}`)}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">
                {t("password")}
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                {t("signInPage.forgotPassword")}
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                touch("password");
                validate({ email, password });
              }}
              aria-invalid={Boolean(touched.password && errors.password)}
              placeholder="••••••••"
            />
            {touched.password && errors.password && (
              <p className="text-xs text-error">{t(`validation.${errors.password as ValidationKey}`)}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? t("signInPage.signingIn") : t("signIn")}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-text-secondary">{t("or")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" type="button" onClick={() => handleSocial("google")}>
            <GoogleLogo size={18} weight="bold" />
            {t("continueWithGoogle")}
          </Button>
          <Button variant="secondary" type="button" onClick={() => handleSocial("github")}>
            <GithubLogo size={18} weight="bold" />
            {t("continueWithGithub")}
          </Button>
        </div>

        <p className="text-center text-sm text-text-secondary">
          {t("signInPage.newToExcerpta")}{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            {t("signInPage.createAnAccount")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

// app/(auth)/sign-up/page.tsx
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
import { signUpSchema, type ValidationKey } from "@/lib/validation/auth";
import { useFieldValidation } from "@/lib/validation/use-field-validation";

export default function SignUpPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { errors, touched, validate, touch, touchAll } = useFieldValidation(signUpSchema);

  function currentValues() {
    return { name, email, password, confirmPassword };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = currentValues();
    touchAll(["name", "email", "password", "confirmPassword"]);
    if (!validate(values)) return;

    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? t("signUpPage.defaultError"));
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
        <p className="mt-1 text-center text-sm text-text-secondary">{t("signUpPage.subtitle")}</p>
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
            <label htmlFor="name" className="text-sm font-medium text-text-primary">
              {t("signUpPage.name")}
            </label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                touch("name");
                validate(currentValues());
              }}
              aria-invalid={Boolean(touched.name && errors.name)}
              placeholder={t("signUpPage.namePlaceholder")}
            />
            {touched.name && errors.name && (
              <p className="text-xs text-error">{t(`validation.${errors.name as ValidationKey}`)}</p>
            )}
          </div>
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
                validate(currentValues());
              }}
              aria-invalid={Boolean(touched.email && errors.email)}
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-error">{t(`validation.${errors.email as ValidationKey}`)}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-text-primary">
              {t("password")}
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                touch("password");
                validate(currentValues());
              }}
              aria-invalid={Boolean(touched.password && errors.password)}
              placeholder={t("signUpPage.passwordPlaceholder")}
            />
            {touched.password && errors.password && (
              <p className="text-xs text-error">{t(`validation.${errors.password as ValidationKey}`)}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary">
              {t("confirmPassword")}
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => {
                touch("confirmPassword");
                validate(currentValues());
              }}
              aria-invalid={Boolean(touched.confirmPassword && errors.confirmPassword)}
              placeholder={t("signUpPage.confirmPasswordPlaceholder")}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-error">{t(`validation.${errors.confirmPassword as ValidationKey}`)}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="mt-1">
            {isSubmitting ? t("signUpPage.creatingAccount") : t("signUpPage.createAccount")}
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
          {t("signUpPage.alreadyHaveAccount")}{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

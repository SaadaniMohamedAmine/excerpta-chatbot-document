// components/auth/reset-password-form.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ValidationKey } from "@/lib/validation/auth";
import { useFieldValidation } from "@/lib/validation/use-field-validation";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const { errors, touched, validate, touch, touchAll } = useFieldValidation(resetPasswordSchema);

  function currentValues() {
    return { password, confirmPassword };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    touchAll(["password", "confirmPassword"]);
    if (!validate(currentValues())) return;

    setError(null);
    setIsSubmitting(true);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message ?? t("resetPasswordPage.defaultError"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/sign-in"), 2000);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center pb-2 pt-8">
        <Logo href="/" className="pointer-events-none" />
        <p className="mt-1 text-center text-sm text-text-secondary">{t("resetPasswordPage.subtitle")}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-8">
        {!token ? (
          <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
            {t("resetPasswordPage.invalidLink")}{" "}
            <Link href="/forgot-password" className="font-medium underline">
              {t("resetPasswordPage.requestNewOne")}
            </Link>
            .
          </p>
        ) : done ? (
          <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-text-primary">
            {t("resetPasswordPage.updatedMessage")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
            {error && (
              <p
                role="alert"
                className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error"
              >
                {error}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">
                {t("resetPasswordPage.newPassword")}
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
                placeholder="••••••••"
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
                placeholder={t("resetPasswordPage.confirmPasswordPlaceholder")}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-xs text-error">{t(`validation.${errors.confirmPassword as ValidationKey}`)}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? t("resetPasswordPage.updating") : t("resetPasswordPage.updatePassword")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// components/settings/ProfileSection.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileSectionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface ProfileSectionProps {
  user: ProfileSectionUser;
  providers: string[];
}

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  credential: "Email",
  email: "Email",
};

function providerLabel(providerId: string): string {
  return PROVIDER_LABELS[providerId] ?? providerId;
}

export function ProfileSection({ user, providers }: ProfileSectionProps) {
  const t = useTranslations("Settings.profile");
  const tCommon = useTranslations("Common");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [savedName, setSavedName] = useState(user.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("nameRequired"));
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) throw new Error("Failed to save");
      setSavedName(trimmed);
      setIsEditing(false);
    } catch {
      setError(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setName(savedName);
    setError(null);
    setIsEditing(false);
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{t("heading")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-surface">
        <div className="p-4">
          <label htmlFor="settings-name" className="text-sm font-medium text-text-primary">
            {t("nameLabel")}
          </label>
          {isEditing ? (
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="settings-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoFocus
                className="max-w-xs"
              />
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? tCommon("saving") : tCommon("save")}
              </Button>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                {tCommon("cancel")}
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-sm text-text-secondary">{savedName || "—"}</span>
              <Button onClick={() => setIsEditing(true)} size="sm">
                {t("edit")}
              </Button>
            </div>
          )}
          {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        </div>

        <div className="p-4">
          <div className="text-sm font-medium text-text-primary">{t("emailLabel")}</div>
          <div className="mt-1 text-sm text-text-secondary">{user.email}</div>
        </div>

        <div className="p-4">
          <div className="text-sm font-medium text-text-primary">{t("signedInWith")}</div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {providers.length > 0 ? (
              providers.map((providerId) => (
                <Badge key={providerId} variant="outline">
                  {providerLabel(providerId)}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-text-secondary">{t("noProvider")}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

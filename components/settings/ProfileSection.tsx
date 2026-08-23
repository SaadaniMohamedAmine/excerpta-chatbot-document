// components/settings/ProfileSection.tsx
"use client";

import { useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [savedName, setSavedName] = useState(user.name ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name can't be empty.");
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
      setError("Couldn't save your name. Try again.");
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
        <h2 className="text-lg font-semibold text-text-primary">Profile</h2>
        <p className="mt-1 text-sm text-text-secondary">Your name and how you sign in.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="settings-name" className="text-sm font-medium text-text-primary">
          Name
        </label>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              id="settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className="max-w-xs"
            />
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? "Saving…" : "Save"}
            </Button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-primary">{savedName || "—"}</span>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          </div>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">Email</span>
        <span className="text-sm text-text-secondary">{user.email}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">Signed in with</span>
        <div className="flex flex-wrap gap-2">
          {providers.length > 0 ? (
            providers.map((providerId) => (
              <Badge key={providerId} variant="outline">
                {providerLabel(providerId)}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-text-secondary">No linked provider found.</span>
          )}
        </div>
      </div>
    </section>
  );
}

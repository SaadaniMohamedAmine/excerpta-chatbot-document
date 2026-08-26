// components/ui/language-switcher.tsx
"use client";

import * as React from "react";
import { GB, FR } from "country-flag-icons/react/3x2";
import { Check } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Visual only for now — no i18n system wired up yet, this just persists the
// choice locally. Content stays in English until translations exist.
const LANGUAGES = [
  { code: "en", label: "English", Flag: GB },
  { code: "fr", label: "Français", Flag: FR },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "excerpta:language";

export function LanguageSwitcher() {
  const [language, setLanguage] = React.useState<LanguageCode>("en");
  const [mounted, setMounted] = React.useState(false);

  // Same reasoning as ThemeToggle/Sidebar: localStorage isn't available
  // during SSR, so read it post-mount to avoid a hydration mismatch.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(stored);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  const current = LANGUAGES.find((lang) => lang.code === language) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change language"
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-background"
        >
          <current.Flag className="h-4 w-6 rounded-[2px] object-cover" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => {
              setLanguage(lang.code);
              window.localStorage.setItem(STORAGE_KEY, lang.code);
            }}
          >
            <lang.Flag className="h-4 w-6 shrink-0 rounded-[2px] object-cover" />
            <span className="flex-1">{lang.label}</span>
            {lang.code === language && <Check size={16} weight="bold" className="shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

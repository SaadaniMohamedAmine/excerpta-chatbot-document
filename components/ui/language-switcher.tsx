// components/ui/language-switcher.tsx
"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { GB, FR } from "country-flag-icons/react/3x2";
import { Check } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { changeLocale } from "@/lib/actions/locale";
import type { Locale } from "@/i18n/locales";

const LANGUAGES = [
  { code: "en", label: "English", Flag: GB },
  { code: "fr", label: "Français", Flag: FR },
] as const satisfies { code: Locale; label: string; Flag: React.ComponentType<{ className?: string }> }[];

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const [isPending, startTransition] = React.useTransition();

  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("changeLanguage")}
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-background disabled:opacity-50"
        >
          <current.Flag className="h-4 w-6 rounded-[2px] object-cover" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => {
              startTransition(async () => {
                await changeLocale(lang.code);
              });
            }}
          >
            <lang.Flag className="h-4 w-6 shrink-0 rounded-[2px] object-cover" />
            <span className="flex-1">{lang.label}</span>
            {lang.code === locale && <Check size={16} weight="bold" className="shrink-0 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

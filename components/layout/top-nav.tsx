// components/layout/top-nav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Command, Gear, List, SignOut } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession, authClient } from "@/lib/auth-client";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  function openCommandPalette() {
    window.dispatchEvent(new Event("excerpta:open-command-palette"));
  }

  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("openMenu")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary md:hidden"
          >
            <List size={20} weight="regular" />
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label={t("openCommandPalette")}
            title={t("commandPaletteShortcut")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <Command size={20} weight="regular" />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("accountMenu")}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              >
                <Avatar name={user?.name} email={user?.email} size="sm" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email ?? t("account")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full items-center gap-2">
                  <Gear size={16} /> {t("settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={handleSignOut}>
                <SignOut size={16} /> {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

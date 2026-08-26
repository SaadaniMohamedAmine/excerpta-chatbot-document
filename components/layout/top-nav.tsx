// components/layout/top-nav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gear, SignOut } from "@phosphor-icons/react";
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

export function TopNav() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              >
                <Avatar name={user?.name} email={user?.email} size="sm" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email ?? "Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex w-full items-center gap-2">
                  <Gear size={16} /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={handleSignOut}>
                <SignOut size={16} /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

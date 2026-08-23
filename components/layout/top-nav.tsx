// components/layout/top-nav.tsx
"use client";

import { UserCircle } from "@phosphor-icons/react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <Logo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <UserCircle size={22} weight="regular" />
        </Button>
      </div>
    </header>
  );
}

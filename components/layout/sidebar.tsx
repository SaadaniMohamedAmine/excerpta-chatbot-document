// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderStar, Gear } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/collections", label: "Collections", icon: FolderStar },
  { href: "/settings", label: "Settings", icon: Gear },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 flex-col items-center gap-2 border-r border-border bg-surface py-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname?.startsWith(href) ?? false;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary",
              isActive && "bg-primary/10 text-primary"
            )}
          >
            <Icon size={22} weight={isActive ? "fill" : "regular"} />
          </Link>
        );
      })}
    </aside>
  );
}

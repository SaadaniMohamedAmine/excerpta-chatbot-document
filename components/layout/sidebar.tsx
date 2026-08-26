// components/layout/sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  FolderStar,
  Gear,
  ClockCounterClockwise,
  Plus,
  SidebarSimple,
  SignOut,
  CaretUpDown,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSession, authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ACCOUNT_ITEMS = [{ href: "/settings", label: "Settings", icon: Gear }] as const;

const COLLAPSE_STORAGE_KEY = "excerpta:sidebar-collapsed";

export function Sidebar({
  mobileOpen,
  onMobileClose,
  documentCount = 0,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
  documentCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // localStorage isn't available during SSR — reading it here (post-mount)
  // rather than in the useState initializer keeps server and first-client
  // render identical, avoiding a hydration mismatch (same pattern as
  // ThemeToggle's mounted flag).
  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleSignOut() {
    onMobileClose();
    await authClient.signOut();
    router.push("/sign-in");
  }

  const user = session?.user;

  const workspaceItems = [
    { href: "/documents", label: "Documents", icon: FileText, count: documentCount },
    { href: "/collections", label: "Collections", icon: FolderStar },
    { href: "/history", label: "History", icon: ClockCounterClockwise },
  ] as const;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 -translate-x-full flex-col overflow-hidden border-r border-border bg-surface py-4 transition-transform duration-200 ease-in-out",
          mobileOpen && "translate-x-0",
          "md:static md:z-auto md:translate-x-0 md:transition-[width]",
          collapsed ? "md:w-16" : "md:w-64",
          // Avoid a flash of the wrong width before localStorage is read.
          !hydrated && "md:invisible"
        )}
      >
        {/* Mobile-only close button */}
        <div className="mb-2 flex justify-end px-3 md:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <X size={18} weight="regular" />
          </button>
        </div>

        {/* New document CTA */}
        <div className={cn("mb-4 px-3 transition-[padding] duration-200 ease-in-out", collapsed && "px-2")}>
          <Link
            href="/documents"
            onClick={onMobileClose}
            className={cn(
              "flex h-10 items-center justify-center rounded-md bg-primary font-sans text-sm font-medium text-white transition-[width,gap,background-color] duration-200 ease-in-out hover:bg-primary/90",
              collapsed ? "w-10 gap-0" : "w-full gap-2"
            )}
            aria-label="New document"
            title="New document"
          >
            <Plus size={18} weight="bold" className="shrink-0" />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out",
                collapsed ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
              )}
            >
              New document
            </span>
          </Link>
        </div>

      {/* Workspace section */}
      <nav className="flex flex-col gap-1 px-3">
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap px-2 font-sans text-xs font-medium uppercase tracking-wide text-text-secondary transition-[max-height,opacity,margin] duration-200 ease-in-out",
            collapsed ? "max-h-0 opacity-0" : "mb-1 max-h-6 opacity-100"
          )}
        >
          Workspace
        </span>
        {workspaceItems.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onMobileClose}
          />
        ))}
      </nav>

      <div className="mt-4 border-t border-border" />

      {/* Account section */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap px-2 font-sans text-xs font-medium uppercase tracking-wide text-text-secondary transition-[max-height,opacity,margin] duration-200 ease-in-out",
            collapsed ? "max-h-0 opacity-0" : "mb-1 max-h-6 opacity-100"
          )}
        >
          Account
        </span>
        {ACCOUNT_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onMobileClose}
          />
        ))}
      </nav>

      <div className="flex-1" />

      {/* Collapse toggle — desktop only, doesn't apply to the mobile overlay drawer */}
      <div className={cn("mb-2 hidden px-3 transition-[padding] duration-200 ease-in-out md:block", collapsed && "px-2")}>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex h-9 w-full items-center rounded-md text-text-secondary transition-[padding,gap,background-color,color] duration-200 ease-in-out hover:bg-background hover:text-text-primary",
            collapsed ? "justify-center gap-0" : "gap-2 px-2"
          )}
        >
          <SidebarSimple size={18} weight="regular" className="shrink-0" />
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap font-sans text-sm transition-[max-width,opacity] duration-200 ease-in-out",
              collapsed ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
            )}
          >
            Collapse
          </span>
        </button>
      </div>

      {/* Profile block */}
      <div className={cn("border-t border-border px-3 pt-3 transition-[padding] duration-200 ease-in-out", collapsed && "px-2")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center rounded-md py-1.5 text-left transition-[width,padding,gap,background-color] duration-200 ease-in-out hover:bg-background",
                collapsed ? "w-10 justify-center gap-0 px-0" : "w-full gap-2 px-2"
              )}
              aria-label="Account menu"
            >
              <Avatar name={user?.name} email={user?.email} size="sm" className="shrink-0" />
              <div
                className={cn(
                  "flex min-w-0 items-center gap-2 overflow-hidden transition-[max-width,opacity] duration-200 ease-in-out",
                  collapsed ? "max-w-0 opacity-0" : "max-w-[10rem] flex-1 opacity-100"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium text-text-primary">
                    {user?.name || "Account"}
                  </p>
                  <p className="truncate font-sans text-xs text-text-secondary">{user?.email ?? ""}</p>
                </div>
                <CaretUpDown size={14} className="shrink-0 text-text-secondary" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align={collapsed ? "center" : "start"}>
            <DropdownMenuLabel>{user?.email ?? "Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onMobileClose} className="flex w-full items-center gap-2">
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
      </aside>
    </>
  );
}

function SidebarNavItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: { href: string; label: string; icon: React.ElementType; count?: number };
  pathname: string | null;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const isActive = pathname?.startsWith(item.href) ?? false;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      title={item.label}
      className={cn(
        "relative flex h-10 items-center rounded-md text-sm font-medium text-text-secondary transition-[width,padding,gap,background-color,color] duration-200 ease-in-out hover:bg-background hover:text-text-primary",
        collapsed ? "w-10 justify-center gap-0 px-0" : "w-full gap-2.5 px-2.5",
        isActive && "bg-primary/10 text-primary"
      )}
    >
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
      )}
      <Icon size={20} weight={isActive ? "fill" : "regular"} className="shrink-0" />
      <span
        className={cn(
          "flex flex-1 items-center gap-2 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out",
          collapsed ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100"
        )}
      >
        <span className="flex-1 truncate">{item.label}</span>
        {!!item.count && (
          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
            {item.count}
          </Badge>
        )}
      </span>
    </Link>
  );
}

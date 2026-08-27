// components/layout/app-shell.tsx
"use client";

import * as React from "react";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";

export function AppShell({
  children,
  documentCount = 0,
}: {
  children: React.ReactNode;
  documentCount?: number;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col">
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          documentCount={documentCount}
        />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}

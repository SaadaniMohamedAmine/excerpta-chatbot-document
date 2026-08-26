// components/layout/app-shell.tsx
"use client";

import * as React from "react";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen flex-col">
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

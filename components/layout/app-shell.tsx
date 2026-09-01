// components/layout/app-shell.tsx
"use client";

import * as React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TopNav } from "@/components/layout/top-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import type { PlanId } from "@/lib/billing/plans";

export function AppShell({
  children,
  documentCount = 0,
  usage,
}: {
  children: React.ReactNode;
  documentCount?: number;
  usage: { plan: PlanId; used: number; limit: number };
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        documentCount={documentCount}
        usage={usage}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
      <CommandPalette />
      <ToastContainer
        position="top-right"
        theme="light"
        toastClassName="!font-sans !text-sm"
        autoClose={4000}
      />
    </div>
  );
}

// components/settings/SettingsLayout.tsx
"use client";

import { useState } from "react";
import { User, PaintBrush, ShieldWarning, Gear } from "@phosphor-icons/react";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { ProfileSection } from "./ProfileSection";
import { AppearanceSection } from "./AppearanceSection";
import { DangerZoneSection } from "./DangerZoneSection";

interface SettingsUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface SettingsLayoutProps {
  user: SettingsUser;
  providers: string[];
}

type SettingsTab = "profile" | "appearance" | "account";

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: PaintBrush },
  { id: "account", label: "Account", icon: ShieldWarning },
];

export function SettingsLayout({ user, providers }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10 sm:px-6">
      <PageHeaderBanner
        icon={Gear}
        title="Settings"
        subtitle="Manage your profile, appearance, and account."
      />

      <div className="mt-6 flex gap-10">
        <nav className="w-48 shrink-0">
          <ul className="flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-secondary hover:bg-background hover:text-text-primary"
                  }`}
                >
                  <Icon size={16} weight={active ? "fill" : "regular"} />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

        <div className="min-w-0 flex-1">
          {activeTab === "profile" && <ProfileSection user={user} providers={providers} />}
          {activeTab === "appearance" && <AppearanceSection />}
          {activeTab === "account" && <DangerZoneSection userEmail={user.email} />}
        </div>
      </div>
    </div>
  );
}

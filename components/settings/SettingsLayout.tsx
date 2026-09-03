// components/settings/SettingsLayout.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { User, PaintBrush, ShieldWarning, Gear, CreditCard } from "@phosphor-icons/react";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { ProfileSection } from "./ProfileSection";
import { AppearanceSection } from "./AppearanceSection";
import { BillingSection } from "./BillingSection";
import { DangerZoneSection } from "./DangerZoneSection";
import type { PlanId } from "@/lib/billing/plans";

interface SettingsUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface SettingsLayoutProps {
  user: SettingsUser;
  providers: string[];
  usage: { plan: PlanId; used: number; limit: number };
}

type SettingsTab = "profile" | "appearance" | "billing" | "account";

const TAB_IDS: SettingsTab[] = ["profile", "appearance", "billing", "account"];

export function SettingsLayout({ user, providers, usage }: SettingsLayoutProps) {
  const t = useTranslations("Settings");
  const tCommon = useTranslations("Common");

  const TABS: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
    { id: "profile", label: t("tabProfile"), icon: User },
    { id: "appearance", label: t("tabAppearance"), icon: PaintBrush },
    { id: "billing", label: t("tabBilling"), icon: CreditCard },
    { id: "account", label: t("tabAccount"), icon: ShieldWarning },
  ];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const billingToastShown = useRef(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TAB_IDS.includes(tabParam as SettingsTab)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tabParam as SettingsTab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("billing") !== "success" || billingToastShown.current) return;
    billingToastShown.current = true;

    toast.success(tCommon("paymentSuccessful"));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("billing");
    router.replace(`/settings?${params.toString()}`);

    // The plan change lands via Stripe's webhook, not this redirect, so the
    // usage prop above can still be stale for a moment — refetch shortly
    // after so the new plan actually shows instead of the pre-upgrade one.
    const timeout = setTimeout(() => router.refresh(), 1500);
    return () => clearTimeout(timeout);
  }, [searchParams, router, tCommon]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10 sm:px-6">
      <PageHeaderBanner
        icon={Gear}
        title={t("title")}
        subtitle={t("subtitle")}
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
                  className={`relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-secondary hover:bg-background hover:text-text-primary"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                  )}
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
          {activeTab === "billing" && (
            <BillingSection plan={usage.plan} used={usage.used} limit={usage.limit} />
          )}
          {activeTab === "account" && <DangerZoneSection userEmail={user.email} />}
        </div>
      </div>
    </div>
  );
}

// components/onboarding/DashboardTour.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { STATUS, EVENTS, type Step, type EventData, type Locale, type Props as JoyrideProps } from "react-joyride";

// react-joyride v3 exports `Joyride` as a named export, not a default export
// (a break from the 2.x docs/examples still circulating) — next/dynamic needs
// the .then() to resolve it, and the generic pinned explicitly since the
// plain function export isn't typed as a ComponentType on its own.
const Joyride = dynamic<JoyrideProps>(() => import("react-joyride").then((mod) => mod.Joyride), {
  ssr: false,
});

export const WORKSPACE_TOUR_FLAG = "excerpta:continue-tour-in-workspace";

export function DashboardTour({ autoStart }: { autoStart: boolean }) {
  const t = useTranslations("Tour");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const manualTrigger = searchParams.get("tour") === "1";
  const [run, setRun] = useState(false);

  const STEPS: Step[] = [
    {
      target: '[data-tour="sidebar-workspace"]',
      content: t("dashboard.sidebar"),
      placement: "right",
    },
    {
      target: '[data-tour="new-document"]',
      content: t("dashboard.newDocument"),
      placement: "right",
    },
    {
      target: '[data-tour="demo-document-card"]',
      content: t("dashboard.demoDocument"),
      placement: "bottom",
    },
  ];

  const locale: Locale = {
    back: t("buttons.back"),
    close: t("buttons.close"),
    last: t("buttons.last"),
    next: t("buttons.next"),
    nextWithProgress: t.raw("buttons.nextWithProgress"),
    open: t("buttons.open"),
    skip: t("buttons.skip"),
  };

  useEffect(() => {
    if (autoStart || manualTrigger) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRun(true);
      if (manualTrigger) {
        // Strip ?tour=1 so a page refresh doesn't re-trigger it.
        router.replace(pathname);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, manualTrigger]);

  function handleEvent(data: EventData) {
    if (data.type === EVENTS.STEP_AFTER && data.index === STEPS.length - 1) {
      window.sessionStorage.setItem(WORKSPACE_TOUR_FLAG, "1");
    }
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
    }
  }

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      onEvent={handleEvent}
      locale={locale}
      options={{
        primaryColor: "#1E3A8A", // Ink Blue, matches the design system's primary token
        textColor: "#0F172A",
        zIndex: 10000,
        buttons: ["back", "skip", "primary"],
        skipScroll: true,
      }}
    />
  );
}

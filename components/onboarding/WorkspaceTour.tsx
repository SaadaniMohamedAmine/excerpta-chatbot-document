// components/onboarding/WorkspaceTour.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { STATUS, type Step, type EventData, type Props as JoyrideProps } from "react-joyride";
import { WORKSPACE_TOUR_FLAG } from "./DashboardTour";

// See DashboardTour.tsx for why this resolves mod.Joyride (named export in
// v3) with the generic pinned explicitly.
const Joyride = dynamic<JoyrideProps>(() => import("react-joyride").then((mod) => mod.Joyride), {
  ssr: false,
});

const STEPS: Step[] = [
  {
    target: '[data-tour="chat-input"]',
    content:
      'Ask a question about this document — try "What is this guide about?". The answer will cite the exact page it came from, and you can click the citation to jump straight to it.',
    placement: "top",
  },
];

export function WorkspaceTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(WORKSPACE_TOUR_FLAG) === "1") {
      window.sessionStorage.removeItem(WORKSPACE_TOUR_FLAG);
      // Small delay so the chat input has mounted before Joyride looks for it.
      const timer = setTimeout(() => setRun(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleEvent(data: EventData) {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      setRun(false);
    }
  }

  return (
    <Joyride
      steps={STEPS}
      run={run}
      onEvent={handleEvent}
      options={{ primaryColor: "#1E3A8A", zIndex: 10000 }}
    />
  );
}

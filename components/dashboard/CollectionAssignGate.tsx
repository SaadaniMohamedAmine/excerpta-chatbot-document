// components/dashboard/CollectionAssignGate.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CollectionAssignPopup from "./CollectionAssignPopup";

export default function CollectionAssignGate({
  documentId,
  documentTitle,
}: {
  documentId: string;
  documentTitle: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = searchParams.get("assignCollection") === "1" && !dismissed;
  if (!shouldShow) return null;

  function handleDismiss() {
    setDismissed(true);
    // Drop the param so a page refresh doesn't reopen the popup.
    router.replace(pathname, { scroll: false });
  }

  return <CollectionAssignPopup documentId={documentId} documentTitle={documentTitle} onDismiss={handleDismiss} />;
}

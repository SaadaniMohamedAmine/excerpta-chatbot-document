// app/privacy/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const t = await getTranslations("Legal.privacy");
  const sections = t.raw("sections") as { heading: string; paragraphs: string[] }[];

  return <LegalPage title={t("title")} lastUpdated={t("lastUpdated")} sections={sections} />;
}

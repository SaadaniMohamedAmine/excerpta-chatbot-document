// app/terms/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const t = await getTranslations("Legal.terms");
  const sections = t.raw("sections") as { heading: string; paragraphs: string[] }[];

  return <LegalPage title={t("title")} lastUpdated={t("lastUpdated")} sections={sections} />;
}

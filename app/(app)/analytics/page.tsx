// app/(app)/analytics/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  FileText,
  ChatCircleText,
  Quotes,
  FolderStar,
  ChartPieSlice,
  ChartLineUp,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildWeeklyBuckets } from "@/lib/analytics";
import { StatCard } from "@/components/analytics/StatCard";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { DocumentsPerWeekChart } from "@/components/analytics/DocumentsPerWeekChart";
import { BarList } from "@/components/analytics/BarList";

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  csv: "CSV",
  code: "Code",
};

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const t = await getTranslations("Analytics");
  const tDashboard = await getTranslations("Dashboard");
  const userId = session.user.id;

  const [
    documentCount,
    conversationCount,
    collectionCount,
    citedMessages,
    documentDates,
    fileTypeGroups,
    topDocuments,
  ] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.message.findMany({
      where: { role: "assistant", conversation: { userId } },
      select: { citations: true },
    }),
    prisma.document.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.document.groupBy({ by: ["fileType"], where: { userId }, _count: true }),
    prisma.document.findMany({
      where: { userId },
      select: { title: true, _count: { select: { conversations: true } } },
      orderBy: { conversations: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const citationCount = citedMessages.reduce((total, message) => {
    return total + (Array.isArray(message.citations) ? message.citations.length : 0);
  }, 0);

  const weeklyDocuments = buildWeeklyBuckets(documentDates.map((d) => d.createdAt));

  const fileTypeItems = fileTypeGroups
    .map((group) => ({
      label: FILE_TYPE_LABELS[group.fileType] ?? group.fileType,
      value: group._count,
    }))
    .sort((a, b) => b.value - a.value);

  const topDocumentItems = topDocuments
    .filter((doc) => doc._count.conversations > 0)
    .map((doc) => ({ label: doc.title, value: doc._count.conversations }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner icon={ChartLineUp} title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={tDashboard("statDocuments")} value={documentCount} icon={FileText} />
        <StatCard label={tDashboard("statConversations")} value={conversationCount} icon={ChatCircleText} />
        <StatCard label={tDashboard("statCitationsGiven")} value={citationCount} icon={Quotes} />
        <StatCard label={tDashboard("statCollections")} value={collectionCount} icon={FolderStar} />
      </div>

      <div className="mt-4">
        <DocumentsPerWeekChart data={weeklyDocuments} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <BarList
          title={t("fileTypes")}
          icon={ChartPieSlice}
          items={fileTypeItems}
          emptyMessage={t("uploadToSeeThis")}
        />
        <BarList
          title={t("mostActiveDocuments")}
          icon={Trophy}
          items={topDocumentItems}
          emptyMessage={t("startConversationToSeeThis")}
        />
      </div>
    </div>
  );
}

// app/(app)/analytics/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, ChatCircleText, Quotes, FolderStar } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildWeeklyBuckets } from "@/lib/analytics";
import { StatCard } from "@/components/analytics/StatCard";
import { DocumentsPerWeekChart } from "@/components/analytics/DocumentsPerWeekChart";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;

  const [documentCount, conversationCount, collectionCount, citedMessages, documentDates] =
    await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.conversation.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.message.findMany({
        where: { role: "assistant", conversation: { userId } },
        select: { citations: true },
      }),
      prisma.document.findMany({ where: { userId }, select: { createdAt: true } }),
    ]);

  const citationCount = citedMessages.reduce((total, message) => {
    return total + (Array.isArray(message.citations) ? message.citations.length : 0);
  }, 0);

  const weeklyDocuments = buildWeeklyBuckets(documentDates.map((d) => d.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-sans text-xl font-semibold text-text-primary">Analytics</h1>
        <p className="mt-1 font-sans text-sm text-text-secondary">
          A look at how your documents and conversations are adding up.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Documents" value={documentCount} icon={FileText} />
        <StatCard label="Conversations" value={conversationCount} icon={ChatCircleText} />
        <StatCard label="Citations given" value={citationCount} icon={Quotes} />
        <StatCard label="Collections" value={collectionCount} icon={FolderStar} />
      </div>

      <div className="mt-4">
        <DocumentsPerWeekChart data={weeklyDocuments} />
      </div>
    </div>
  );
}

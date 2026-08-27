// app/(app)/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, ChatCircleText, Quotes, FolderStar } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/analytics/StatCard";
import { RecentDocumentsList } from "@/components/dashboard/RecentDocumentsList";
import { RecentConversationsList } from "@/components/dashboard/RecentConversationsList";
import { QuickActions } from "@/components/dashboard/QuickActions";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] || "there";

  const [documentCount, conversationCount, collectionCount, citedMessages, recentDocuments, recentConversations] =
    await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.conversation.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.message.findMany({
        where: { role: "assistant", conversation: { userId } },
        select: { citations: true },
      }),
      prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, fileType: true, status: true, createdAt: true },
      }),
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          document: { select: { id: true, title: true } },
          collection: { select: { id: true, name: true } },
          messages: { orderBy: { createdAt: "asc" }, take: 1 },
        },
      }),
    ]);

  const citationCount = citedMessages.reduce((total, message) => {
    return total + (Array.isArray(message.citations) ? message.citations.length : 0);
  }, 0);

  const recentDocumentItems = recentDocuments.map((d) => ({
    id: d.id,
    title: d.title,
    fileType: d.fileType as "pdf" | "docx" | "csv" | "code",
    status: d.status as "processing" | "ready" | "failed",
    createdAt: d.createdAt.toISOString(),
  }));

  const recentConversationItems = recentConversations
    .map((conversation) => {
      const target = conversation.document
        ? { href: `/documents/${conversation.document.id}`, label: conversation.document.title }
        : conversation.collection
          ? { href: `/collections/${conversation.collection.id}`, label: conversation.collection.name }
          : null;
      if (!target) return null;

      return {
        id: conversation.id,
        href: target.href,
        label: target.label,
        preview: conversation.messages[0]?.content ?? "New conversation",
        createdAt: conversation.createdAt.toISOString(),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="relative overflow-hidden rounded-lg border border-border p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(var(--color-primary)/0.16),_transparent_60%)]"
        />
        <div className="relative">
          <h1 className="font-sans text-xl font-semibold text-text-primary">
            {getGreeting()}, {firstName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 font-sans text-sm text-text-secondary">
            {documentCount} document{documentCount === 1 ? "" : "s"} tracked · {conversationCount}{" "}
            conversation{conversationCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Documents" value={documentCount} icon={FileText} />
        <StatCard label="Conversations" value={conversationCount} icon={ChatCircleText} />
        <StatCard label="Citations given" value={citationCount} icon={Quotes} />
        <StatCard label="Collections" value={collectionCount} icon={FolderStar} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <RecentDocumentsList documents={recentDocumentItems} />
        <RecentConversationsList conversations={recentConversationItems} />
      </div>

      <QuickActions />
    </div>
  );
}

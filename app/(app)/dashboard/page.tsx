// app/(app)/dashboard/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FileText, ChatCircleText, Quotes, FolderStar } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/analytics/StatCard";

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

  const [documentCount, conversationCount, collectionCount, citedMessages] = await Promise.all([
    prisma.document.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.message.findMany({
      where: { role: "assistant", conversation: { userId } },
      select: { citations: true },
    }),
  ]);

  const citationCount = citedMessages.reduce((total, message) => {
    return total + (Array.isArray(message.citations) ? message.citations.length : 0);
  }, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-sans text-xl font-semibold text-text-primary">
          {getGreeting()}, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 font-sans text-sm text-text-secondary">
          {documentCount} document{documentCount === 1 ? "" : "s"} tracked · {conversationCount}{" "}
          conversation{conversationCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Documents" value={documentCount} icon={FileText} />
        <StatCard label="Conversations" value={conversationCount} icon={ChatCircleText} />
        <StatCard label="Citations given" value={citationCount} icon={Quotes} />
        <StatCard label="Collections" value={collectionCount} icon={FolderStar} />
      </div>
    </div>
  );
}

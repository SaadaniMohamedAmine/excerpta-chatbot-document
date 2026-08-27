// app/(app)/history/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      document: { select: { id: true, title: true } },
      collection: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 1 },
    },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        title="History"
        subtitle={
          conversations.length === 0
            ? "No conversations yet."
            : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`
        }
      />

      {conversations.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16 text-center">
          <ClockCounterClockwise size={32} className="text-text-secondary" />
          <p className="font-sans text-sm text-text-secondary">
            Start a conversation from a document or collection to see it here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {conversations.map((conversation) => {
            const target = conversation.document
              ? { href: `/documents/${conversation.document.id}`, label: conversation.document.title }
              : conversation.collection
              ? { href: `/collections/${conversation.collection.id}`, label: conversation.collection.name }
              : null;
            if (!target) return null;

            const preview = conversation.messages[0]?.content ?? "New conversation";

            return (
              <li key={conversation.id}>
                <Link
                  href={target.href}
                  className="flex flex-col gap-1 rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:bg-background"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-sans text-sm font-medium text-text-primary">
                      {target.label}
                    </span>
                    <span className="shrink-0 font-sans text-xs text-text-secondary">
                      {conversation.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-1 font-sans text-sm text-text-secondary">{preview}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

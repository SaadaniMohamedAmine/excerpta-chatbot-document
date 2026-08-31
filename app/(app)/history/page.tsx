// app/(app)/history/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClockCounterClockwise, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeaderBanner } from "@/components/ui/page-header-banner";
import { formatRelativeDate } from "@/lib/format";

interface HistoryEntry {
  id: string;
  href: string;
  label: string;
  preview: string;
  createdAt: Date;
}

function groupByPeriod(entries: HistoryEntry[]) {
  const groups: { label: string; items: HistoryEntry[] }[] = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  const now = Date.now();

  for (const entry of entries) {
    const diffDays = Math.floor((now - entry.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) groups[0].items.push(entry);
    else if (diffDays < 7) groups[1].items.push(entry);
    else groups[2].items.push(entry);
  }

  return groups.filter((group) => group.items.length > 0);
}

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

  const entries: HistoryEntry[] = conversations
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
        createdAt: conversation.createdAt,
      };
    })
    .filter((entry): entry is HistoryEntry => entry !== null);

  const groups = groupByPeriod(entries);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeaderBanner
        icon={ClockCounterClockwise}
        title="History"
        subtitle={
          entries.length === 0
            ? "No conversations yet."
            : `${entries.length} conversation${entries.length === 1 ? "" : "s"}`
        }
      />

      {entries.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16 text-center">
          <ClockCounterClockwise size={32} className="text-text-secondary" />
          <p className="font-sans text-sm text-text-secondary">
            Start a conversation from a document or collection to see it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <h2 className="px-1 font-sans text-xs font-medium uppercase tracking-wide text-text-secondary">
                {group.label}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.items.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={entry.href}
                      className="group flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm shadow-primary/30">
                        <ChatCircleText size={16} weight="duotone" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-sans text-sm font-medium text-text-primary group-hover:text-primary">
                            {entry.label}
                          </span>
                          <span className="shrink-0 font-sans text-xs text-text-secondary">
                            {formatRelativeDate(entry.createdAt.toISOString())}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 font-sans text-sm text-text-secondary">{entry.preview}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// lib/history.ts
//
// Shared by the History page's initial server render and the paginated
// /api/conversations/history route, so both sides build the exact same
// item shape from the exact same Prisma query instead of drifting apart.
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const HISTORY_PAGE_SIZE = 20;

const historyInclude = {
  document: { select: { id: true, title: true } },
  collection: { select: { id: true, name: true } },
  messages: { orderBy: { createdAt: "asc" as const }, take: 1 },
};

type ConversationWithRelations = Prisma.ConversationGetPayload<{ include: typeof historyInclude }>;

export interface HistoryItem {
  id: string;
  href: string;
  label: string;
  preview: string | null;
  createdAt: string;
}

function toHistoryItem(conversation: ConversationWithRelations): HistoryItem | null {
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
    preview: conversation.messages[0]?.content ?? null,
    createdAt: conversation.createdAt.toISOString(),
  };
}

export async function fetchHistoryPage(
  userId: string,
  { cursor, q }: { cursor?: string; q?: string } = {}
): Promise<{ items: HistoryItem[]; nextCursor: string | null }> {
  const conversations = await prisma.conversation.findMany({
    where: {
      userId,
      ...(q
        ? {
            OR: [
              { document: { title: { contains: q, mode: "insensitive" } } },
              { collection: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: historyInclude,
    take: HISTORY_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = conversations.length > HISTORY_PAGE_SIZE;
  const page = hasMore ? conversations.slice(0, HISTORY_PAGE_SIZE) : conversations;
  const items = page.map(toHistoryItem).filter((item): item is HistoryItem => item !== null);

  return { items, nextCursor: hasMore ? page[page.length - 1].id : null };
}

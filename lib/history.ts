// lib/history.ts
//
// Shared by the History page's initial server render and the paginated
// /api/conversations/history route, so both sides build the exact same
// item shape from the exact same Prisma query instead of drifting apart.
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// 12 = a clean 4-per-row x 3-row card grid on desktop.
export const HISTORY_PAGE_SIZE = 12;

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
  { page = 1, q }: { page?: number; q?: string } = {}
): Promise<{ items: HistoryItem[]; totalCount: number }> {
  const where: Prisma.ConversationWhereInput = {
    userId,
    ...(q
      ? {
          OR: [
            { document: { title: { contains: q, mode: "insensitive" } } },
            { collection: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [conversations, totalCount] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: historyInclude,
      take: HISTORY_PAGE_SIZE,
      skip: (page - 1) * HISTORY_PAGE_SIZE,
    }),
    prisma.conversation.count({ where }),
  ]);

  const items = conversations.map(toHistoryItem).filter((item): item is HistoryItem => item !== null);

  return { items, totalCount };
}

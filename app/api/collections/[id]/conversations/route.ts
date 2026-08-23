// app/api/collections/[id]/conversations/route.ts
//
// Collection-scoped twin of app/api/documents/[id]/conversations/route.ts —
// not named in either delegation file, added by analogy since
// ConversationHistoryList calls it for collection-scope history.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conversations = await prisma.conversation.findMany({
    where: { collectionId: id, userId: session.user.id },
    include: { messages: { where: { role: "user" }, orderBy: { createdAt: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    conversations.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      firstMessagePreview: c.messages[0]?.content?.slice(0, 120) ?? "New conversation",
    }))
  );
}

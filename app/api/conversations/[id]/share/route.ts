// app/api/conversations/[id]/share/route.ts
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

async function getOwnedConversation(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) {
    return {
      error: NextResponse.json({ error: "Conversation not found" }, { status: 404 }),
    };
  }
  if (conversation.userId !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { conversation };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getOwnedConversation(id, session.user.id);
  if (result.error) return result.error;
  const { conversation } = result;

  // 122 bits of randomness — not guessable, and collisions are practically
  // impossible at this scale, so no uniqueness-retry loop is needed.
  const shareToken = conversation.shareToken ?? randomUUID().replace(/-/g, "");

  await prisma.conversation.update({
    where: { id },
    data: { isPublic: true, shareToken },
  });

  return NextResponse.json({
    url: `${request.nextUrl.origin}/share/${shareToken}`,
    shareToken,
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getOwnedConversation(id, session.user.id);
  if (result.error) return result.error;

  // Revoke: flip isPublic off. shareToken is intentionally left in place
  // (re-sharing later reuses the same token) rather than nulled —
  // /share/[token] gates strictly on isPublic === true, so a revoked token
  // 404s immediately, and re-sharing brings the SAME URL back to life.
  await prisma.conversation.update({
    where: { id },
    data: { isPublic: false },
  });

  return NextResponse.json({ ok: true });
}

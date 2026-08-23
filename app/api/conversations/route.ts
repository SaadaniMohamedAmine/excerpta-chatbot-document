// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, collectionId } = (await request.json()) as {
    documentId?: string;
    collectionId?: string;
  };

  if (!documentId && !collectionId) {
    return NextResponse.json({ error: "Either documentId or collectionId is required" }, { status: 400 });
  }

  if (documentId) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.userId !== session.user.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
  }
  if (collectionId) {
    const collection = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
  }

  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id, documentId, collectionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}

/**
 * Find-or-create the primary (oldest) conversation for a document or
 * collection, owned by the current user. Query params: `documentId` OR
 * `collectionId` (exactly one). For a document, this returns the same
 * conversation `finalizeStage` auto-created when processing finished —
 * including its welcome message with suggested questions — instead of
 * creating a fresh empty one.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId") ?? undefined;
  const collectionId = searchParams.get("collectionId") ?? undefined;

  if (!documentId && !collectionId) {
    return NextResponse.json(
      { error: "Either documentId or collectionId query param is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.conversation.findFirst({
    where: { userId: session.user.id, documentId, collectionId },
    orderBy: { createdAt: "asc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (existing) {
    return NextResponse.json({ conversation: existing });
  }

  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id, documentId, collectionId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}

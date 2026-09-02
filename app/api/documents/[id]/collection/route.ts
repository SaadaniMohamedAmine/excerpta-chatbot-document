// app/api/documents/[id]/collection/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assignDocumentToCollection } from "@/lib/collections";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    include: { collection: { select: { id: true, name: true, isDefault: true } } },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ collection: document.collection });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = (await request.json()) as { collectionId?: string; newCollectionName?: string };
  const target = body.newCollectionName?.trim()
    ? { newCollectionName: body.newCollectionName.trim() }
    : body.collectionId
    ? { collectionId: body.collectionId }
    : null;

  if (!target) {
    return NextResponse.json({ error: "collectionId or newCollectionName is required" }, { status: 400 });
  }

  try {
    const collection = await assignDocumentToCollection(session.user.id, id, target);
    return NextResponse.json({ collection });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Document or collection not found" }, { status: 404 });
    }
    console.error("[documents/:id/collection] failed:", error);
    return NextResponse.json({ error: "Failed to assign collection" }, { status: 500 });
  }
}

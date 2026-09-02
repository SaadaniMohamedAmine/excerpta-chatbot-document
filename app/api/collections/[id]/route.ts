// app/api/collections/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateDefaultCollection } from "@/lib/collections";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { name } = (await request.json()) as { name?: string };
  const trimmed = name?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
  }

  const collection = await prisma.collection.findFirst({ where: { id, userId: session.user.id } });
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  // Renaming the default collection is explicitly allowed — "My Documents"
  // is only a suggested name at first upload, not a fixed one. isDefault,
  // not the name, is what identifies the fallback collection.
  const updated = await prisma.collection.update({
    where: { id },
    data: { name: trimmed },
  });

  return NextResponse.json({ collection: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const collection = await prisma.collection.findFirst({ where: { id, userId: session.user.id } });
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  if (collection.isDefault) {
    return NextResponse.json(
      { error: "Your default collection can't be deleted — it's where documents fall back to." },
      { status: 400 }
    );
  }

  const documentCount = await prisma.document.count({ where: { collectionId: id } });

  await prisma.$transaction(async (tx) => {
    if (documentCount > 0) {
      // Same helper used by finalize/the demo seed — a default collection
      // is guaranteed to already exist by this point (created at the
      // account's very first document, well before this one could have
      // been moved into the collection being deleted now).
      const fallback = await getOrCreateDefaultCollection(session.user.id);
      await tx.document.updateMany({
        where: { collectionId: id },
        data: { collectionId: fallback.id },
      });
      await tx.user.updateMany({
        where: { id: session.user.id, lastUsedCollectionId: id },
        data: { lastUsedCollectionId: fallback.id },
      });
    }
    await tx.collection.delete({ where: { id } });
  });

  return NextResponse.json({ reassignedCount: documentCount });
}

// app/api/collections/[id]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { documentIds } = (await request.json()) as { documentIds?: string[] };
  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    return NextResponse.json({ error: "documentIds is required" }, { status: 400 });
  }

  // Every document belongs to exactly one collection now, so "adding" a
  // document here MOVES it out of whatever collection it was in before —
  // SECURITY: still scoped to documents the caller actually owns, otherwise
  // this could be used to smuggle another user's document into this
  // collection's chat retrieval scope (queryVector trusts collection
  // membership as-is, see the security note in lib/vector/upstash.ts).
  const { count } = await prisma.$transaction(async (tx) => {
    const result = await tx.document.updateMany({
      where: { id: { in: documentIds }, userId: session.user.id },
      data: { collectionId: collection.id },
    });
    await tx.user.update({
      where: { id: session.user.id },
      data: { lastUsedCollectionId: collection.id },
    });
    return result;
  });

  if (count === 0) {
    return NextResponse.json({ error: "No valid documents to move" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, moved: count }, { status: 201 });
}

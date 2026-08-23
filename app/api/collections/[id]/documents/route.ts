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

  // SECURITY: only attach documents the caller actually owns — otherwise a
  // collection could be used to smuggle another user's document into this
  // collection's chat retrieval scope (queryVector trusts collection
  // membership as-is, see the security note in lib/vector/upstash.ts).
  const ownedDocuments = await prisma.document.findMany({
    where: { id: { in: documentIds }, userId: session.user.id },
    select: { id: true },
  });

  if (ownedDocuments.length === 0) {
    return NextResponse.json({ error: "No valid documents to add" }, { status: 400 });
  }

  await prisma.collectionDocument.createMany({
    data: ownedDocuments.map((d) => ({ collectionId: collection.id, documentId: d.id })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: ownedDocuments.length }, { status: 201 });
}

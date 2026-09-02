// lib/collections.ts
//
// The only place that knows the "default collection" / "last used
// collection" rules — every document belongs to exactly one collection,
// never orphaned.
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const DEFAULT_COLLECTION_NAME = "My Documents";

/**
 * Returns the account's default collection, creating it the first time it's
 * needed (the account's very first document — demo onboarding doc or a real
 * upload, whichever happens first).
 *
 * Race-safe via the partial unique index on (userId) WHERE isDefault: if two
 * requests try to create it at the same time, the loser gets a Prisma P2002
 * and just re-reads the row the winner created.
 */
export async function getOrCreateDefaultCollection(userId: string) {
  const existing = await prisma.collection.findFirst({ where: { userId, isDefault: true } });
  if (existing) return existing;

  try {
    return await prisma.collection.create({
      data: { userId, name: DEFAULT_COLLECTION_NAME, isDefault: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const winner = await prisma.collection.findFirst({ where: { userId, isDefault: true } });
      if (winner) return winner;
    }
    throw error;
  }
}

/**
 * Resolves which collection a new document should be created in, at
 * creation time — before the post-upload popup even has a chance to show.
 * Required because collectionId is a mandatory column: creation can't wait
 * on a non-blocking popup's response.
 *
 * Rule: the last-used collection if it still exists, otherwise the default
 * collection (created on the fly if needed). Shared by both document
 * creation paths (POST /api/documents/finalize and the demo document seeded
 * at onboarding) so this rule lives in exactly one place.
 */
export async function resolveUploadCollectionId(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastUsedCollectionId: true },
  });
  if (user.lastUsedCollectionId) return user.lastUsedCollectionId;

  const defaultCollection = await getOrCreateDefaultCollection(userId);
  await prisma.user.update({
    where: { id: userId },
    data: { lastUsedCollectionId: defaultCollection.id },
  });
  return defaultCollection.id;
}

/**
 * Moves a document into a collection (existing, or a brand new one) and
 * updates lastUsedCollectionId. Used by the post-upload popup (single
 * document) and by the collection-level bulk move endpoint. Verifies both
 * the document and the target collection actually belong to userId before
 * writing anything.
 */
export async function assignDocumentToCollection(
  userId: string,
  documentId: string,
  target: { collectionId: string } | { newCollectionName: string }
) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || document.userId !== userId) {
    throw new Error("NOT_FOUND");
  }

  const collection =
    "collectionId" in target
      ? await prisma.collection.findUnique({ where: { id: target.collectionId } })
      : await prisma.collection.create({ data: { userId, name: target.newCollectionName } });

  if (!collection || collection.userId !== userId) {
    throw new Error("NOT_FOUND");
  }

  await prisma.$transaction([
    prisma.document.update({ where: { id: documentId }, data: { collectionId: collection.id } }),
    prisma.user.update({ where: { id: userId }, data: { lastUsedCollectionId: collection.id } }),
  ]);

  return collection;
}

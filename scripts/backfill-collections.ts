// scripts/backfill-collections.ts
//
// Step 2 of the many-to-many -> one-to-many collections migration. Gives
// every document a single collectionId before that column becomes required.
// Re-runnable safely: only touches documents where collectionId is still
// null, and only creates a default collection if one doesn't already exist.
//
// Unlike a fresh "every document starts unassigned" backfill, this DB
// already has real CollectionDocument (many-to-many) rows from before this
// migration — so a document may already be linked to one or more
// collections. Priority: keep an existing link where there is one (oldest
// link wins if there's more than one) rather than always falling back to
// the default collection.
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const DEFAULT_COLLECTION_NAME = "My Documents";

async function main() {
  const { prisma } = await import("../lib/db");

  const users = await prisma.user.findMany({ select: { id: true } });

  let totalBackfilled = 0;
  for (const { id: userId } of users) {
    const orphanDocuments = await prisma.document.findMany({
      where: { userId, collectionId: null },
      select: {
        id: true,
        collections: {
          select: { collectionId: true, collection: { select: { createdAt: true } } },
        },
      },
    });
    if (orphanDocuments.length === 0) continue;

    let defaultCollection: { id: string; name: string } | null = null;
    const getDefaultCollection = async () => {
      if (defaultCollection) return defaultCollection;
      const existing = await prisma.collection.findFirst({ where: { userId, isDefault: true } });
      defaultCollection = existing ?? (await prisma.collection.create({
        data: { userId, name: DEFAULT_COLLECTION_NAME, isDefault: true },
      }));
      return defaultCollection;
    };

    for (const doc of orphanDocuments) {
      const oldestLink = [...doc.collections].sort(
        (a, b) => a.collection.createdAt.getTime() - b.collection.createdAt.getTime()
      )[0];
      const targetCollectionId = oldestLink?.collectionId ?? (await getDefaultCollection()).id;

      await prisma.document.update({
        where: { id: doc.id },
        data: { collectionId: targetCollectionId },
      });
      totalBackfilled += 1;
    }

    // Only set lastUsedCollectionId if it's still empty — never overwrite a
    // real preference if this script is re-run later.
    const fallback = await getDefaultCollection();
    await prisma.user.updateMany({
      where: { id: userId, lastUsedCollectionId: null },
      data: { lastUsedCollectionId: fallback.id },
    });

    console.log(`[backfill] user ${userId}: ${orphanDocuments.length} document(s) assigned`);
  }

  console.log(`[backfill] done — ${totalBackfilled} document(s) across ${users.length} account(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });

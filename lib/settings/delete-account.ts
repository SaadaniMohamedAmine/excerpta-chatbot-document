// lib/settings/delete-account.ts
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/storage/blob";
import { deleteDocumentVectors } from "@/lib/vector/upstash";

/**
 * Deletes everything owned by a user that a Postgres cascade WON'T reach:
 * files sitting in Vercel Blob storage, and embeddings sitting in Upstash
 * Vector. Prisma's onDelete: Cascade on User's relations (Document,
 * Conversation, Message, Collection, Session, Account) handles every
 * Postgres row once the User row itself is deleted — which is why the
 * User row is deleted LAST, only after the external stores have been
 * given a chance to clear.
 *
 * Reuses lib/storage/blob.ts's deleteFile and lib/vector/upstash.ts's
 * deleteDocumentVectors rather than calling @vercel/blob/Upstash directly
 * — those wrappers already exist and are what the ingestion pipeline
 * (Phase 2) itself uses to write/manage this data.
 *
 * Failure handling: each document's Blob + Vector cleanup is wrapped in
 * its own try/catch so one failure doesn't stop the rest. Failures are
 * collected and logged with enough detail (documentId, which step, and
 * the error) to manually reconcile orphaned Blob files or vector entries
 * afterward. By design, the function proceeds to delete the User row even
 * if some external cleanup failed — a user who explicitly asked to delete
 * their account should not be stuck in limbo because one file failed to
 * delete; an orphaned Blob file or vector entry is a cleanup job, not a
 * reason to block account deletion.
 */

interface DeleteUserDataResult {
  deletedDocumentCount: number;
  blobFailures: Array<{ documentId: string; error: string }>;
  vectorFailures: Array<{ documentId: string; error: string }>;
}

export async function deleteUserData(userId: string): Promise<DeleteUserDataResult> {
  const documents = await prisma.document.findMany({
    where: { userId },
    select: { id: true, fileUrl: true },
  });

  const blobFailures: Array<{ documentId: string; error: string }> = [];
  const vectorFailures: Array<{ documentId: string; error: string }> = [];

  for (const document of documents) {
    try {
      await deleteFile(document.fileUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      blobFailures.push({ documentId: document.id, error: message });
      console.error(
        `[deleteUserData] Failed to delete Blob file for document ${document.id} (user ${userId}):`,
        err
      );
    }

    try {
      await deleteDocumentVectors(document.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      vectorFailures.push({ documentId: document.id, error: message });
      console.error(
        `[deleteUserData] Failed to delete Vector entries for document ${document.id} (user ${userId}):`,
        err
      );
    }
  }

  if (blobFailures.length > 0 || vectorFailures.length > 0) {
    console.error(
      `[deleteUserData] Completed with ${blobFailures.length} Blob failure(s) and ` +
        `${vectorFailures.length} Vector failure(s) for user ${userId}. Proceeding to ` +
        `delete the User row regardless — see failures above for manual cleanup.`,
      { blobFailures, vectorFailures }
    );
  }

  // Cascades (onDelete: Cascade on User's relations) take care of
  // Document/Conversation/Message/Collection/Session/Account rows
  // automatically from here.
  await prisma.user.delete({ where: { id: userId } });

  return {
    deletedDocumentCount: documents.length,
    blobFailures,
    vectorFailures,
  };
}

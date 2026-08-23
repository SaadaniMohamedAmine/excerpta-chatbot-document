// lib/vector/upstash.ts
import { Index } from "@upstash/vector";

export type ChunkMetadata = {
  documentId: string;
  pageNumber: number | null;
  chunkContent: string;
  // Populated only for code-file chunks, e.g. "12-40". Null otherwise.
  lineRange: string | null;
  // Populated only for CSV-file chunks, e.g. "101-150". Null otherwise.
  rowRange: string | null;
};

// Lazy singleton — @upstash/vector's Index constructor throws immediately if
// the env vars are unset, and Next.js evaluates route modules at build time
// (to collect page data) even for routes nothing has called yet. Constructing
// eagerly at module scope would break `npm run build` before Upstash Vector
// is ever configured.
let _vectorIndex: Index<ChunkMetadata> | undefined;
function getVectorIndex(): Index<ChunkMetadata> {
  if (!_vectorIndex) {
    _vectorIndex = new Index<ChunkMetadata>({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }
  return _vectorIndex;
}

export async function upsertChunkVector(
  vectorId: string,
  embedding: number[],
  metadata: ChunkMetadata
): Promise<void> {
  await getVectorIndex().upsert({ id: vectorId, vector: embedding, metadata });
}

/** Batch upsert — use this from the processing pipeline instead of looping upsertChunkVector. */
export async function upsertChunkVectorsBatch(
  items: { vectorId: string; embedding: number[]; metadata: ChunkMetadata }[]
): Promise<void> {
  if (items.length === 0) return;
  await getVectorIndex().upsert(
    items.map((item) => ({ id: item.vectorId, vector: item.embedding, metadata: item.metadata }))
  );
}

export type VectorQueryFilter = {
  /** Scope to a single document (single-document chat). */
  documentId?: string;
  /** Scope to a set of documents (collection chat). Pass an empty array to intentionally match nothing. */
  documentIds?: string[];
};

/**
 * SECURITY NOTE: this is a single shared Upstash Vector index across ALL users and
 * documents — there is no per-tenant index. `queryVector` MUST always be called with
 * a non-empty filter (documentId or a non-empty documentIds list). Calling it with no
 * filter searches every user's vectors and will leak other users' document content
 * into the answer. The chat route enforces this — do not remove that guard.
 */
function buildFilterString(filter?: VectorQueryFilter): string | undefined {
  if (!filter) return undefined;
  if (filter.documentId) {
    return `documentId = '${escapeForFilter(filter.documentId)}'`;
  }
  if (filter.documentIds && filter.documentIds.length > 0) {
    const quoted = filter.documentIds.map((id) => `'${escapeForFilter(id)}'`).join(", ");
    return `documentId in (${quoted})`;
  }
  return undefined;
}

// Prisma cuid()s never contain single quotes, but escape defensively anyway
// since this string is interpolated directly into Upstash's filter query.
function escapeForFilter(value: string): string {
  return value.replace(/'/g, "");
}

export type VectorQueryResult = {
  id: string;
  score: number;
  metadata: ChunkMetadata;
};

export async function queryVector(
  embedding: number[],
  topK: number = 5,
  filter?: VectorQueryFilter
): Promise<VectorQueryResult[]> {
  const filterString = buildFilterString(filter);
  if (!filterString) {
    // No valid scope — return nothing rather than silently searching everything.
    return [];
  }

  const results = await getVectorIndex().query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: filterString,
  });

  return results.map((r) => ({
    id: String(r.id),
    score: r.score,
    metadata: r.metadata as ChunkMetadata,
  }));
}

/**
 * Deletes all vectors for a document via metadata-filter delete. This requires
 * an @upstash/vector SDK version that supports `delete({ filter })` (v1.1+).
 * VERIFY this against your installed version — if `vectorIndex.delete({ filter })`
 * isn't in your version's types, use `deleteVectorsByIds` instead (guaranteed to
 * work on every version): look up the document's Chunk rows in Postgres first
 * (they store `vectorId`), then pass those ids to `deleteVectorsByIds`.
 */
export async function deleteDocumentVectors(documentId: string): Promise<void> {
  await getVectorIndex().delete({ filter: `documentId = '${escapeForFilter(documentId)}'` });
}

/** Guaranteed-compatible fallback: delete by explicit vector id list. */
export async function deleteVectorsByIds(vectorIds: string[]): Promise<void> {
  if (vectorIds.length === 0) return;
  await getVectorIndex().delete(vectorIds);
}

export { getVectorIndex };

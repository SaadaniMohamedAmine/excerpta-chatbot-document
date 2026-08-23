// lib/documents/process.ts
import { prisma } from "@/lib/db";
import { extractText, type ExtractedDocument } from "./extract-text";
import { chunkDocument, type DocumentChunk, type FileType } from "./chunk";
import { getEmbedding, generateAnswer } from "@/lib/ai/orchestrator";
import { upsertChunkVectorsBatch, type ChunkMetadata } from "@/lib/vector/upstash";

const EMBEDDING_CONCURRENCY = 3;

// ---- Stage 1: download the blob + extract text --------------------------------
export async function extractStage(documentId: string): Promise<{
  fileType: FileType;
  extracted: ExtractedDocument;
  userId: string;
}> {
  const document = await prisma.document.findUniqueOrThrow({ where: { id: documentId } });

  const fileResponse = await fetch(document.fileUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download blob for document ${documentId}: ${fileResponse.status}`);
  }
  const buffer = Buffer.from(await fileResponse.arrayBuffer());

  const fileType = document.fileType as FileType;
  // document.title must be the original filename (with extension) — this is
  // what the finalize route requires the client to send.
  const extracted = await extractText(buffer, fileType, document.title);

  return { fileType, extracted, userId: document.userId };
}

// ---- Stage 2: chunk -------------------------------------------------------------
export async function chunkStage(fileType: FileType, extracted: ExtractedDocument): Promise<DocumentChunk[]> {
  const chunks = await chunkDocument(fileType, extracted);
  if (chunks.length === 0) {
    throw new Error("No extractable text content found in document");
  }
  return chunks;
}

// ---- Stage 3: embed each chunk + store vectors and Chunk rows -------------------
export async function embedAndStoreStage(documentId: string, chunks: DocumentChunk[]): Promise<void> {
  const vectorItems: { vectorId: string; embedding: number[]; metadata: ChunkMetadata }[] = [];

  for (let i = 0; i < chunks.length; i += EMBEDDING_CONCURRENCY) {
    const batch = chunks.slice(i, i + EMBEDDING_CONCURRENCY);
    const embeddings = await Promise.all(batch.map((c) => getEmbedding(c.content)));
    batch.forEach((chunk, idxInBatch) => {
      const index = i + idxInBatch;
      vectorItems.push({
        vectorId: `${documentId}_chunk_${index}`,
        embedding: embeddings[idxInBatch],
        metadata: {
          documentId,
          pageNumber: chunk.pageNumber,
          // Upstash Vector metadata has a size ceiling per vector on the free
          // tier — cap the stored excerpt so a very long chunk can't blow it.
          // The FULL chunk content still lives in Postgres (Chunk.content);
          // this truncated copy is only used to build the LLM's context block
          // and citation excerpts directly from the vector query result.
          chunkContent: chunk.content.slice(0, 2000),
          lineRange: chunk.lineRange,
          rowRange: chunk.rowRange,
        },
      });
    });
  }

  await upsertChunkVectorsBatch(vectorItems);

  await prisma.chunk.createMany({
    data: chunks.map((chunk, index) => ({
      documentId,
      content: chunk.content,
      pageNumber: chunk.pageNumber,
      vectorId: `${documentId}_chunk_${index}`,
    })),
  });
}

// ---- Stage 4: finalize — pageCount, suggested questions, status flip -----------
export async function finalizeStage(
  documentId: string,
  userId: string,
  fileType: FileType,
  extracted: ExtractedDocument,
  chunks: DocumentChunk[]
): Promise<string[]> {
  const pageCount = extracted.kind === "pdf" ? extracted.data.pageCount : null;

  const suggestedQuestions = await generateSuggestedQuestions(chunks);

  // Written to two places on purpose: the Document column (added by the
  // cross-phase addendum, so a future Workspace/Dashboard phase can read
  // `document.suggestedQuestions` directly) AND the welcome message below
  // (so the chat UI has clickable suggestion chips without a second fetch).
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "ready", pageCount, suggestedQuestions },
  });

  const welcomeContent =
    suggestedQuestions.length > 0
      ? "Your document is ready. Here are some questions to get you started:\n" +
        suggestedQuestions.map((q) => `- ${q}`).join("\n")
      : "Your document is ready. Ask me anything about it.";

  await prisma.conversation.create({
    data: {
      userId,
      documentId,
      messages: { create: { role: "assistant", content: welcomeContent } },
    },
  });

  return suggestedQuestions;
}

async function generateSuggestedQuestions(chunks: DocumentChunk[]): Promise<string[]> {
  const sample = chunks.slice(0, 8).map((c) => c.content).join("\n\n").slice(0, 6000);

  try {
    const { text } = await generateAnswer(
      [
        {
          role: "system",
          content:
            "You summarize documents and propose questions a reader could ask about them. " +
            "Respond with ONLY a JSON array of 3 to 4 short question strings, no prose, no markdown fences.",
        },
        {
          role: "user",
          content: `Here is an excerpt from a document:\n\n${sample}\n\nPropose 3-4 short, specific questions a reader could ask about this document. Respond with a JSON array of strings only.`,
        },
      ],
      { temperature: 0.4, maxTokens: 300 }
    );

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed.filter((q): q is string => typeof q === "string").slice(0, 4) : [];
  } catch (error) {
    console.warn("[process-document] suggested question generation failed:", error);
    return [];
  }
}

/**
 * Convenience: runs the full pipeline sequentially in one call. Used as the
 * fallback non-Workflow implementation and as the reference the Workflow
 * route's step-by-step version stays equivalent to. On any failure, marks
 * the Document "failed" and swallows the error (callers that need to know
 * about failure should check the returned status).
 */
export async function processDocument(documentId: string): Promise<{
  status: "ready" | "failed";
  suggestedQuestions: string[];
}> {
  try {
    const { fileType, extracted, userId } = await extractStage(documentId);
    const chunks = await chunkStage(fileType, extracted);
    await embedAndStoreStage(documentId, chunks);
    const suggestedQuestions = await finalizeStage(documentId, userId, fileType, extracted, chunks);
    return { status: "ready", suggestedQuestions };
  } catch (error) {
    console.error(`[process-document] failed for ${documentId}:`, error);
    await prisma.document.update({ where: { id: documentId }, data: { status: "failed" } }).catch(() => {});
    return { status: "failed", suggestedQuestions: [] };
  }
}

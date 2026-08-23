// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEmbedding, streamAnswer, type ChatMessage } from "@/lib/ai/orchestrator";
import { queryVector, type VectorQueryResult } from "@/lib/vector/upstash";

const TOP_K = 5;
const HISTORY_LIMIT = 10;

// Accepts either the Vercel AI SDK useChat default POST body ({ id, messages })
// or a direct call shape ({ conversationId, message }).
type ChatRequestBody = {
  id?: string;
  conversationId?: string;
  messages?: { role: string; content: string }[];
  message?: string;
};

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json()) as ChatRequestBody;
  const conversationId = body.conversationId ?? body.id;
  const message = body.message ?? body.messages?.[body.messages.length - 1]?.content;

  if (!conversationId || !message?.trim()) {
    return new Response(JSON.stringify({ error: "conversationId and message are required" }), {
      status: 400,
    });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || conversation.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
  }

  // ---- Load conversation memory (last N messages, oldest first) ----------------
  const priorMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  priorMessages.reverse();

  // ---- Persist the user's message immediately -----------------------------------
  await prisma.message.create({ data: { conversationId, role: "user", content: message } });

  // ---- Resolve retrieval scope + retrieve relevant chunks ------------------------
  // SECURITY: never call queryVector without a real scope — see the note on
  // buildFilterString in lib/vector/upstash.ts. A conversation always has
  // exactly one of documentId/collectionId set by construction; if somehow
  // neither is set, we skip retrieval entirely rather than search the whole
  // (shared, multi-tenant) index.
  let documentIds: string[] | undefined;
  if (conversation.collectionId) {
    const links = await prisma.collectionDocument.findMany({
      where: { collectionId: conversation.collectionId },
    });
    documentIds = links.map((l) => l.documentId);
  }

  const hasScope = Boolean(conversation.documentId) || Boolean(documentIds && documentIds.length > 0);

  let matches: VectorQueryResult[] = [];
  if (hasScope) {
    const embedding = await getEmbedding(message);
    matches = await queryVector(embedding, TOP_K, {
      documentId: conversation.documentId ?? undefined,
      documentIds,
    });
  }

  // ---- Build the prompt -------------------------------------------------------------
  const contextBlock = matches
    .map((m, i) => `[${i + 1}] (${formatSourceLabel(m)}):\n${m.metadata.chunkContent}`)
    .join("\n\n");

  const systemPrompt: ChatMessage = {
    role: "system",
    content:
      "You are Excerpta, a document Q&A assistant. Answer the user's question using ONLY the " +
      "numbered context excerpts below — do not use outside knowledge, and if the context does " +
      "not contain the answer, say you don't have enough information in the document.\n\n" +
      `CONTEXT:\n${contextBlock || "(no relevant context found)"}\n\n` +
      "After your answer, on a new final line, list which numbered excerpts you actually used, " +
      "in exactly this format (and nothing else on that line): SOURCES: [1, 3]\n" +
      "If you used no context, write SOURCES: []",
  };

  const historyMessages: ChatMessage[] = priorMessages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  const llmMessages: ChatMessage[] = [systemPrompt, ...historyMessages, { role: "user", content: message }];

  const { stream: providerStream } = await streamAnswer(llmMessages, { temperature: 0.2, maxTokens: 1024 });

  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let held = "";
      let sourcesDetected = false;
      const marker = "\nSOURCES:";

      try {
        for await (const delta of providerStream) {
          fullText += delta;
          if (sourcesDetected) continue;

          held += delta;
          const idx = held.indexOf(marker);
          if (idx !== -1) {
            // Flush everything up to the marker, then stop forwarding anything else.
            controller.enqueue(encoder.encode(held.slice(0, idx)));
            held = "";
            sourcesDetected = true;
            continue;
          }
          // Only flush the prefix of `held` that CANNOT be the start of the
          // marker — keep the last `marker.length` chars buffered in case the
          // marker is still arriving split across chunks.
          const safeLength = Math.max(0, held.length - marker.length);
          if (safeLength > 0) {
            controller.enqueue(encoder.encode(held.slice(0, safeLength)));
            held = held.slice(safeLength);
          }
        }
        if (!sourcesDetected && held) {
          controller.enqueue(encoder.encode(held));
        }
      } catch (error) {
        console.error("[chat] streaming error:", error);
        controller.enqueue(
          encoder.encode("\n\n[An error occurred while generating the answer. Please try again.]")
        );
      } finally {
        controller.close();
        await persistAssistantMessage(conversationId, fullText, matches).catch((error) => {
          console.error("[chat] failed to persist assistant message:", error);
        });
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function formatSourceLabel(match: VectorQueryResult): string {
  const { pageNumber, lineRange, rowRange } = match.metadata;
  if (pageNumber != null) return `Page ${pageNumber}`;
  if (lineRange) return `Lines ${lineRange}`;
  if (rowRange) return `Rows ${rowRange}`;
  return "Source";
}

export type Citation = { documentId: string; pageNumber: number | null; excerpt: string };

async function persistAssistantMessage(
  conversationId: string,
  fullText: string,
  matches: VectorQueryResult[]
): Promise<void> {
  const sourcesMatch = fullText.match(/SOURCES:\s*\[([^\]]*)\]/i);
  const cleanContent = sourcesMatch ? fullText.slice(0, sourcesMatch.index).trimEnd() : fullText.trim();

  let citations: Citation[] = [];
  if (sourcesMatch) {
    const indices = sourcesMatch[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    citations = indices
      .map((n) => matches[n - 1])
      .filter((m): m is VectorQueryResult => Boolean(m))
      .map((m) => ({
        documentId: m.metadata.documentId,
        pageNumber: m.metadata.pageNumber,
        excerpt: m.metadata.chunkContent.slice(0, 300),
      }));
  }

  await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content: cleanContent || "I wasn't able to generate an answer. Please try again.",
      citations: citations.length > 0 ? citations : undefined,
    },
  });
}

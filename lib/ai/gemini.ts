// lib/ai/gemini.ts
//
// Uses @google/genai (the current unified Google Gen AI SDK), not the
// deprecated @google/generative-ai (EOL 2025-11-30, repo archived). Model
// names are also updated: text-embedding-004 and gemini-1.5-flash were both
// shut down by Google before this file was written — see gemini-embedding-2
// and gemini-3.7-flash below.
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const GEMINI_EMBEDDING_MODEL = "gemini-embedding-2";
export const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-3.7-flash";

// gemini-embedding-2 outputs 3072 dimensions by default (Matryoshka
// representation learning). We pin it down to 768 — Google's own
// recommended truncation tier — to match the Upstash Vector index
// dimension configured in Phase 2 §1.3 (COSINE, dim 768). If you ever
// recreate the Upstash index at a different dimension, update this too —
// they must always match.
export const EMBEDDING_OUTPUT_DIMENSIONALITY = 768;

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await genAI.models.embedContent({
    model: GEMINI_EMBEDDING_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_OUTPUT_DIMENSIONALITY },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error("Gemini returned no embedding values");
  return values;
}

/**
 * Sequential-with-light-concurrency batch embedding. Gemini's free tier has a
 * per-minute rate limit on embedding calls; CONCURRENCY=3 with sequential batches
 * keeps well under it for typical documents. If you see 429s from Gemini during
 * processing of very large documents (80-100 pages, many hundreds of chunks),
 * lower CONCURRENCY or add a small delay between batches.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const CONCURRENCY = 3;
  const embeddings: number[][] = [];
  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const batch = texts.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((t) => generateEmbedding(t)));
    embeddings.push(...results);
  }
  return embeddings;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * @google/genai's chats.create() takes a real `config.systemInstruction`
 * option, so — unlike the old SDK — system messages don't need to be hacked
 * into a prefix on the last user turn. This splits the conversation into a
 * joined system-instruction string, a `history` array (every turn except the
 * last, mapped to Gemini's {role: "user"|"model", parts} shape), and the
 * final turn's raw text to send.
 */
function toGeminiChatInput(messages: ChatMessage[]): {
  systemInstruction: string | undefined;
  history: { role: string; parts: { text: string }[] }[];
  lastText: string;
} {
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const conversational = messages.filter((m) => m.role !== "system");

  const history = conversational.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const last = conversational[conversational.length - 1];

  return {
    systemInstruction: systemParts.length > 0 ? systemParts.join("\n\n") : undefined,
    history,
    lastText: last?.content ?? "",
  };
}

export async function generateChatCompletion(messages: ChatMessage[]): Promise<string> {
  const { systemInstruction, history, lastText } = toGeminiChatInput(messages);
  const chat = genAI.chats.create({
    model: GEMINI_CHAT_MODEL,
    config: systemInstruction ? { systemInstruction } : undefined,
    history,
  });
  const response = await chat.sendMessage({ message: lastText });
  return response.text ?? "";
}

export async function* streamChatCompletion(messages: ChatMessage[]): AsyncGenerator<string> {
  const { systemInstruction, history, lastText } = toGeminiChatInput(messages);
  const chat = genAI.chats.create({
    model: GEMINI_CHAT_MODEL,
    config: systemInstruction ? { systemInstruction } : undefined,
    history,
  });
  const stream = await chat.sendMessageStream({ message: lastText });
  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

export { genAI };

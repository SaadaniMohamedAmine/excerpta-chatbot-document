// lib/chat.ts
//
// Dependency-free chat hook matching our actual /api/chat contract (Phase
// 2): plain-text stream, citations persisted server-side and fetched via a
// GET /api/conversations/:id refetch once the stream ends — NOT the
// Vercel AI SDK's useChat/annotations channel, which assumes a structured
// data-stream protocol our backend deliberately doesn't use (see Phase 2
// §4.2, "Why not streamText()").
"use client";

import { useCallback, useState } from "react";
import type { Citation } from "./citations";

export type ChatUIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export function useDocumentChat(conversationId: string, initialMessages: ChatUIMessage[] = []) {
  const [messages, setMessages] = useState<ChatUIMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMsg: ChatUIMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, message: trimmed }),
        });
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        }

        // Citations aren't carried in the plain-text stream — refetch to
        // pick up the persisted assistant message (with citations) once
        // streaming has finished.
        const convoRes = await fetch(`/api/conversations/${conversationId}`);
        if (convoRes.ok) {
          const { conversation } = await convoRes.json();
          setMessages(
            (conversation?.messages ?? []).map(
              (m: { id: string; role: string; content: string; citations?: Citation[] }) => ({
                id: m.id,
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
                citations: m.citations ?? undefined,
              })
            )
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  return { messages, sendMessage, isLoading };
}

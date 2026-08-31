// components/workspace/ChatPanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChatCircleText } from "@phosphor-icons/react";
import { useDocumentChat, type ChatUIMessage } from "@/lib/chat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import SuggestedQuestions from "./SuggestedQuestions";

interface ChatPanelProps {
  conversationId: string;
  documentTitle: string;
  suggestedQuestions: string[];
  initialMessages: ChatUIMessage[];
  onCitationClick: (pageNumber: number, excerpt: string, documentId?: string) => void;
  /** Only used by the collection workspace, where a single chat spans
   *  multiple source documents and citation tags need a title. */
  resolveDocumentTitle?: (documentId: string) => string | undefined;
}

export default function ChatPanel({
  conversationId,
  suggestedQuestions,
  initialMessages,
  onCitationClick,
  resolveDocumentTitle,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, isLoading } = useDocumentChat(conversationId, initialMessages);
  const [input, setInput] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input;
    setInput("");
    void sendMessage(value);
  };

  const handleSuggestedQuestion = (question: string) => {
    void sendMessage(question);
  };

  const lastMessage = messages[messages.length - 1];
  const isWaitingForFirstToken = isLoading && lastMessage?.role === "assistant" && lastMessage.content === "";

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/30">
              <ChatCircleText size={22} weight="duotone" />
            </span>
            <p className="font-sans text-sm text-text-secondary">Ask a question</p>
            {suggestedQuestions.length > 0 && (
              <SuggestedQuestions questions={suggestedQuestions} onSelect={handleSuggestedQuestion} />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCitationClick={onCitationClick}
                resolveDocumentTitle={resolveDocumentTitle}
              />
            ))}
            {isWaitingForFirstToken && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-3">
                  <span className="h-2 w-2 animate-typing-dot rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-typing-dot rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-typing-dot rounded-full bg-primary" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <ChatInput
        input={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

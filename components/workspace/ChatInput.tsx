// components/workspace/ChatInput.tsx
"use client";

import { useEffect, useRef } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const MAX_HEIGHT_PX = 160;

export default function ChatInput({ input, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border bg-surface px-3 py-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question"
        rows={1}
        disabled={isLoading}
        data-tour="chat-input"
        className="max-h-40 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
      <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send message">
        <PaperPlaneRight className="h-4 w-4" weight="fill" />
      </Button>
    </form>
  );
}

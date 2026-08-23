// components/workspace/SuggestedQuestions.tsx
"use client";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {questions.map((q, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 font-sans text-xs text-text-primary transition-colors hover:border-primary hover:text-primary"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

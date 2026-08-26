// components/ui/reveal.tsx
"use client";

import * as React from "react";
import { useReveal } from "@/lib/use-reveal";
import { cn } from "@/lib/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
}

export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(
  ({ delayMs = 0, className, style, children, ...props }, forwardedRef) => {
    const { ref, visible } = useReveal<HTMLDivElement>();

    return (
      <div
        ref={(node) => {
          ref.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn(
          "h-full transition-all duration-700 ease-out",
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          className
        )}
        style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms", ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Reveal.displayName = "Reveal";

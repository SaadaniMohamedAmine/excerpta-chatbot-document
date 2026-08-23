// components/layout/split-pane.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftClassName?: string;
  rightClassName?: string;
}

export function SplitPane({ left, right, className, leftClassName, rightClassName }: SplitPaneProps) {
  return (
    <div className={cn("flex h-full w-full flex-col md:flex-row", className)}>
      <div
        className={cn(
          "h-1/2 w-full overflow-auto border-b border-border md:h-full md:w-1/2 md:border-b-0 md:border-r",
          leftClassName
        )}
      >
        {left}
      </div>
      <div className={cn("h-1/2 w-full overflow-auto md:h-full md:w-1/2", rightClassName)}>
        {right}
      </div>
    </div>
  );
}

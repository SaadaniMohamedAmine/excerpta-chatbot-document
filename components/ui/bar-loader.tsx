// components/ui/bar-loader.tsx
import type * as React from "react";
import { cn } from "@/lib/utils";

export function BarLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const bar = "w-2 animate-eq-bar rounded-full bg-primary/50 motion-reduce:animate-none";

  return (
    <div role="status" aria-label="Loading" className={cn("flex items-center gap-2", className)} {...props}>
      <span className={cn("h-9", bar)} />
      <span className={cn("h-16", bar)} style={{ animationDelay: "0.25s" }} />
      <span className={cn("h-9", bar)} style={{ animationDelay: "0.5s" }} />
    </div>
  );
}

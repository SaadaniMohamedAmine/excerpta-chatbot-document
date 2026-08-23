// components/ui/logo.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/documents",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("font-serif text-xl font-semibold tracking-tight text-primary", className)}
    >
      Excerpta
    </Link>
  );
}

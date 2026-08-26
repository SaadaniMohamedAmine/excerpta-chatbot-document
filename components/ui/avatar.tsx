// components/ui/avatar.tsx
import { cn } from "@/lib/utils";

function getInitials(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase() || "?";
  }
  return source[0]?.toUpperCase() ?? "?";
}

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function Avatar({ name, email, size = "md", className }: AvatarProps) {
  const initials = getInitials(name, email);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-sans font-semibold text-white",
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm",
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

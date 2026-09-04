// components/ui/avatar.tsx
"use client";

import { useState } from "react";
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
  // Set for Google/GitHub sign-ins (their OAuth profile picture); null/unset
  // for email+password accounts, which have no picture to show — initials
  // stay the fallback for both that case and a broken/expired image URL.
  image?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function Avatar({ name, email, image, size = "md", className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name, email);
  const sizeClasses = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", sizeClasses, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-sans font-semibold text-white",
        sizeClasses,
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

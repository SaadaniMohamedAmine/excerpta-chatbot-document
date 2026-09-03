// lib/format.ts
type RelativeDateLabels = (
  key: "today" | "yesterday" | "daysAgo" | "weeksAgo",
  values?: { count: number }
) => string;

export function formatRelativeDate(iso: string, t: RelativeDateLabels, locale: string): string {
  const date = new Date(iso);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return t("today");
  if (diffDays === 1) return t("yesterday");
  if (diffDays < 7) return t("daysAgo", { count: diffDays });
  if (diffDays < 30) return t("weeksAgo", { count: Math.floor(diffDays / 7) });
  return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

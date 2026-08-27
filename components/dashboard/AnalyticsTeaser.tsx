// components/dashboard/AnalyticsTeaser.tsx
import Link from "next/link";
import { ChartLineUp, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function AnalyticsTeaser({
  conversationCount,
  citationCount,
}: {
  conversationCount: number;
  citationCount: number;
}) {
  return (
    <Link
      href="/analytics"
      className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <ChartLineUp size={22} weight="duotone" />
        </span>
        <div>
          <h3 className="font-sans text-sm font-medium text-text-primary group-hover:text-primary">
            See your analytics
          </h3>
          <p className="mt-0.5 font-sans text-xs text-text-secondary">
            {conversationCount} conversation{conversationCount === 1 ? "" : "s"} · {citationCount} citation
            {citationCount === 1 ? "" : "s"} given
          </p>
        </div>
      </div>
      <ArrowRight
        size={18}
        className="shrink-0 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary"
      />
    </Link>
  );
}

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
      className="group relative flex cursor-pointer flex-col gap-3 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-surface to-background p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-primary to-gold/60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(var(--color-primary)/0.18),_transparent_60%),radial-gradient(ellipse_at_bottom_left,_rgb(var(--color-gold)/0.1),_transparent_55%)]"
      />
      <div className="relative flex items-center justify-between">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-md shadow-primary/30 transition-transform group-hover:scale-105">
          <ChartLineUp size={22} weight="duotone" />
        </span>
        <ArrowRight
          size={18}
          className="shrink-0 text-text-secondary transition-transform group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
      <div className="relative">
        <h3 className="font-sans text-sm font-medium text-text-primary group-hover:text-primary">
          See your analytics
        </h3>
        <p className="mt-1 font-sans text-xs text-text-secondary">
          {conversationCount} conversation{conversationCount === 1 ? "" : "s"} · {citationCount} citation
          {citationCount === 1 ? "" : "s"} given
        </p>
      </div>
    </Link>
  );
}

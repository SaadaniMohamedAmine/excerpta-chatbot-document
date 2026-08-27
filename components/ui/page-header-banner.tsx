// components/ui/page-header-banner.tsx
export function PageHeaderBanner({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(var(--color-primary)/0.16),_transparent_60%)]"
      />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl font-semibold text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 font-sans text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

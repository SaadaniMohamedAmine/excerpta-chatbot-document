// components/ui/page-header-banner.tsx
export function PageHeaderBanner({
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border p-6">
      {/* Signature accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary via-primary/50 to-gold/40"
      />

      {/* Two-point ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgb(var(--color-primary)/0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgb(var(--color-gold)/0.08),_transparent_50%)]"
      />

      {/* Decorative oversized watermark of the page's own icon */}
      {Icon && (
        <Icon
          aria-hidden="true"
          weight="fill"
          size={176}
          className="pointer-events-none absolute -right-8 -top-10 text-primary/[0.05]"
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/30">
              <Icon size={26} weight="duotone" />
            </span>
          )}
          <div>
            <h1 className="font-sans text-xl font-semibold text-text-primary">{title}</h1>
            {subtitle && <p className="mt-1 font-sans text-sm text-text-secondary">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

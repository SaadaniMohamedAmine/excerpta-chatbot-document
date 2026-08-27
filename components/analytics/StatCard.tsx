// components/analytics/StatCard.tsx
export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
      <div>
        <p className="font-sans text-xs text-text-secondary">{label}</p>
        <p className="mt-1 font-sans text-2xl font-semibold text-text-primary">{value}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={18} weight="regular" />
      </span>
    </div>
  );
}

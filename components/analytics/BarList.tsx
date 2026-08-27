// components/analytics/BarList.tsx
export interface BarListItem {
  label: string;
  value: number;
}

export function BarList({
  title,
  icon: Icon,
  items,
  emptyMessage,
}: {
  title: string;
  icon: React.ElementType;
  items: BarListItem[];
  emptyMessage?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-text-secondary" />
        <h2 className="font-sans text-sm font-medium text-text-primary">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-text-secondary">{emptyMessage ?? "Nothing yet."}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex items-center justify-between gap-2 font-sans text-sm">
                <span className="truncate text-text-primary">{item.label}</span>
                <span className="shrink-0 text-text-secondary">{item.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

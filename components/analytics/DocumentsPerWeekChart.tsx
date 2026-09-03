// components/analytics/DocumentsPerWeekChart.tsx
"use client";

import { useTranslations } from "next-intl";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface WeekPoint {
  label: string;
  count: number;
}

export function DocumentsPerWeekChart({ data }: { data: WeekPoint[] }) {
  const t = useTranslations("Analytics");

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="font-sans text-sm font-medium text-text-primary">{t("documentsPerWeek")}</h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgb(var(--color-border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgb(var(--color-text-secondary))", fontSize: 11 }}
              axisLine={{ stroke: "rgb(var(--color-border))" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgb(var(--color-text-secondary))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip t={t} />} cursor={{ stroke: "rgb(var(--color-border))" }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="rgb(var(--color-primary))"
              strokeWidth={2}
              strokeLinecap="round"
              dot={{ r: 4, fill: "rgb(var(--color-primary))", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  t,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  t: ReturnType<typeof useTranslations<"Analytics">>;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="font-sans text-xs text-text-secondary">{label}</p>
      <p className="font-sans text-sm font-medium text-text-primary">{t("documentCount", { count: value })}</p>
    </div>
  );
}

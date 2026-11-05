"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { Table2 } from "lucide-react";
import { seriesColor, useChartTokens } from "./useChartTokens";

export type Series = { key: string; label: string };

/**
 * Minimal multi-series line chart: thin 2px lines, hairline grid, crosshair tooltip, a legend,
 * direct end-of-line labels (≤5 series), and a table view toggle for accessibility.
 */
export function LineChartCard({
  data,
  series,
  xKey,
  xLabel,
  yLabel,
  invertY,
  yDomain,
  height = 300,
  caption,
  xPrefix = "",
}: {
  data: Record<string, number | string | null>[];
  series: Series[];
  xKey: string;
  xLabel: string;
  yLabel: string;
  invertY?: boolean;
  yDomain?: [number, number];
  height?: number;
  caption: string;
  /** Prefix for x-axis tick labels, e.g. "R" for rounds (plain data, so servers can pass it). */
  xPrefix?: string;
}) {
  const t = useChartTokens();
  const [table, setTable] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const fx = (v: string | number) => `${xPrefix}${v}`;

  const TooltipBody = ({ active, payload, label }: TooltipContentProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload as Record<string, unknown>;
    return (
      <div className="card min-w-44 px-3 py-2 text-xs">
        <p className="mb-1 font-medium text-ink">{row.label ? String(row.label) : fx(label as string)}</p>
        {[...payload]
          .sort((a, b) => (invertY ? Number(a.value) - Number(b.value) : Number(b.value) - Number(a.value)))
          .map((p) => (
            <p key={String(p.dataKey)} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-body">
                <span className="inline-block h-0.5 w-3 rounded" style={{ background: p.color }} />
                {series.find((s) => s.key === p.dataKey)?.label}
              </span>
              <span className="tnum font-medium text-ink">{invertY ? `P${p.value}` : p.value}</span>
            </p>
          ))}
      </div>
    );
  };

  const last = data[data.length - 1];
  // Direct end labels, skipping any that would collide with a label already placed (legend still identifies them).
  const labelled = new Set<string>();
  {
    const ends = series
      .filter((s) => !hidden.has(s.key) && typeof last?.[s.key] === "number")
      .map((s) => ({ key: s.key, v: last[s.key] as number }));
    const values = data.flatMap((row) => series.map((s) => row[s.key])).filter((v): v is number => typeof v === "number");
    const gap = (Math.max(...values, 1) - Math.min(...values, 0)) * 0.05;
    const placed: number[] = [];
    for (const e of ends) if (placed.every((p) => Math.abs(p - e.v) >= gap)) {
      placed.push(e.v);
      labelled.add(e.key);
    }
  }

  return (
    <figure className="card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legend (click to toggle)">
          {series.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setHidden((h) => { const n = new Set(h); if (n.has(s.key)) n.delete(s.key); else n.add(s.key); return n; })}
                aria-pressed={!hidden.has(s.key)}
                className={`flex items-center gap-1.5 rounded ${hidden.has(s.key) ? "opacity-40" : ""}`}
              >
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: seriesColor(t, i) }} />
                <span className="text-body">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setTable((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-body hover:text-ink"
          aria-pressed={table}
        >
          <Table2 className="size-3.5" strokeWidth={1.5} aria-hidden /> {table ? "Show chart" : "Show table"}
        </button>
      </div>

      {table ? (
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full text-xs">
            <caption className="sr-only">{caption}</caption>
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line text-left text-muted-strong">
                <th className="py-1.5 pr-3 font-medium">{xLabel}</th>
                {series.map((s) => (
                  <th key={s.key} className="py-1.5 pr-3 text-right font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="py-1 pr-3">{row.label ? String(row.label) : fx(row[xKey] as string)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="tnum py-1 pr-3 text-right">
                      {row[s.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height }} role="img" aria-label={caption}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: series.length <= 5 ? 92 : 16, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={t["--grid"]} strokeWidth={1} vertical={false} />
              <XAxis
                dataKey={xKey}
                tickFormatter={fx}
                tick={{ fontSize: 11, fill: t["--muted-strong"] }}
                tickLine={false}
                axisLine={{ stroke: t["--axis"] }}
                minTickGap={16}
              />
              <YAxis
                reversed={invertY}
                domain={yDomain ?? ["auto", "auto"]}
                ticks={invertY && yDomain ? [1, ...Array.from({ length: Math.floor(yDomain[1] / 5) }, (_, k) => (k + 1) * 5)] : undefined}
                interval={invertY ? 0 : "preserveEnd"}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: t["--muted-strong"] }}
                tickLine={false}
                axisLine={false}
                width={36}
                label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: t["--muted-strong"], dx: 4 }}
              />
              <Tooltip content={(p) => <TooltipBody {...(p as TooltipContentProps<number, string>)} />} cursor={{ stroke: t["--axis"], strokeWidth: 1 }} />
              {series.map((s, i) =>
                hidden.has(s.key) ? null : (
                  <Line
                    key={s.key}
                    // Rankings are discrete: straight segments, so curves never overshoot past P1.
                    type={invertY ? "linear" : "monotone"}
                    dataKey={s.key}
                    stroke={seriesColor(t, i)}
                    strokeWidth={2}
                    dot={data.length <= 24 ? { r: 2.5, strokeWidth: 0, fill: seriesColor(t, i) } : false}
                    activeDot={{ r: 4.5, stroke: t["--surface"], strokeWidth: 2 }}
                    connectNulls
                    isAnimationActive={false}
                    label={
                      series.length <= 5
                        ? (props: { x?: number | string; y?: number | string; index?: number }) =>
                            props.index === data.length - 1 && labelled.has(s.key) ? (
                              <text x={Number(props.x) + 8} y={Number(props.y) + 4} fontSize={11} fill={t["--ink"]}>
                                {s.label.split(" ").at(-1)}
                              </text>
                            ) : (
                              <g />
                            )
                        : undefined
                    }
                  />
                ),
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <figcaption className="mt-2 text-xs text-muted-strong">{caption}</figcaption>
    </figure>
  );
}

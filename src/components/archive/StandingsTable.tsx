"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { EntityRef } from "@/lib/archive/entities";
import { cn } from "@/lib/utils";
import { EntityLink } from "./EntityLink";

export type Cell = {
  /** Value used for sorting. */
  sort: number | string | null;
  display?: string;
  entity?: EntityRef;
  /** Extra entities shown after the main one (e.g. a driver's second team). */
  more?: EntityRef[];
  /** Small colored mark before the cell (team color). */
  swatch?: string;
  muted?: boolean;
};
export type Column = { key: string; label: string; numeric?: boolean; primary?: boolean; hideOnMobile?: boolean; srLabel?: string };
export type Row = { key: string; cells: Record<string, Cell>; highlight?: boolean };

/**
 * Sortable table with a sticky header. Below `sm` it becomes a list of stacked cards.
 * All cell content is plain data so server components can build it.
 */
export function StandingsTable({
  columns,
  rows,
  caption,
  initialSort,
  dense,
}: {
  columns: Column[];
  rows: Row[];
  caption: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  dense?: boolean;
}) {
  const [sort, setSort] = useState(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a.cells[sort.key]?.sort;
      const y = b.cells[sort.key]?.sort;
      if (x === y) return 0;
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;
      return (x < y ? -1 : 1) * dir;
    });
  }, [rows, sort]);

  const toggle = (key: string, numeric?: boolean) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: numeric && key !== "pos" ? "desc" : "asc" }));

  const renderCell = (c: Cell | undefined) => {
    if (!c) return <span className="text-muted">—</span>;
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-x-1.5", c.muted && "text-muted-strong")}>
        {c.swatch && <span aria-hidden className="inline-block h-3 w-1 rounded-full" style={{ background: c.swatch }} />}
        {c.entity ? <EntityLink entity={c.entity}>{c.display ?? c.entity.label}</EntityLink> : (c.display ?? (c.sort === null ? "—" : String(c.sort)))}
        {c.more?.map((m) => (
          <span key={m.href} className="text-muted-strong">
            / <EntityLink entity={m} className="text-body" />
          </span>
        ))}
      </span>
    );
  };

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="card hidden max-h-[640px] overflow-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
            <tr className="border-b border-line">
              {columns.map((col) => {
                const active = sort?.key === col.key;
                const Icon = active ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={cn("px-3 py-2.5 font-medium text-muted-strong", col.numeric ? "text-right" : "text-left")}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(col.key, col.numeric)}
                      className={cn("inline-flex items-center gap-1 rounded hover:text-ink", col.numeric && "flex-row-reverse", active && "text-ink")}
                    >
                      {col.label}
                      {col.srLabel && <span className="sr-only">{col.srLabel}</span>}
                      <Icon className="size-3 opacity-60" aria-hidden />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.key} className={cn("border-b border-line last:border-0 hover:bg-surface-2/60", row.highlight && "bg-accent-soft/40")}>
                {columns.map((col) =>
                  col.primary ? (
                    <th key={col.key} scope="row" className={cn("px-3 font-normal text-left", dense ? "py-1.5" : "py-2.5")}>
                      {renderCell(row.cells[col.key])}
                    </th>
                  ) : (
                    <td key={col.key} className={cn("px-3", dense ? "py-1.5" : "py-2.5", col.numeric && "tnum text-right")}>
                      {renderCell(row.cells[col.key])}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="space-y-2 sm:hidden" aria-label={caption}>
        {sorted.map((row) => {
          const primary = columns.find((c) => c.primary);
          return (
            <li key={row.key} className={cn("card px-4 py-3", row.highlight && "border-accent/30")}>
              {primary && <div className="font-medium">{renderCell(row.cells[primary.key])}</div>}
              <dl className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1.5 text-sm">
                {columns
                  .filter((c) => !c.primary && !c.hideOnMobile)
                  .map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[11px] text-muted-strong">{c.label}</dt>
                      <dd className={cn("truncate", c.numeric && "tnum")}>{renderCell(row.cells[c.key])}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

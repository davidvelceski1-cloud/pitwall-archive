"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type TeamCard = {
  slug: string;
  href: string;
  name: string;
  nationality: string;
  years: string;
  status: "Active" | "Defunct" | "Rebranded";
  color?: string;
  firstSeason: number;
  titles: number;
  driversTitles: number;
  wins: number;
  summary?: string;
  profiled: boolean;
};

const SORTS = [
  { key: "name", label: "Name" },
  { key: "first", label: "First season" },
  { key: "titles", label: "Titles" },
  { key: "wins", label: "Wins" },
] as const;

const chip = (active: boolean) =>
  cn("rounded-full border px-3 py-1 text-sm transition-colors", active ? "border-ink bg-ink text-[var(--bg)]" : "border-line bg-surface text-body hover:border-line-strong hover:text-ink");

export function TeamDirectory({ teams }: { teams: TeamCard[] }) {
  const [filter, setFilter] = useState<"all" | "active" | "defunct">("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["key"]>("titles");
  const [showAll, setShowAll] = useState(false);

  const shown = useMemo(() => {
    const f = teams.filter((t) => (showAll || t.profiled) && (filter === "all" || (filter === "active" ? t.status === "Active" : t.status !== "Active")));
    const by = {
      name: (a: TeamCard, b: TeamCard) => a.name.localeCompare(b.name),
      first: (a: TeamCard, b: TeamCard) => a.firstSeason - b.firstSeason,
      titles: (a: TeamCard, b: TeamCard) => b.titles - a.titles || b.wins - a.wins,
      wins: (a: TeamCard, b: TeamCard) => b.wins - a.wins,
    }[sort];
    return [...f].sort(by);
  }, [teams, filter, sort, showAll]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter by status" className="flex gap-2">
          {(["active", "defunct", "all"] as const).map((f) => (
            <button key={f} type="button" className={chip(filter === f)} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "active" ? "Active" : "Defunct"}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-strong">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="card card-hover flex h-full flex-col overflow-hidden p-0">
              <span className="h-1" style={{ background: t.color ?? "var(--border-strong)" }} aria-hidden />
              <div className={cn("flex flex-1 flex-col p-5", t.status !== "Active" && "bg-[linear-gradient(180deg,rgba(180,140,60,0.05),transparent_60%)]")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn("text-lg font-semibold text-ink", t.status !== "Active" && "font-serif text-xl font-normal")}>{t.name}</p>
                    <p className="text-xs text-muted-strong">
                      {t.nationality} · <span className="tnum">{t.years}</span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      t.status === "Active" ? "border-emerald-600/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-amber-700/20 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
                    )}
                  >
                    {t.status}
                  </span>
                </div>
                {t.summary && <p className="mt-3 line-clamp-3 text-sm text-body">{t.summary}</p>}
                <dl className="mt-auto grid grid-cols-3 gap-2 pt-4 text-sm">
                  <div>
                    <dt className="text-[11px] text-muted-strong">Cons. titles</dt>
                    <dd className="tnum font-semibold text-ink">{t.titles}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-strong">Drivers' titles</dt>
                    <dd className="tnum font-semibold text-ink">{t.driversTitles}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted-strong">Wins</dt>
                    <dd className="tnum font-semibold text-ink">{t.wins}</dd>
                  </div>
                </dl>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="card mt-6 px-6 py-10 text-center text-body">No teams match this filter.</p>}
      <div className="mt-6 text-center">
        <button type="button" onClick={() => setShowAll((v) => !v)} className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-body hover:text-ink">
          {showAll ? "Show profiled teams only" : `Show all ${teams.length} constructors that scored points or won`}
        </button>
      </div>
    </div>
  );
}

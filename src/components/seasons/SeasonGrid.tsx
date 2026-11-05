"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type SeasonCard = {
  year: number;
  rounds: number;
  status: "complete" | "in-progress" | "upcoming";
  champion?: string;
  constructor?: string;
  era: string;
  eraName: string;
  detailed: boolean;
};

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-sm transition-colors",
    active ? "border-ink bg-ink text-[var(--bg)]" : "border-line bg-surface text-body hover:border-line-strong hover:text-ink",
  );

/** Season cards filterable by decade and era (client-side, so the page stays static). */
export function SeasonGrid({ seasons, eras }: { seasons: SeasonCard[]; eras: { slug: string; name: string }[] }) {
  const [decade, setDecade] = useState<number | null>(null);
  const [era, setEra] = useState<string | null>(null);
  const decades = [...new Set(seasons.map((s) => Math.floor(s.year / 10) * 10))];
  const shown = useMemo(
    () => seasons.filter((s) => (decade === null || Math.floor(s.year / 10) * 10 === decade) && (era === null || s.era === era)),
    [seasons, decade, era],
  );

  return (
    <div>
      <div className="space-y-3">
        <div role="group" aria-label="Filter by decade" className="flex flex-wrap gap-2">
          <button type="button" className={chip(decade === null)} aria-pressed={decade === null} onClick={() => setDecade(null)}>
            All decades
          </button>
          {decades.map((d) => (
            <button key={d} type="button" className={chip(decade === d)} aria-pressed={decade === d} onClick={() => setDecade(decade === d ? null : d)}>
              {d}s
            </button>
          ))}
        </div>
        <div role="group" aria-label="Filter by era" className="flex flex-wrap gap-2">
          <button type="button" className={chip(era === null)} aria-pressed={era === null} onClick={() => setEra(null)}>
            All eras
          </button>
          {eras.map((e) => (
            <button key={e.slug} type="button" className={chip(era === e.slug)} aria-pressed={era === e.slug} onClick={() => setEra(era === e.slug ? null : e.slug)}>
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-strong" aria-live="polite">
        {shown.length} season{shown.length === 1 ? "" : "s"}
      </p>
      {shown.length === 0 ? (
        <div className="card mt-3 px-6 py-10 text-center text-body">
          No seasons match both filters. Try clearing one of them.
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((s) => (
            <li key={s.year}>
              <Link href={`/seasons/${s.year}`} className="card card-hover flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="tnum font-serif text-3xl text-ink">{s.year}</span>
                  {s.status !== "complete" ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-ink">{s.status === "in-progress" ? "Live" : "Upcoming"}</span>
                  ) : s.detailed ? (
                    <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-body">Deep dive</span>
                  ) : null}
                </div>
                <p className="mt-3 truncate text-sm font-medium text-ink">{s.champion ?? (s.status === "complete" ? "—" : "Title undecided")}</p>
                <p className="truncate text-xs text-muted-strong">{s.constructor ?? (s.year < 1958 ? "No constructors' title" : "—")}</p>
                <p className="mt-auto pt-3 text-xs text-muted-strong">
                  <span className="tnum">{s.rounds}</span> races · {s.eraName}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

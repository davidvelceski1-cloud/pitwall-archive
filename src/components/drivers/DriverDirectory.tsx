"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type DriverCard = {
  href: string;
  name: string;
  nationality: string;
  first?: number;
  last?: number;
  titles: number;
  wins: number;
  poles: number;
  teams: string[];
  eras: string[];
  profiled: boolean;
};

const PAGE = 60;
const select = "rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink";

/** Searchable, filterable directory of every driver in the archive. */
export function DriverDirectory({
  drivers,
  eras,
  teams,
  currentSeason,
}: {
  drivers: DriverCard[];
  eras: { slug: string; name: string }[];
  teams: string[];
  currentSeason: number;
}) {
  const [q, setQ] = useState("");
  const [nat, setNat] = useState("");
  const [era, setEra] = useState("");
  const [team, setTeam] = useState("");
  const [champions, setChampions] = useState(false);
  const [status, setStatus] = useState<"" | "active" | "retired">("");
  const [sort, setSort] = useState<"wins" | "titles" | "name" | "first">("wins");
  const [limit, setLimit] = useState(PAGE);

  const nationalities = useMemo(() => [...new Set(drivers.map((d) => d.nationality))].sort(), [drivers]);
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const shown = useMemo(() => {
    const nq = norm(q.trim());
    const f = drivers.filter(
      (d) =>
        (!nq || norm(d.name).includes(nq)) &&
        (!nat || d.nationality === nat) &&
        (!era || d.eras.includes(era)) &&
        (!team || d.teams.includes(team)) &&
        (!champions || d.titles > 0) &&
        (!status || (status === "active" ? d.last === currentSeason : d.last !== currentSeason)),
    );
    const by = {
      wins: (a: DriverCard, b: DriverCard) => b.wins - a.wins || b.titles - a.titles || b.poles - a.poles || a.name.localeCompare(b.name),
      titles: (a: DriverCard, b: DriverCard) => b.titles - a.titles || b.wins - a.wins,
      name: (a: DriverCard, b: DriverCard) => a.name.split(" ").at(-1)!.localeCompare(b.name.split(" ").at(-1)!),
      first: (a: DriverCard, b: DriverCard) => (a.first ?? 9999) - (b.first ?? 9999),
    }[sort];
    return f.sort(by);
  }, [drivers, q, nat, era, team, champions, status, sort, currentSeason]);

  const reset = () => {
    setQ("");
    setNat("");
    setEra("");
    setTeam("");
    setChampions(false);
    setStatus("");
  };

  return (
    <div>
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3.5">
          <Search className="size-4 text-muted-strong" strokeWidth={1.5} aria-hidden />
          <label htmlFor="driver-q" className="sr-only">
            Search drivers
          </label>
          <input
            id="driver-q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search by name…"
            className="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-strong"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Nationality" className={select} value={nat} onChange={(e) => setNat(e.target.value)}>
            <option value="">All nationalities</option>
            {nationalities.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <select aria-label="Era" className={select} value={era} onChange={(e) => setEra(e.target.value)}>
            <option value="">All eras</option>
            {eras.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
          <select aria-label="Team" className={select} value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">All teams</option>
            {teams.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select aria-label="Status" className={select} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="">Active and retired</option>
            <option value="active">Active ({currentSeason})</option>
            <option value="retired">Retired</option>
          </select>
          <button
            type="button"
            aria-pressed={champions}
            onClick={() => setChampions((v) => !v)}
            className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm", champions ? "border-ink bg-ink text-[var(--bg)]" : "border-line bg-surface text-body")}
          >
            <Trophy className="size-3.5" strokeWidth={1.5} aria-hidden /> Champions only
          </button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted-strong">
            Sort
            <select className={select} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              <option value="wins">Most wins</option>
              <option value="titles">Most titles</option>
              <option value="name">Surname</option>
              <option value="first">Debut season</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-strong" aria-live="polite">
        {shown.length.toLocaleString()} driver{shown.length === 1 ? "" : "s"}
      </p>

      {shown.length === 0 ? (
        <div className="card mt-3 px-6 py-10 text-center">
          <p className="font-medium text-ink">No drivers match these filters</p>
          <p className="mt-1 text-sm text-body">Some combinations are empty, for example a team that never raced in the chosen era.</p>
          <button type="button" onClick={reset} className="mt-3 text-sm text-accent-ink hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shown.slice(0, limit).map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="card card-hover flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 truncate font-medium text-ink">
                    {d.name}
                    {d.profiled && <span className="rounded-full bg-accent-soft px-1.5 text-[10px] font-medium text-accent-ink">Profile</span>}
                  </span>
                  <span className="block truncate text-xs text-muted-strong">
                    {d.nationality}
                    {d.first && (
                      <>
                        {" "}
                        · <span className="tnum">{d.first === d.last ? d.first : `${d.first}–${d.last === currentSeason ? "" : d.last}`}</span>
                      </>
                    )}
                  </span>
                </span>
                <span className="tnum flex shrink-0 gap-3 text-right text-xs text-muted-strong">
                  {d.titles > 0 && (
                    <span>
                      <span className="block text-sm font-semibold text-ink">{d.titles}</span>titles
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-semibold text-ink">{d.wins}</span>wins
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {shown.length > limit && (
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE * 2)} className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-body hover:text-ink">
            Show more ({(shown.length - limit).toLocaleString()} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

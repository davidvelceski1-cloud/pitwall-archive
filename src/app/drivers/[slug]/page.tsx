import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DRIVER_PROFILES } from "@/content/drivers";
import { TEAM_PROFILES } from "@/content/teams";
import { core, driverCareer, driverIdBySlug, driverStats, href, raceById, standingsIndex, teamDisplayName, teamKeyOf } from "@/lib/archive/data";
import { entity, plainText } from "@/lib/archive/entities";
import { teammateSummary } from "@/lib/archive/teammates";
import { Badge, Breadcrumbs, Container, EmptyState, Section, SourceNote } from "@/components/ui/primitives";
import { StatCard, StatGrid } from "@/components/archive/StatCard";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { EntityLink } from "@/components/archive/EntityLink";
import { Prose } from "@/components/archive/RichText";
import { ResultsHeatmap, type HeatCell } from "@/components/charts/ResultsHeatmap";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";
import { fmtDate, fmtNum, ordinal } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return core().profiledDrivers.map((id) => ({ slug: href.driver(id).split("/").at(-1)! }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = driverIdBySlug((await params).slug);
  const d = id ? core().drivers[id] : undefined;
  if (!d) return {};
  const s = driverStats(d.id);
  return {
    title: d.name,
    description: `${d.name} (${d.nationality}) in Formula 1: ${s.titles} title${s.titles === 1 ? "" : "s"}, ${s.wins} wins, ${s.poles} poles.`,
  };
}

const teamColor = (cid: string) => {
  const k = teamKeyOf(cid);
  return k ? TEAM_PROFILES.find((t) => t.key === k)?.color : undefined;
};

/** Rank of a driver on an all-time tally (1 = best), with ties sharing a rank. */
function allTimeRank(id: string, pick: (r: ReturnType<typeof core>["races"][number]) => string | undefined) {
  const m = new Map<string, number>();
  for (const r of core().races) {
    const k = pick(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  const mine = m.get(id) ?? 0;
  if (!mine) return null;
  return { rank: [...m.values()].filter((v) => v > mine).length + 1, value: mine };
}

export default async function DriverPage({ params }: Props) {
  const id = driverIdBySlug((await params).slug);
  const c = core();
  const d = id ? c.drivers[id] : undefined;
  if (!d) notFound();
  const s = driverStats(d.id);
  const career = driverCareer(d.id);
  const profile = DRIVER_PROFILES.find((p) => p.id === d.id);
  const seasons = standingsIndex().drivers[d.id] ?? [];
  const active = s.lastSeason === c.currentSeason;

  // Career timeline: teams per season (from results when held, otherwise standings).
  const timeline = new Map<number, { teams: string[]; pos: number | null; points: number }>();
  for (const row of seasons) timeline.set(row.season, { teams: row.constructorIds, pos: row.position, points: row.points });
  if (career)
    for (const r of career.results) {
      const t = timeline.get(r.season) ?? { teams: [], pos: null, points: 0 };
      if (!t.teams.includes(r.constructorId)) t.teams.push(r.constructorId);
      timeline.set(r.season, t);
    }
  const years = [...timeline.keys()].sort((a, b) => a - b);

  const heat = career
    ? years.map((y) => ({
        season: y,
        cells: career.results
          .filter((r) => r.season === y)
          // Shared drives in the 1950s can give two rows per race; keep the best-placed one.
          .filter((r, _, arr) => arr.filter((x) => x.raceId === r.raceId).sort((a, b) => (a.position ?? 99) - (b.position ?? 99))[0] === r)
          .map<HeatCell>((r) => {
            const race = raceById(r.raceId);
            return {
              raceId: r.raceId,
              href: href.race(r.raceId),
              round: r.round,
              raceName: race?.name ?? r.raceId,
              team: teamDisplayName(r.constructorId),
              position: r.position,
              positionText: r.positionText,
              status: r.status,
            };
          }),
      }))
    : [];

  const mates = career ? teammateSummary(d.id) : [];
  const mateRows: Row[] = mates.map((m) => ({
    key: m.driverId,
    cells: {
      mate: { sort: c.drivers[m.driverId]?.name ?? m.driverId, entity: entity.driver(m.driverId) },
      team: { sort: teamDisplayName(m.teams[0]), entity: entity.team(m.teams[0]), more: m.teams.slice(1).map((t) => entity.team(t)), swatch: teamColor(m.teams[0]) },
      seasons: { sort: m.seasons },
      races: { sort: m.races },
      race: { sort: m.ahead - m.behind, display: `${m.ahead}–${m.behind}` },
      grid: { sort: m.gridAhead - m.gridBehind, display: `${m.gridAhead}–${m.gridBehind}` },
    },
  }));

  const records = [
    { label: "race wins", r: allTimeRank(d.id, (x) => x.winner?.driverId) },
    { label: "pole positions", r: allTimeRank(d.id, (x) => x.pole?.driverId) },
    { label: "fastest laps since 2004", r: allTimeRank(d.id, (x) => x.fastestLap?.driverId) },
  ].filter((x) => x.r && x.r.rank <= 20);
  const titleCounts = new Map<string, number>();
  for (const x of c.seasons) if (x.driverChampion) titleCounts.set(x.driverChampion.driverId, (titleCounts.get(x.driverChampion.driverId) ?? 0) + 1);
  const titleRank = s.titles ? [...titleCounts.values()].filter((v) => v > s.titles).length + 1 : null;

  const numbers = [...new Set([d.number, ...(career?.results.map((r) => r.number) ?? [])].filter(Boolean))] as string[];
  const debut = career?.results[0];
  const wins = c.races.filter((r) => r.winner?.driverId === d.id);

  const seasonRows: Row[] = seasons.map((row) => ({
    key: String(row.season),
    highlight: row.position === 1,
    cells: {
      season: { sort: row.season, entity: entity.season(row.season) },
      team: { sort: teamDisplayName(row.constructorIds[0]), entity: entity.team(row.constructorIds[0]), more: row.constructorIds.slice(1).map((t) => entity.team(t)), swatch: teamColor(row.constructorIds[0]) },
      pos: { sort: row.position ?? 999, display: row.position ? ordinal(row.position) : "—" },
      wins: { sort: row.wins },
      points: { sort: row.points, display: fmtNum(row.points) },
    },
  }));

  const last = d.family;
  const suggestions = mates.length
    ? [`How did ${last} compare to their teammates?`, `What were ${last}'s greatest races?`, `How did ${last}'s career end?`]
    : [`What did ${d.name} achieve in Formula 1?`, `Which teams did ${last} drive for?`];

  return (
    <>
      <AskContext kind="driver" id={d.id} label={d.name} suggestions={suggestions} />
      <div className="hero-wash border-b border-line/60">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Drivers", href: "/drivers" }, { label: d.name }]} />
          <div className="flex flex-wrap items-center gap-2">
            {s.titles > 0 && <Badge tone="accent">{s.titles}× World Champion</Badge>}
            <Badge>{active ? `Active · ${c.currentSeason}` : "Retired"}</Badge>
            {!career && <Badge>Summary profile</Badge>}
          </div>
          <h1 className="mt-3 font-serif text-6xl tracking-tight">
            <span className="text-body">{d.given}</span> {d.family}
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted-strong">Nationality</dt>
              <dd className="text-ink">{d.nationality}</dd>
            </div>
            {d.dob && (
              <div>
                <dt className="text-xs text-muted-strong">Born</dt>
                <dd className="text-ink">{fmtDate(d.dob, { day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
            )}
            {profile?.died && (
              <div>
                <dt className="text-xs text-muted-strong">Died</dt>
                <dd className="text-ink">{fmtDate(profile.died, { day: "numeric", month: "long", year: "numeric" })}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-strong">Years active</dt>
              <dd className="tnum text-ink">{s.firstSeason === s.lastSeason ? s.firstSeason : `${s.firstSeason}–${active ? "present" : s.lastSeason}`}</dd>
            </div>
            {numbers.length > 0 && (
              <div>
                <dt className="text-xs text-muted-strong">{d.number ? "Number" : "Race numbers"}</dt>
                <dd className="tnum text-ink">{numbers.slice(0, 8).join(", ")}{numbers.length > 8 && "…"}</dd>
              </div>
            )}
          </dl>

          <StatGrid className="mt-8 lg:grid-cols-7">
            {s.starts !== undefined && <StatCard label="Starts" value={s.starts} />}
            <StatCard label="Wins" value={s.wins} />
            <StatCard label="Poles" value={s.poles} hint="Grid P1 where qualifying records are unavailable (mostly pre-1994)" />
            {s.podiums !== undefined && <StatCard label="Podiums" value={s.podiums} />}
            <StatCard label="Fastest laps" value={(s.lastSeason ?? 0) < 2004 ? "—" : s.fastestLaps} hint="Source fastest-lap data begins in 2004" />
            {s.points !== undefined && <StatCard label="Points" value={s.points} hint="Championship points as counted, after dropped scores" />}
            <StatCard label="Titles" value={s.titles} accent={s.titles > 0} />
          </StatGrid>
          {!career && (
            <p className="mt-3 text-xs text-muted-strong">
              Wins, poles and titles are complete. Starts, podiums and race-by-race results are held only for profiled drivers.
            </p>
          )}
        </Container>
      </div>

      <Container>
        <Section title="Career timeline" kicker="Teams by season" id="timeline">
          <ol className="no-scrollbar card flex gap-1.5 overflow-x-auto p-4" aria-label="Seasons and teams">
            {years.map((y) => {
              const t = timeline.get(y)!;
              return (
                <li key={y} className="w-[74px] shrink-0">
                  <a href={`/seasons/${y}`} className="block rounded-lg border border-line p-2 transition-colors hover:border-line-strong">
                    <span className="block h-1 rounded-full" style={{ background: teamColor(t.teams[0]) ?? "var(--border-strong)" }} aria-hidden />
                    <span className="tnum mt-1.5 block text-xs font-medium text-ink">{y}</span>
                    <span className="block truncate text-[11px] text-body" title={t.teams.map(teamDisplayName).join(" / ")}>
                      {teamDisplayName(t.teams[0])}
                    </span>
                    <span className="tnum block text-[11px] text-muted-strong">{t.pos ? ordinal(t.pos) : "—"}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </Section>

        {profile && (
          <Section title="Biography" serif id="bio">
            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <div>
                <Prose paragraphs={profile.bio} />
                <SourceNote source={profile.source} lastReviewed={profile.lastReviewed} />
              </div>
              <aside className="space-y-4">
                <div className="card p-5">
                  <h3 className="text-sm font-semibold">Records in the archive</h3>
                  <ul className="mt-3 space-y-2 text-sm text-body">
                    {titleRank && (
                      <li>
                        <span className="tnum font-medium text-ink">{titleRank === 1 ? "Joint-most" : ordinal(titleRank)}</span> all-time in drivers' titles ({s.titles})
                      </li>
                    )}
                    {records.map((x) => (
                      <li key={x.label}>
                        <span className="tnum font-medium text-ink">{ordinal(x.r!.rank)}</span> all-time in {x.label} ({x.r!.value})
                      </li>
                    ))}
                    {profile.milestones.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[11px] text-muted-strong">Ranks are computed from the archive's results as of {fmtDate(c.generatedAt.slice(0, 10))}.</p>
                </div>
                {debut && (
                  <div className="card p-5 text-sm">
                    <h3 className="font-semibold">Debut</h3>
                    <p className="mt-2 text-body">
                      <EntityLink entity={entity.race(debut.raceId)} /> with <EntityLink entity={entity.team(debut.constructorId)} />,{" "}
                      {debut.position ? `finishing ${ordinal(debut.position)}` : `not classified (${debut.status.toLowerCase()})`}.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </Section>
        )}

        {profile && (
          <Section title="Key races" id="key-races">
            <ul className="grid gap-3 md:grid-cols-2">
              {profile.keyRaces.map((k) => {
                const race = c.races.find((r) => r.season === k.season && r.name.includes(k.race));
                const res = race && career?.results.find((r) => r.raceId === race.id);
                return (
                  <li key={`${k.season}${k.race}`} className="card p-5">
                    <p className="text-xs text-muted-strong">
                      {race ? fmtDate(race.date) : k.season}
                      {res && <> · {res.position ? `Finished ${ordinal(res.position)}` : res.status} for {teamDisplayName(res.constructorId)}</>}
                    </p>
                    <p className="mt-1 font-medium">{race ? <EntityLink entity={entity.race(race.id)} /> : `${k.season} ${k.race} Grand Prix`}</p>
                    <p className="mt-1 text-sm text-body">{plainText(k.note)}</p>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {heat.length > 0 && (
          <Section title="Every race" kicker="Finishing position, season by season" id="results">
            <ResultsHeatmap seasons={heat} />
          </Section>
        )}

        {mateRows.length > 0 && (
          <Section title="Teammates" kicker="Head-to-head" id="teammates">
            <StandingsTable
              caption={`${d.name}'s head-to-head record against teammates`}
              columns={[
                { key: "mate", label: "Teammate", primary: true },
                { key: "team", label: "Team" },
                { key: "seasons", label: "Seasons" },
                { key: "races", label: "Races", numeric: true },
                { key: "race", label: "Race H2H", numeric: true },
                { key: "grid", label: "Grid H2H", numeric: true },
              ]}
              rows={mateRows}
              initialSort={{ key: "races", dir: "desc" }}
              dense
            />
            <p className="mt-2 text-xs text-muted-strong">
              Race H2H counts races where both were classified; grid H2H compares starting positions. Shown as {d.family}–teammate.
            </p>
          </Section>
        )}

        {!career && (
          <>
            <Section title="Championship seasons" id="seasons">
              {seasonRows.length ? (
                <StandingsTable
                  caption={`${d.name} season by season`}
                  columns={[
                    { key: "season", label: "Season", primary: true },
                    { key: "team", label: "Team" },
                    { key: "pos", label: "Position", numeric: true },
                    { key: "wins", label: "Wins", numeric: true },
                    { key: "points", label: "Points", numeric: true },
                  ]}
                  rows={seasonRows}
                  initialSort={{ key: "season", dir: "asc" }}
                  dense
                />
              ) : (
                <EmptyState title="No championship classification">This driver doesn't appear in the final championship tables held by the archive.</EmptyState>
              )}
            </Section>
            {wins.length > 0 && (
              <Section title="Victories" kicker={`${wins.length} wins`}>
                <ul className="flex flex-wrap gap-2">
                  {wins.map((w) => (
                    <li key={w.id} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">
                      <EntityLink entity={entity.race(w.id)} className="no-underline hover:underline" />
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </>
        )}

        <Section title={`Ask about ${d.family}`} kicker="AI">
          <AskPrompts prompts={suggestions} />
        </Section>
      </Container>
    </>
  );
}

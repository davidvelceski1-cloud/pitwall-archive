import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { eraOfYear, ERAS } from "@/content/eras";
import { seasonEditorial } from "@/content/seasons";
import { core, driverName, pointsProgression, racesOf, seasonDetail, seasonSummary, teamDisplayName, teamKeyOf } from "@/lib/archive/data";
import { entity, plainText } from "@/lib/archive/entities";
import { TEAM_PROFILES } from "@/content/teams";
import { Breadcrumbs, Container, EmptyState, Section, SourceNote, Badge } from "@/components/ui/primitives";
import { StatCard, StatGrid } from "@/components/archive/StatCard";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { TimelineItem } from "@/components/archive/TimelineItem";
import { EraBadge } from "@/components/archive/EraBadge";
import { EntityLink } from "@/components/archive/EntityLink";
import { Prose } from "@/components/archive/RichText";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { AskButton, AskContext } from "@/components/layout/AskContext";
import { fmtDate, fmtNum } from "@/lib/utils";

type Props = { params: Promise<{ year: string }> };

export function generateStaticParams() {
  return core().seasons.map((s) => ({ year: String(s.year) }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const year = Number((await params).year);
  const s = seasonSummary(year);
  if (!s) return {};
  const champ = s.driverChampion ? ` ${driverName(s.driverChampion.driverId)} won the drivers' title.` : "";
  return {
    title: `${year} season`,
    description: seasonEditorial(year)?.headline ?? `The ${year} Formula 1 season: ${s.rounds} races.${champ}`,
  };
}

const teamColor = (constructorId: string) => {
  const key = teamKeyOf(constructorId);
  return key ? TEAM_PROFILES.find((t) => t.key === key)?.color : undefined;
};

export default async function SeasonPage({ params }: Props) {
  const year = Number((await params).year);
  const c = core();
  const s = seasonSummary(year);
  if (!s) notFound();
  const detail = seasonDetail(year);
  const races = racesOf(year);
  const ed = seasonEditorial(year);
  const era = eraOfYear(year);
  const eraIdx = ERAS.indexOf(era);
  const progression = pointsProgression(year);
  const first = c.seasons[0].year;
  const last = c.seasons.at(-1)!.year;

  const ds = detail?.driverStandings ?? [];
  const cs = detail?.constructorStandings ?? [];
  const margin = ds.length > 1 && s.status === "complete" ? ds[0].points - ds[1].points : undefined;
  const winsBy = new Map<string, number>();
  for (const r of races) if (r.winner) winsBy.set(r.winner.driverId, (winsBy.get(r.winner.driverId) ?? 0) + 1);
  const topWinner = [...winsBy.entries()].sort((a, b) => b[1] - a[1])[0];
  const polesBy = new Map<string, number>();
  for (const r of races) if (r.pole) polesBy.set(r.pole.driverId, (polesBy.get(r.pole.driverId) ?? 0) + 1);
  const topPoles = [...polesBy.entries()].sort((a, b) => b[1] - a[1])[0];
  const poleFromGrid = races.some((r) => r.pole?.source === "grid");

  const calendarRows: Row[] = races.map((r) => ({
    key: r.id,
    cells: {
      round: { sort: r.round },
      date: { sort: r.date, display: fmtDate(r.date, { day: "numeric", month: "short" }) },
      race: { sort: r.name, entity: entity.race(r.id, r.name.replace(" Grand Prix", " GP")) },
      circuit: { sort: c.circuits[r.circuitId]?.locality ?? "", entity: entity.circuit(r.circuitId, c.circuits[r.circuitId]?.locality) },
      winner: r.winner ? { sort: driverName(r.winner.driverId), entity: entity.driver(r.winner.driverId), swatch: teamColor(r.winner.constructorId) } : { sort: null, display: r.date > new Date().toISOString().slice(0, 10) ? "Upcoming" : "—", muted: true },
      pole: r.pole ? { sort: driverName(r.pole.driverId), entity: entity.driver(r.pole.driverId) } : { sort: null },
      fl: r.fastestLap ? { sort: driverName(r.fastestLap.driverId), entity: entity.driver(r.fastestLap.driverId) } : { sort: null, muted: true },
    },
  }));

  const driverRows: Row[] = ds.map((d) => {
    const teams = d.constructorIds.map((id) => entity.team(id));
    return {
      key: d.driverId,
      highlight: d.position === 1 && s.status === "complete",
      cells: {
        pos: { sort: d.position ?? 999, display: d.position ? String(d.position) : "–" },
        driver: { sort: driverName(d.driverId), entity: entity.driver(d.driverId) },
        team: { sort: teams[0]?.label ?? "", entity: teams[0], more: teams.slice(1), swatch: teamColor(d.constructorIds[0]) },
        wins: { sort: d.wins },
        points: { sort: d.points, display: fmtNum(d.points) },
      },
    };
  });
  const consRows: Row[] = cs.map((t) => ({
    key: t.constructorId,
    highlight: t.position === 1 && s.status === "complete",
    cells: {
      pos: { sort: t.position ?? 999, display: t.position ? String(t.position) : "–" },
      team: { sort: teamDisplayName(t.constructorId), entity: entity.team(t.constructorId), swatch: teamColor(t.constructorId) },
      wins: { sort: t.wins },
      points: { sort: t.points, display: fmtNum(t.points) },
    },
  }));

  const suggestions = [
    `Explain the ${year} season in 30 seconds`,
    s.driverChampion ? `How did ${driverName(s.driverChampion.driverId)} win the ${year} title?` : `Who is leading the ${year} championship?`,
    `Which teams were strongest in ${year}?`,
  ];

  return (
    <>
      <AskContext kind="season" id={String(year)} label={`the ${year} season`} suggestions={suggestions} />
      <div className="hero-wash border-b border-line/60">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Seasons", href: "/seasons" }, { label: String(year) }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <EraBadge era={era} index={eraIdx} />
                {s.status === "in-progress" && <Badge tone="accent">In progress · after round {detail?.standingsRound}</Badge>}
                {s.status === "upcoming" && <Badge tone="accent">Upcoming</Badge>}
              </div>
              <h1 className="tnum mt-3 font-serif text-7xl leading-none tracking-tight sm:text-8xl">{year}</h1>
              {ed && <p className="mt-4 max-w-xl font-serif text-2xl leading-snug text-ink">{ed.headline}</p>}
            </div>
            <AskButton question={`Explain the ${year} season in 30 seconds`}>Explain this season in 30 seconds</AskButton>
          </div>

          <StatGrid className="mt-8">
            <div className="card col-span-2 px-4 py-3.5">
              <dt className="text-xs text-muted-strong">Drivers' champion</dt>
              <dd className="mt-1 text-lg font-semibold">
                {s.driverChampion ? (
                  <>
                    <EntityLink entity={entity.driver(s.driverChampion.driverId)} className="no-underline hover:underline" />
                    <span className="ml-2 text-sm font-normal text-muted-strong">
                      {s.driverChampion.constructorIds.map((id) => teamDisplayName(id)).join(" / ")} · <span className="tnum">{fmtNum(s.driverChampion.points)}</span> pts
                    </span>
                  </>
                ) : (
                  <span className="text-muted-strong">{s.status === "complete" ? "—" : "To be decided"}</span>
                )}
              </dd>
            </div>
            <div className="card col-span-2 px-4 py-3.5 sm:col-span-1 lg:col-span-1">
              <dt className="text-xs text-muted-strong">Constructors' champion</dt>
              <dd className="mt-1 text-lg font-semibold">
                {s.constructorChampion ? (
                  <EntityLink entity={entity.team(s.constructorChampion.constructorId)} className="no-underline hover:underline" />
                ) : (
                  <span className="text-base font-normal text-muted-strong">{year < 1958 ? "Not yet awarded (from 1958)" : s.status === "complete" ? "—" : "To be decided"}</span>
                )}
              </dd>
            </div>
            <StatCard label="Races" value={s.rounds} />
            {topWinner && <StatCard label={`Most wins · ${driverName(topWinner[0]).split(" ").at(-1)}`} value={topWinner[1]} />}
            {topPoles && <StatCard label={`Most poles · ${driverName(topPoles[0]).split(" ").at(-1)}`} value={topPoles[1]} hint={poleFromGrid ? "Pole taken as grid P1 where qualifying data is unavailable" : undefined} />}
            {margin !== undefined && <StatCard label="Title margin (points)" value={margin} />}
            <StatCard label="Different winners" value={winsBy.size} />
          </StatGrid>
        </Container>
      </div>

      <Container>
        {ed && (
          <Section title="Story of the season" serif id="story">
            <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
              <div>
                <Prose paragraphs={ed.story} />
                <SourceNote source={ed.source} lastReviewed={ed.lastReviewed} />
              </div>
              <aside className="card h-fit p-5">
                <h3 className="text-sm font-semibold">Key regulation changes</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-body">
                  {ed.regulations.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </Section>
        )}

        {progression && progression.rows.length > 1 && (
          <Section title="Points progression" kicker="Top five in the final standings" id="progression">
            <LineChartCard
              data={progression.rows}
              series={progression.drivers.map((d) => ({ key: d, label: driverName(d) }))}
              xKey="round"
              xLabel="Round"
              yLabel="Points"
              xPrefix="R"
              caption={
                year <= 1990
                  ? `Cumulative points scored per round. ${year} used a dropped-scores rule, so final championship totals can be lower than points scored.`
                  : year >= 2021
                    ? "Cumulative Grand Prix points after each round. Sprint points are not included, so totals can sit slightly below the final standings."
                    : "Cumulative championship points after each round."
              }
            />
          </Section>
        )}

        <Section title="Race calendar" kicker={`${races.length} rounds`} id="calendar">
          <StandingsTable
            caption={`${year} race calendar`}
            columns={[
              { key: "round", label: "Rd", numeric: true },
              { key: "date", label: "Date", hideOnMobile: true },
              { key: "race", label: "Grand Prix", primary: true },
              { key: "circuit", label: "Circuit" },
              { key: "winner", label: "Winner" },
              { key: "pole", label: "Pole" },
              { key: "fl", label: "Fastest lap", hideOnMobile: year < 2004 },
            ]}
            rows={calendarRows}
            dense
          />
          <p className="mt-2 text-xs text-muted-strong">
            {year < 2004 && "Fastest-lap data in the source archive begins in 2004. "}
            {poleFromGrid && "Pole positions marked from the starting grid where qualifying records are unavailable."}
          </p>
        </Section>

        <Section title="Final standings" kicker={s.status === "complete" ? "Championship tables" : `After round ${detail?.standingsRound}`} id="standings">
          {ds.length ? (
            <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
              <div>
                <h3 className="mb-3 text-sm font-semibold">Drivers</h3>
                <StandingsTable
                  caption={`${year} drivers' championship`}
                  columns={[
                    { key: "pos", label: "Pos", numeric: true },
                    { key: "driver", label: "Driver", primary: true },
                    { key: "team", label: "Team" },
                    { key: "wins", label: "Wins", numeric: true },
                    { key: "points", label: "Pts", numeric: true, srLabel: "Points" },
                  ]}
                  rows={driverRows}
                  initialSort={{ key: "pos", dir: "asc" }}
                  dense
                />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Constructors</h3>
                {consRows.length ? (
                  <StandingsTable
                    caption={`${year} constructors' championship`}
                    columns={[
                      { key: "pos", label: "Pos", numeric: true },
                      { key: "team", label: "Constructor", primary: true },
                      { key: "wins", label: "Wins", numeric: true },
                      { key: "points", label: "Pts", numeric: true, srLabel: "Points" },
                    ]}
                    rows={consRows}
                    initialSort={{ key: "pos", dir: "asc" }}
                    dense
                  />
                ) : (
                  <EmptyState title="No constructors' championship">The constructors' championship was first awarded in 1958.</EmptyState>
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="Standings not available yet">The first race of the season hasn't been run.</EmptyState>
          )}
          {year <= 1990 && ds.length > 0 && (
            <p className="mt-2 text-xs text-muted-strong">Points shown are championship points as counted under the season's dropped-scores rule.</p>
          )}
        </Section>

        {ed && (
          <Section title="Notable moments" id="moments">
            <ol className="card p-6">
              {ed.moments.map((m, i) => {
                const race = m.race ? races.find((r) => r.name.includes(m.race!)) : undefined;
                return (
                  <TimelineItem
                    key={m.title}
                    last={i === ed.moments.length - 1}
                    kind={m.kind}
                    date={race ? fmtDate(race.date, { day: "numeric", month: "short" }) : (m.when ?? "")}
                    title={m.title}
                  >
                    {plainText(m.text)}
                    {race && (
                      <>
                        {" "}
                        <EntityLink entity={entity.race(race.id, race.name)} className="text-muted-strong" />
                      </>
                    )}
                  </TimelineItem>
                );
              })}
            </ol>
          </Section>
        )}

        {!ed && s.status === "complete" && (
          <Section title="Season at a glance" kicker="Generated from the results">
            <div className="card p-6 text-body">
              <p className="max-w-[68ch] leading-relaxed">
                {s.driverChampion && (
                  <>
                    <EntityLink entity={entity.driver(s.driverChampion.driverId)} /> won the {year} drivers' championship
                    {margin !== undefined && margin > 0 && <> by {fmtNum(margin)} points</>}, driving for{" "}
                    {s.driverChampion.constructorIds.map((id, i) => (
                      <span key={id}>
                        {i > 0 && " and "}
                        <EntityLink entity={entity.team(id)} />
                      </span>
                    ))}
                    .{" "}
                  </>
                )}
                {winsBy.size} different drivers won the season's {s.rounds} races
                {topWinner && (
                  <>
                    , with <EntityLink entity={entity.driver(topWinner[0])} /> winning the most ({topWinner[1]})
                  </>
                )}
                .
                {s.constructorChampion && (
                  <>
                    {" "}
                    <EntityLink entity={entity.team(s.constructorChampion.constructorId)} /> took the constructors' title.
                  </>
                )}
              </p>
              <p className="mt-3 text-xs text-muted-strong">This season doesn't have an editorial story yet. Ask the Archive can summarise it from the results.</p>
            </div>
          </Section>
        )}

        <nav aria-label="Season navigation" className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6">
          {year > first ? (
            <Link href={`/seasons/${year - 1}`} className="group flex items-center gap-2 text-sm text-body hover:text-ink">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              <span>
                <span className="block text-xs text-muted-strong">Previous season</span>
                <span className="tnum font-serif text-2xl text-ink">{year - 1}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {year < last && (
            <Link href={`/seasons/${year + 1}`} className="group flex items-center gap-2 text-right text-sm text-body hover:text-ink">
              <span>
                <span className="block text-xs text-muted-strong">Next season</span>
                <span className="tnum font-serif text-2xl text-ink">{year + 1}</span>
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}

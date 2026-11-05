import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Flag, Timer, Trophy } from "lucide-react";
import { core, driverName, href, raceById, raceIdBySlug, racesOf, seasonDetail, teamDisplayName, teamKeyOf } from "@/lib/archive/data";
import { entity } from "@/lib/archive/entities";
import { TEAM_PROFILES } from "@/content/teams";
import { seasonEditorial } from "@/content/seasons";
import { Breadcrumbs, Container, EmptyState, Section } from "@/components/ui/primitives";
import { EntityLink } from "@/components/archive/EntityLink";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { AskContext } from "@/components/layout/AskContext";
import { fmtDate } from "@/lib/utils";

type Props = { params: Promise<{ year: string; race: string }> };

export function generateStaticParams() {
  const c = core();
  const years = new Set([...c.featuredSeasons, c.currentSeason]);
  return c.races.filter((r) => years.has(r.season)).map((r) => ({ year: String(r.season), race: href.race(r.id).split("/").at(-1)! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, race } = await params;
  const id = raceIdBySlug(Number(year), race);
  const r = id ? raceById(id) : undefined;
  if (!r) return {};
  return {
    title: `${r.season} ${r.name}`,
    description: r.winner ? `${driverName(r.winner.driverId)} won the ${r.season} ${r.name} for ${teamDisplayName(r.winner.constructorId)}.` : `${r.season} ${r.name}, ${fmtDate(r.date)}.`,
  };
}

const color = (cid: string) => {
  const k = teamKeyOf(cid);
  return k ? TEAM_PROFILES.find((t) => t.key === k)?.color : undefined;
};

export default async function RacePage({ params }: Props) {
  const { year: y, race: slug } = await params;
  const year = Number(y);
  const id = raceIdBySlug(year, slug);
  const r = id ? raceById(id) : undefined;
  if (!r) notFound();
  const c = core();
  const ci = c.circuits[r.circuitId];
  const all = racesOf(year);
  const prev = all.find((x) => x.round === r.round - 1);
  const next = all.find((x) => x.round === r.round + 1);
  const detail = seasonDetail(year);
  const results = detail?.results.filter((x) => x.raceId === r.id) ?? [];
  const quali = detail?.qualifying.filter((x) => x.raceId === r.id) ?? [];
  const moment = seasonEditorial(year)?.moments.find((m) => m.race && r.name.includes(m.race));

  const resultRows: Row[] = results.map((x, i) => ({
    key: `${x.driverId}-${i}`,
    highlight: x.position === 1,
    cells: {
      pos: { sort: x.position ?? 900 + i, display: x.position ? String(x.position) : x.positionText === "R" ? "Ret" : x.positionText === "D" ? "DSQ" : x.positionText },
      driver: { sort: driverName(x.driverId), entity: entity.driver(x.driverId) },
      team: { sort: teamDisplayName(x.constructorId), entity: entity.team(x.constructorId), swatch: color(x.constructorId) },
      grid: { sort: x.grid || 99, display: x.grid ? String(x.grid) : "Pit" },
      laps: { sort: x.laps },
      status: { sort: x.time ?? x.status, display: x.time ?? x.status, muted: !x.time },
      points: { sort: x.points },
    },
  }));
  const qualiRows: Row[] = quali.map((q) => ({
    key: q.driverId,
    cells: {
      pos: { sort: q.position },
      driver: { sort: driverName(q.driverId), entity: entity.driver(q.driverId) },
      team: { sort: teamDisplayName(q.constructorId), entity: entity.team(q.constructorId), swatch: color(q.constructorId) },
      q1: { sort: q.q1 ?? null, display: q.q1 ?? "—" },
      q2: { sort: q.q2 ?? null, display: q.q2 ?? "—" },
      q3: { sort: q.q3 ?? null, display: q.q3 ?? "—" },
    },
  }));

  const facts = [
    { icon: Trophy, label: "Winner", ref: r.winner },
    { icon: Flag, label: r.pole?.source === "grid" ? "Pole (grid P1)" : "Pole position", ref: r.pole },
    { icon: Timer, label: "Fastest lap", ref: r.fastestLap, extra: r.fastestLap?.time },
  ];

  return (
    <>
      <AskContext
        kind="race"
        id={r.id}
        label={`the ${r.season} ${r.name}`}
        suggestions={[`What happened at the ${r.season} ${r.name}?`, `Who has won the most at ${ci?.locality ?? "this circuit"}?`, `How did this race affect the ${r.season} championship?`]}
      />
      <div className="hero-wash border-b border-line/60">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Seasons", href: "/seasons" }, { label: String(year), href: `/seasons/${year}` }, { label: r.name }]} />
          <p className="text-sm text-muted-strong">
            Round {r.round} of {all.length} · {fmtDate(r.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight sm:text-6xl">
            {r.season} {r.name}
          </h1>
          {ci && (
            <p className="mt-3 text-body">
              <EntityLink entity={entity.circuit(ci.id)} /> · {ci.locality}, {ci.country}
            </p>
          )}
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="card flex items-center gap-3 px-4 py-3.5">
                <f.icon className="size-5 text-muted-strong" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <dt className="text-xs text-muted-strong">{f.label}</dt>
                  <dd className="truncate font-medium">
                    {f.ref ? (
                      <>
                        <EntityLink entity={entity.driver(f.ref.driverId)} className="no-underline hover:underline" />
                        <span className="ml-1.5 text-sm font-normal text-muted-strong">
                          {teamDisplayName(f.ref.constructorId)}
                          {f.extra && <span className="tnum"> · {f.extra}</span>}
                        </span>
                      </>
                    ) : (
                      <span className="font-normal text-muted-strong">{f.label === "Fastest lap" && year < 2004 ? "Not in source data (pre-2004)" : r.winner ? "—" : "Not yet run"}</span>
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      <Container>
        {moment && (
          <Section title={moment.title} kicker="From the season story">
            <p className="max-w-[68ch] text-body">{moment.text}</p>
          </Section>
        )}

        <Section title="Race classification" id="results">
          {resultRows.length ? (
            <StandingsTable
              caption={`${r.season} ${r.name} results`}
              columns={[
                { key: "pos", label: "Pos", numeric: true },
                { key: "driver", label: "Driver", primary: true },
                { key: "team", label: "Team" },
                { key: "grid", label: "Grid", numeric: true },
                { key: "laps", label: "Laps", numeric: true, hideOnMobile: true },
                { key: "status", label: "Time / status" },
                { key: "points", label: "Pts", numeric: true, srLabel: "Points" },
              ]}
              rows={resultRows}
              dense
            />
          ) : (
            <EmptyState title={r.winner ? "Full classification not in the archive yet" : "This race hasn't been run yet"}>
              {r.winner ? (
                <>
                  The archive holds complete race-by-race results for its deep-dive seasons. The winner and pole for every race are listed above. See the{" "}
                  <Link className="underline" href={`/seasons/${year}`}>
                    {year} season
                  </Link>{" "}
                  for the final standings.
                </>
              ) : (
                <>Results appear here after the race. The archive refreshes the current season nightly.</>
              )}
            </EmptyState>
          )}
        </Section>

        {qualiRows.length > 0 && (
          <Section title="Qualifying" id="qualifying">
            <StandingsTable
              caption={`${r.season} ${r.name} qualifying`}
              columns={[
                { key: "pos", label: "Pos", numeric: true },
                { key: "driver", label: "Driver", primary: true },
                { key: "team", label: "Team" },
                { key: "q1", label: "Q1", numeric: true },
                { key: "q2", label: "Q2", numeric: true },
                { key: "q3", label: "Q3", numeric: true },
              ]}
              rows={qualiRows}
              dense
            />
          </Section>
        )}

        <nav aria-label="Race navigation" className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm">
          {prev ? (
            <Link href={href.race(prev.id)} className="group flex items-center gap-2 text-body hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden />
              <span>
                <span className="block text-xs text-muted-strong">Round {prev.round}</span>
                {prev.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={href.race(next.id)} className="group flex items-center gap-2 text-right text-body hover:text-ink">
              <span>
                <span className="block text-xs text-muted-strong">Round {next.round}</span>
                {next.name}
              </span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}

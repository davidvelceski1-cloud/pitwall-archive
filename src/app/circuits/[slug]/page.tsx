import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CIRCUIT_PROFILES } from "@/content/circuits";
import { TEAM_PROFILES } from "@/content/teams";
import { circuitIdBySlug, core, driverName, href, teamDisplayName, teamKeyOf } from "@/lib/archive/data";
import { entity, plainText } from "@/lib/archive/entities";
import { Breadcrumbs, Container, Section, SourceNote } from "@/components/ui/primitives";
import { StatCard, StatGrid } from "@/components/archive/StatCard";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { EntityLink } from "@/components/archive/EntityLink";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";
import { fmtDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CIRCUIT_PROFILES.map((p) => ({ slug: href.circuit(p.id).split("/").at(-1)! }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = circuitIdBySlug((await params).slug);
  const ci = id ? core().circuits[id] : undefined;
  if (!ci) return {};
  const p = CIRCUIT_PROFILES.find((x) => x.id === ci.id);
  return { title: ci.name, description: p ? plainText(p.summary) : `${ci.name}, ${ci.locality}, ${ci.country}: Formula 1 history.` };
}

const toSeconds = (t: string) => t.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);

export default async function CircuitPage({ params }: Props) {
  const id = circuitIdBySlug((await params).slug);
  const c = core();
  const ci = id ? c.circuits[id] : undefined;
  if (!ci) notFound();
  const profile = CIRCUIT_PROFILES.find((p) => p.id === ci.id);
  const races = c.races.filter((r) => r.circuitId === ci.id);
  const run = races.filter((r) => r.winner);
  const seasons = [...new Set(races.map((r) => r.season))];

  const tallyDrivers = new Map<string, number>();
  const tallyTeams = new Map<string, number>();
  for (const r of run) {
    tallyDrivers.set(r.winner!.driverId, (tallyDrivers.get(r.winner!.driverId) ?? 0) + 1);
    const t = teamKeyOf(r.winner!.constructorId) ?? r.winner!.constructorId;
    tallyTeams.set(t, (tallyTeams.get(t) ?? 0) + 1);
  }
  const topDrivers = [...tallyDrivers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topTeams = [...tallyTeams.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Fastest race lap on the current layout, from the source's fastest-lap data (2004+).
  const since = profile?.currentLayoutSince ?? 2004;
  const laps = run.filter((r) => r.fastestLap && r.season >= since);
  const record = laps.sort((a, b) => toSeconds(a.fastestLap!.time) - toSeconds(b.fastestLap!.time))[0];

  const rows: Row[] = [...run].reverse().map((r) => ({
    key: r.id,
    cells: {
      season: { sort: r.season, entity: entity.race(r.id, String(r.season)) },
      race: { sort: r.name, display: r.name },
      winner: { sort: driverName(r.winner!.driverId), entity: entity.driver(r.winner!.driverId) },
      team: { sort: teamDisplayName(r.winner!.constructorId), entity: entity.team(r.winner!.constructorId) },
      pole: r.pole ? { sort: driverName(r.pole.driverId), entity: entity.driver(r.pole.driverId) } : { sort: null },
    },
  }));

  return (
    <>
      <AskContext
        kind="circuit"
        id={ci.id}
        label={ci.name}
        suggestions={[`Who has won the most at ${ci.locality}?`, `What are the most famous races at ${ci.name}?`, `How has ${ci.locality} changed over the years?`]}
      />
      <div className="hero-wash border-b border-line/60">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Circuits", href: "/circuits" }, { label: ci.name }]} />
          <div className="grid items-center gap-8 md:grid-cols-[1fr_280px]">
            <div>
              <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">{ci.name}</h1>
              <p className="mt-2 text-body">
                {ci.locality}, {ci.country} · <span className="tnum">{ci.lat.toFixed(3)}°, {ci.lng.toFixed(3)}°</span>
              </p>
              {profile && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">{plainText(profile.summary)}</p>}
            </div>
            {profile && (
              <figure className="card p-5">
                <svg viewBox="0 0 100 100" className="h-auto w-full" role="img" aria-label={`Schematic outline of ${ci.name}`}>
                  <path d={profile.outline} fill="none" stroke="var(--ink)" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <figcaption className="mt-2 text-center text-[11px] text-muted-strong">Schematic outline, not to scale</figcaption>
              </figure>
            )}
          </div>
          <StatGrid className="mt-8">
            <StatCard label="Grands Prix" value={run.length} />
            <StatCard label="Years used" value={seasons.length ? `${seasons[0]}–${seasons.at(-1)}` : "—"} />
            <StatCard label="Seasons on calendar" value={seasons.length} />
            <StatCard
              label="Fastest race lap"
              value={record ? record.fastestLap!.time : "—"}
              hint={`Fastest race lap in the archive on the current layout (since ${since}); source data begins in 2004`}
            />
          </StatGrid>
          {record && (
            <p className="mt-2 text-xs text-muted-strong">
              Fastest race lap: <EntityLink entity={entity.driver(record.fastestLap!.driverId)} />, <EntityLink entity={entity.race(record.id)} />. Based on fastest-lap data since{" "}
              {since}; official lap records may predate the source data.
            </p>
          )}
        </Container>
      </div>

      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          <Section title="Most successful drivers">
            <ol className="card divide-y divide-line">
              {topDrivers.map(([d, n], i) => (
                <li key={d} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="tnum w-4 text-muted-strong">{i + 1}</span>
                    <EntityLink entity={entity.driver(d)} />
                  </span>
                  <span className="tnum font-medium text-ink">{n} win{n > 1 ? "s" : ""}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Most successful teams">
            <ol className="card divide-y divide-line">
              {topTeams.map(([t, n], i) => {
                const profileTeam = TEAM_PROFILES.find((p) => p.key === t);
                return (
                  <li key={t} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="flex items-center gap-3">
                      <span className="tnum w-4 text-muted-strong">{i + 1}</span>
                      {profileTeam && <span className="h-3 w-1 rounded-full" style={{ background: profileTeam.color }} aria-hidden />}
                      <EntityLink entity={entity.team(t)} />
                    </span>
                    <span className="tnum font-medium text-ink">{n} win{n > 1 ? "s" : ""}</span>
                  </li>
                );
              })}
            </ol>
          </Section>
        </div>

        {profile && (
          <Section title="Layout changes" id="layouts">
            <ol className="card divide-y divide-line">
              {profile.layouts.map((l) => (
                <li key={l.years} className="grid gap-1 px-5 py-3.5 text-sm sm:grid-cols-[140px_1fr]">
                  <span className="tnum font-medium text-ink">{l.years}</span>
                  <span className="text-body">{l.note}</span>
                </li>
              ))}
            </ol>
            <SourceNote source={profile.source} lastReviewed={profile.lastReviewed} />
          </Section>
        )}

        <Section title="Every Grand Prix here" kicker={`${run.length} races`} id="races">
          <StandingsTable
            caption={`Grands Prix at ${ci.name}`}
            columns={[
              { key: "season", label: "Year", primary: true },
              { key: "race", label: "Event", hideOnMobile: true },
              { key: "winner", label: "Winner" },
              { key: "team", label: "Team" },
              { key: "pole", label: "Pole" },
            ]}
            rows={rows}
            dense
          />
          {races.some((r) => !r.winner) && (
            <p className="mt-2 text-xs text-muted-strong">
              Next race here: {races.filter((r) => !r.winner).map((r) => `${r.name}, ${fmtDate(r.date)}`).join("; ")}.
            </p>
          )}
        </Section>

        <Section title="Ask about this circuit" kicker="AI">
          <AskPrompts prompts={[`Who has won the most at ${ci.locality}?`, `What are the most famous races at ${ci.name}?`]} />
        </Section>
      </Container>
    </>
  );
}

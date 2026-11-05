import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TEAM_PROFILES } from "@/content/teams";
import { LINEAGE_NODES } from "@/content/lineage";
import { core, driverName, standingsIndex, teamBySlug, teamHistory, teamStats } from "@/lib/archive/data";
import { entity, plainText } from "@/lib/archive/entities";
import { Badge, Breadcrumbs, Container, Section, SourceNote } from "@/components/ui/primitives";
import { StatCard, StatGrid } from "@/components/archive/StatCard";
import { LineageTree } from "@/components/archive/LineageTree";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { EntityLink } from "@/components/archive/EntityLink";
import { Prose } from "@/components/archive/RichText";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";
import { fmtNum } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TEAM_PROFILES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = teamBySlug(slug);
  if (!t) return {};
  const profile = t.teamKey ? TEAM_PROFILES.find((p) => p.key === t.teamKey) : undefined;
  const name = profile?.name ?? core().constructors[t.constructorId!]?.name;
  return { title: profile ? `${profile.name} (${profile.years})` : name, description: profile ? plainText(profile.summary) : `${name} in Formula 1: results and statistics.` };
}

const STATUS_TONE = { Active: "neutral", Defunct: "archival", Rebranded: "archival" } as const;

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const t = teamBySlug(slug);
  if (!t) notFound();
  const c = core();
  const profile = t.teamKey ? TEAM_PROFILES.find((p) => p.key === t.teamKey) : undefined;
  const ids = profile ? c.profiledTeams[profile.key] : [t.constructorId!];
  const stats = teamStats(ids, profile?.key);
  const history = profile ? teamHistory(profile.key) : null;
  const name = profile?.name ?? c.constructors[ids[0]]?.name ?? slug;
  const lineageNode = profile?.lineageNode ?? LINEAGE_NODES.find((n) => n.constructorId === ids[0])?.id;
  const accent = profile?.color ?? "#94a3b8";

  // Season-by-season: constructors' standings plus drivers who raced (from results, or drivers' standings).
  const idSet = new Set(ids);
  const cStand = new Map<number, { position: number | null; points: number; wins: number }>();
  if (history) for (const s of history.standings) cStand.set(s.season, s);
  else
    for (const s of standingsIndex().constructors[ids[0]] ?? []) cStand.set(s.season, s);
  const driversBySeason = new Map<number, Set<string>>();
  if (history) for (const r of history.results) (driversBySeason.get(r.season) ?? driversBySeason.set(r.season, new Set()).get(r.season)!).add(r.driverId);
  else
    for (const [did, rows] of Object.entries(standingsIndex().drivers))
      for (const row of rows) if (row.constructorIds.some((x) => idSet.has(x))) (driversBySeason.get(row.season) ?? driversBySeason.set(row.season, new Set()).get(row.season)!).add(did);
  const winsBySeason = new Map<number, number>();
  for (const r of c.races) if (r.winner && idSet.has(r.winner.constructorId)) winsBySeason.set(r.season, (winsBySeason.get(r.season) ?? 0) + 1);
  const seasons = [...new Set([...cStand.keys(), ...driversBySeason.keys(), ...winsBySeason.keys()])].sort((a, b) => a - b);

  const seasonRows: Row[] = seasons.map((y) => {
    const st = cStand.get(y);
    const drivers = [...(driversBySeason.get(y) ?? [])];
    return {
      key: String(y),
      highlight: st?.position === 1,
      cells: {
        season: { sort: y, entity: entity.season(y) },
        pos: { sort: st?.position ?? null, display: st?.position ? `P${st.position}` : y < 1958 ? "n/a" : "—", muted: !st?.position },
        points: { sort: st?.points ?? null, display: st ? fmtNum(st.points) : "—" },
        wins: { sort: winsBySeason.get(y) ?? 0 },
        drivers: {
          sort: drivers.length,
          display: drivers.length > 4 ? `${drivers.slice(0, 3).map((d) => driverName(d).split(" ").at(-1)).join(", ")} +${drivers.length - 3}` : drivers.map((d) => driverName(d).split(" ").at(-1)).join(", "),
        },
      },
    };
  });

  const chart = seasons
    .filter((y) => cStand.get(y)?.position)
    .map((y) => ({ season: y, pos: cStand.get(y)!.position }));

  // Drivers grouped by decade of their first season with the team.
  const firstWith = new Map<string, { first: number; last: number; starts: number; wins: number }>();
  if (history) {
    for (const r of history.results) {
      const e = firstWith.get(r.driverId) ?? { first: r.season, last: r.season, starts: 0, wins: 0 };
      e.last = Math.max(e.last, r.season);
      e.first = Math.min(e.first, r.season);
      e.starts++;
      if (r.position === 1) e.wins++;
      firstWith.set(r.driverId, e);
    }
  } else {
    for (const [y, set] of driversBySeason)
      for (const d of set) {
        const e = firstWith.get(d) ?? { first: y, last: y, starts: 0, wins: 0 };
        e.first = Math.min(e.first, y);
        e.last = Math.max(e.last, y);
        firstWith.set(d, e);
      }
  }
  const decades = new Map<number, [string, { first: number; last: number; starts: number; wins: number }][]>();
  for (const entry of [...firstWith.entries()].sort((a, b) => a[1].first - b[1].first || b[1].wins - a[1].wins)) {
    const d = Math.floor(entry[1].first / 10) * 10;
    (decades.get(d) ?? decades.set(d, []).get(d)!).push(entry);
  }

  const suggestions = profile
    ? profile.key === "brawn"
      ? ["Why did Brawn GP only race one season?", "How did Brawn win the 2009 title?", "What happened to the team after 2009?"]
      : [`What were ${name}'s greatest seasons?`, `Who were ${name}'s most successful drivers?`, `How did ${name} change over the decades?`]
    : [`What did ${name} achieve in Formula 1?`];

  return (
    <>
      <AskContext kind="team" id={profile?.key ?? ids[0]} label={name} suggestions={suggestions} />
      <div className="relative overflow-hidden border-b border-line/60">
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} aria-hidden />
        <div className="absolute inset-0 opacity-[0.07]" style={{ background: `radial-gradient(70% 90% at 10% 0%, ${accent}, transparent 70%)` }} aria-hidden />
        <Container className="relative pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Teams", href: "/teams" }, { label: name }]} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={STATUS_TONE[profile?.status ?? ((stats.lastSeason ?? 0) >= c.currentSeason ? "Active" : "Defunct")]}>
              {profile?.status ?? ((stats.lastSeason ?? 0) >= c.currentSeason ? "Active" : "Inactive")}
            </Badge>
            {profile && profile.status !== "Active" && <span className="text-xs text-muted-strong">Archived team · {profile.years}</span>}
          </div>
          <h1 className="mt-3 font-serif text-6xl tracking-tight">{name}</h1>
          <p className="mt-2 text-body">
            {profile ? (
              <>
                {profile.fullName} · {profile.nationality} · {profile.base} · <span className="tnum">{profile.years}</span>
              </>
            ) : (
              <>
                {c.constructors[ids[0]]?.nationality} constructor · <span className="tnum">{stats.firstSeason}–{stats.lastSeason}</span>
              </>
            )}
          </p>
          {profile && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-body">{plainText(profile.summary)}</p>}

          <StatGrid className="mt-8 lg:grid-cols-6">
            {stats.entries !== undefined && <StatCard label="Grands Prix" value={stats.entries} />}
            <StatCard label="Wins" value={stats.wins} />
            <StatCard label="Poles" value={stats.poles} hint="Grid P1 where qualifying records are unavailable (mostly pre-1994)" />
            {stats.podiums !== undefined && <StatCard label="Podiums" value={stats.podiums} hint="Counted per car, so a 1–2 finish counts twice" />}
            <StatCard label="Drivers' titles" value={stats.driversTitles} />
            <StatCard label="Constructors' titles" value={stats.constructorsTitles} accent={stats.constructorsTitles > 0} />
          </StatGrid>
          {ids.length > 1 && (
            <p className="mt-3 text-xs text-muted-strong">
              Includes every {name} chassis entry, including variants the source lists by engine ({ids.map((i) => c.constructors[i]?.name ?? i).join(", ")}).
            </p>
          )}
          {!profile && <p className="mt-3 text-xs text-muted-strong">Wins, poles and titles are complete. Race-by-race entries are held only for profiled teams.</p>}
        </Container>
      </div>

      <Container>
        {lineageNode && (
          <Section title="Lineage" kicker="How this entry evolved" id="lineage">
            <div className="card overflow-x-auto p-5">
              <LineageTree nodeId={lineageNode} />
            </div>
          </Section>
        )}

        {profile && (
          <Section title="History" serif id="history">
            <div className="space-y-12">
              {profile.chapters.map((ch) => (
                <article key={ch.title} className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div>
                    <p className="tnum text-sm font-medium" style={{ color: accent }}>
                      {ch.era}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl">{ch.title}</h3>
                    <Prose paragraphs={ch.body} className="mt-3" />
                  </div>
                </article>
              ))}
            </div>
            <SourceNote source={profile.source} lastReviewed={profile.lastReviewed} />
          </Section>
        )}

        {chart.length > 2 && (
          <Section title="Championship position over time" kicker="Constructors' championship" id="positions">
            <LineChartCard
              data={chart}
              series={[{ key: "pos", label: name }]}
              xKey="season"
              xLabel="Season"
              yLabel="Position"
              invertY
              yDomain={[1, Math.max(10, ...chart.map((x) => x.pos ?? 0))]}
              caption={`${name}'s finishing position in the constructors' championship (awarded from 1958). Lower is better.`}
            />
          </Section>
        )}

        {profile && profile.cars.length > 0 && (
          <Section title="Notable cars" id="cars">
            <div className="card overflow-hidden">
              <ul className="divide-y divide-line">
                {profile.cars.map((car) => (
                  <li key={car.chassis} className="grid gap-1 px-5 py-4 sm:grid-cols-[120px_1fr_1.4fr] sm:gap-6">
                    <span className="tnum text-sm text-muted-strong">{car.season}</span>
                    <div>
                      <p className="font-medium text-ink">{car.chassis}</p>
                      <p className="text-sm text-body">{car.engine}</p>
                      {car.designers && <p className="text-xs text-muted-strong">Design: {car.designers}</p>}
                    </div>
                    <p className="text-sm text-body">{car.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        <Section title="Drivers" kicker={`${firstWith.size} drivers`} id="drivers">
          <div className="space-y-6">
            {[...decades.entries()].map(([d, list]) => (
              <div key={d}>
                <h3 className="mb-2 text-sm font-semibold">Joined in the {d}s</h3>
                <ul className="flex flex-wrap gap-2">
                  {list.map(([id, e]) => (
                    <li key={id} className="rounded-full border border-line bg-surface px-3 py-1 text-sm">
                      <EntityLink entity={entity.driver(id)} className="no-underline hover:underline" />
                      <span className="tnum ml-1.5 text-xs text-muted-strong">
                        {e.first === e.last ? e.first : `${e.first}–${e.last}`}
                        {e.wins > 0 && ` · ${e.wins} win${e.wins > 1 ? "s" : ""}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Season by season" id="seasons">
          <StandingsTable
            caption={`${name} season-by-season results`}
            columns={[
              { key: "season", label: "Season", primary: true },
              { key: "pos", label: "Position", numeric: true },
              { key: "points", label: "Points", numeric: true },
              { key: "wins", label: "Wins", numeric: true },
              { key: "drivers", label: "Drivers" },
            ]}
            rows={seasonRows}
            initialSort={{ key: "season", dir: "asc" }}
            dense
          />
        </Section>

        <Section title="Ask about this team" kicker="AI">
          <AskPrompts prompts={suggestions} />
        </Section>
      </Container>
    </>
  );
}

// Profiled teams are prebuilt; basic constructor pages render on first request, then cache.
export const dynamicParams = true;

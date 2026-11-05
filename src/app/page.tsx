import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { ERAS } from "@/content/eras";
import { TEAM_PROFILES } from "@/content/teams";
import { DRIVER_PROFILES } from "@/content/drivers";
import { core, driverStats, href, teamStats } from "@/lib/archive/data";
import { entity, plainText } from "@/lib/archive/entities";
import { EntityLink } from "@/components/archive/EntityLink";
import { EraBadge } from "@/components/archive/EraBadge";
import { Container, Section, Badge } from "@/components/ui/primitives";
import { HeroSearch } from "@/components/home/HeroSearch";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";
import { fmtDate, fmtNum } from "@/lib/utils";

// Re-render hourly so "On this day" and the featured picks stay fresh.
export const revalidate = 3600;

const dayOfYear = (d: Date) => Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000);

function onThisDay(today: Date) {
  const c = core();
  const mmdd = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  // Exact date first, then widen to the surrounding week.
  for (const spread of [0, 1, 2, 3]) {
    const days = new Set<string>();
    for (let o = -spread; o <= spread; o++) days.add(mmdd(new Date(today.getTime() + o * 86_400_000)));
    const races = c.races.filter((r) => r.winner && days.has(r.date.slice(5)) && r.season < today.getUTCFullYear());
    if (!races.length) continue;
    // Prefer races won by a champion of that season, then the oldest story.
    const pick =
      races.find((r) => c.seasons.find((s) => s.year === r.season)?.driverChampion?.driverId === r.winner!.driverId && c.profiledDrivers.includes(r.winner!.driverId)) ??
      races.find((r) => c.profiledDrivers.includes(r.winner!.driverId)) ??
      races[0];
    return { race: pick, exact: spread === 0, others: races.filter((r) => r !== pick).slice(0, 3) };
  }
  return null;
}

export default function HomePage() {
  const c = core();
  const today = new Date();
  const otd = onThisDay(today);
  const doy = dayOfYear(today);

  const legends = DRIVER_PROFILES.filter((d) => driverStats(d.id).titles > 0);
  const legend = legends[doy % legends.length];
  const legendStats = driverStats(legend.id);
  const defunct = TEAM_PROFILES.filter((t) => t.status !== "Active");
  const team = defunct[doy % defunct.length];
  const tStats = teamStats(c.profiledTeams[team.key], team.key);
  const iconic = DRIVER_PROFILES.flatMap((d) => d.keyRaces.map((k) => ({ ...k, driverId: d.id })))
    .map((k) => ({ ...k, race: c.races.find((r) => r.season === k.season && r.name.includes(k.race)) }))
    .filter((k) => k.race);
  const icon = iconic[(doy * 7) % iconic.length];

  return (
    <>
      <AskContext
        kind="home"
        suggestions={["Why did Brawn GP only race one season?", "Who were the dominant teams of the turbo era?", "Compare Senna and Prost at McLaren", "Which teams won the title in their first season?"]}
      />
      <section className="hero-wash border-b border-line/60">
        <Container className="pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
          <p className="rise text-sm font-medium text-muted-strong">The Formula 1 World Championship, {c.seasons[0].year}–{c.currentSeason}</p>
          <h1 className="rise mx-auto mt-4 max-w-3xl font-serif text-[44px] leading-[1.05] tracking-tight text-ink sm:text-[64px]">
            Every season. Every team. <span className="italic">Every driver.</span>
          </h1>
          <HeroSearch />
        </Container>
      </section>

      <Container>
        {/* Quick stats */}
        <dl className="-mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Seasons", c.totals.seasons, "/seasons"],
            ["Grands Prix", c.totals.races, "/seasons"],
            ["Drivers", c.totals.drivers, "/drivers"],
            ["Constructors", c.totals.constructors, "/teams"],
          ].map(([label, value, to]) => (
            <Link key={label as string} href={to as string} className="card card-hover px-5 py-4">
              <dt className="text-xs text-muted-strong">{label}</dt>
              <dd className="tnum mt-1 text-3xl font-semibold tracking-tight text-ink">{fmtNum(value as number)}</dd>
            </Link>
          ))}
        </dl>

        {/* On this day */}
        {otd && (
          <Section kicker={otd.exact ? `On this day · ${fmtDate(today.toISOString().slice(0, 10), { day: "numeric", month: "long" })}` : "This week in F1 history"} title="From the archive">
            <div className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-7">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
                <CalendarDays className="size-6" strokeWidth={1.5} aria-hidden />
              </div>
              <div>
                <p className="text-sm text-muted-strong">{fmtDate(otd.race.date, { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mt-1 font-serif text-2xl text-ink sm:text-[28px]">
                  <EntityLink entity={entity.driver(otd.race.winner!.driverId)} className="no-underline hover:underline" /> wins the{" "}
                  <EntityLink entity={entity.race(otd.race.id, otd.race.name)} className="no-underline hover:underline" />
                </p>
                <p className="mt-2 text-body">
                  Driving for <EntityLink entity={entity.team(otd.race.winner!.constructorId)} /> at <EntityLink entity={entity.circuit(otd.race.circuitId)} />
                  {otd.race.pole && otd.race.pole.driverId !== otd.race.winner!.driverId && (
                    <>
                      , with <EntityLink entity={entity.driver(otd.race.pole.driverId)} /> on pole
                    </>
                  )}
                  . It was round {otd.race.round} of the <EntityLink entity={entity.season(otd.race.season)}>{otd.race.season} season</EntityLink>.
                </p>
                {otd.others.length > 0 && (
                  <p className="mt-3 text-sm text-muted-strong">
                    Also around this date:{" "}
                    {otd.others.map((r, i) => (
                      <span key={r.id}>
                        {i > 0 && " · "}
                        <EntityLink entity={entity.race(r.id)} className="text-body" />
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </Section>
        )}

        {/* Era strip */}
        <Section title="Eras" kicker="75 years, ten chapters" action={<Link href="/eras" className="text-sm text-body hover:text-ink">All eras →</Link>}>
          <ol className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
            {ERAS.map((e, i) => (
              <li key={e.slug} className="w-64 shrink-0 snap-start">
                <Link href={`/eras/${e.slug}`} className="card card-hover flex h-full flex-col p-5">
                  <span className="tnum text-xs text-muted-strong">
                    {e.from}–{e.to ?? ""}
                  </span>
                  <span className="mt-2 font-serif text-xl leading-tight text-ink">{e.name}</span>
                  <span className="mt-2 text-sm text-body">{e.tagline}</span>
                  <span className="mt-auto pt-4">
                    <EraBadge era={e} index={i} link={false} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Section>

        {/* Featured */}
        <Section title="Featured today" kicker="From the stacks">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href={href.driver(legend.id)} className="card card-hover group flex flex-col p-6">
              <Badge>Legendary driver</Badge>
              <p className="mt-4 font-serif text-[28px] leading-tight text-ink">{c.drivers[legend.id].name}</p>
              <p className="mt-1 text-sm text-muted-strong">
                {c.drivers[legend.id].nationality} · {legendStats.firstSeason}–{legendStats.lastSeason}
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-body">{plainText(legend.bio[0])}</p>
              <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4">
                {[
                  ["Titles", legendStats.titles],
                  ["Wins", legendStats.wins],
                  ["Poles", legendStats.poles],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <dt className="text-[11px] text-muted-strong">{l}</dt>
                    <dd className="tnum font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Link>

            <Link href={`/teams/${team.slug}`} className="card card-hover flex flex-col overflow-hidden p-0">
              <span className="h-1" style={{ background: team.color }} aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <Badge tone="archival">Defunct team · {team.years}</Badge>
                <p className="mt-4 font-serif text-[28px] leading-tight text-ink">{team.name}</p>
                <p className="mt-1 text-sm text-muted-strong">{team.base}</p>
                <p className="mt-3 line-clamp-3 text-sm text-body">{plainText(team.summary)}</p>
                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4">
                  {[
                    ["Wins", tStats.wins],
                    ["Drivers' titles", tStats.driversTitles],
                    ["Cons. titles", tStats.constructorsTitles],
                  ].map(([l, v]) => (
                    <div key={l as string}>
                      <dt className="text-[11px] text-muted-strong">{l}</dt>
                      <dd className="tnum font-semibold text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Link>

            {icon?.race && (
              <Link href={href.race(icon.race.id)} className="card card-hover flex flex-col p-6">
                <Badge tone="accent">Iconic race</Badge>
                <p className="mt-4 font-serif text-[28px] leading-tight text-ink">
                  {icon.race.season} {icon.race.name}
                </p>
                <p className="mt-1 text-sm text-muted-strong">
                  {fmtDate(icon.race.date)} · {c.circuits[icon.race.circuitId]?.name}
                </p>
                <p className="mt-3 text-sm text-body">
                  {c.drivers[icon.driverId].name}: {icon.note}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-ink">
                  Read the race <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            )}
          </div>
        </Section>

        {/* Featured seasons */}
        <Section title="Deep-dive seasons" kicker="Full results, standings and stories">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.featuredSeasons.map((y) => {
              const s = c.seasons.find((x) => x.year === y)!;
              return (
                <Link key={y} href={href.season(y)} className="card card-hover p-5">
                  <p className="tnum font-serif text-4xl text-ink">{y}</p>
                  <p className="mt-2 text-sm text-body">
                    {s.driverChampion ? c.drivers[s.driverChampion.driverId].name : "—"} · {s.rounds} races
                  </p>
                </Link>
              );
            })}
          </div>
        </Section>

        <Section title="Ask the Archive" kicker="AI, grounded in the archive">
          <p className="mb-4 max-w-2xl text-body">Ask a question in plain English. Answers draw only on the archive's records and cite the pages they use.</p>
          <AskPrompts
            prompts={["Why did Brawn GP only race one season?", "Who were the dominant teams of the turbo era?", "Compare Senna and Prost at McLaren", "Explain the 1976 season in 30 seconds"]}
          />
        </Section>
      </Container>
    </>
  );
}

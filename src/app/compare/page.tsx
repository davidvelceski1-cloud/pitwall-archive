import type { Metadata } from "next";
import { TEAM_PROFILES } from "@/content/teams";
import { core, driverIdBySlug, driverStats, href, standingsIndex, teamHistory, teamStats } from "@/lib/archive/data";
import { entity } from "@/lib/archive/entities";
import { teammateSummary } from "@/lib/archive/teammates";
import { Breadcrumbs, Container, Section } from "@/components/ui/primitives";
import { EntityLink } from "@/components/archive/EntityLink";
import { ComparePicker } from "@/components/compare/ComparePicker";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";
import { fmtNum, ordinal } from "@/lib/utils";

export const metadata: Metadata = { title: "Compare", description: "Compare Formula 1 drivers or teams side by side." };

type Props = { searchParams: Promise<{ type?: string; ids?: string }> };

const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;
  const c = core();
  const type = sp.type === "teams" ? "teams" : "drivers";
  const driverOpts = c.profiledDrivers.map((id) => ({ slug: href.driver(id).split("/").at(-1)!, name: c.drivers[id].name }));
  const teamOpts = TEAM_PROFILES.map((t) => ({ slug: t.slug, name: t.name }));
  const fallback = type === "drivers" ? ["ayrton-senna", "alain-prost"] : ["ferrari", "mclaren"];
  const valid = new Set((type === "drivers" ? driverOpts : teamOpts).map((o) => o.slug));
  let slugs = (sp.ids ?? "").split(",").filter((s) => valid.has(s)).slice(0, 3);
  if (slugs.length < 2) slugs = fallback;

  let body: React.ReactNode;
  let prompts: string[] = [];

  if (type === "drivers") {
    const ids = slugs.map((s) => driverIdBySlug(s)!);
    const stats = ids.map((id) => driverStats(id));
    const names = ids.map((id) => c.drivers[id].name);
    const rows: [string, (i: number) => string][] = [
      ["Titles", (i) => fmtNum(stats[i].titles)],
      ["Wins", (i) => fmtNum(stats[i].wins)],
      ["Poles", (i) => fmtNum(stats[i].poles)],
      ["Podiums", (i) => fmtNum(stats[i].podiums)],
      ["Starts", (i) => fmtNum(stats[i].starts)],
      ["Win rate", (i) => pct(stats[i].wins, stats[i].starts ?? 0)],
      ["Pole rate", (i) => pct(stats[i].poles, stats[i].starts ?? 0)],
      ["Seasons", (i) => `${stats[i].seasons.length} (${stats[i].firstSeason}–${stats[i].lastSeason})`],
    ];
    // Career curve: cumulative wins by career season number.
    const maxLen = Math.max(...stats.map((s) => s.seasons.length));
    const curve = Array.from({ length: maxLen }, (_, k) => {
      const row: Record<string, number | string | null> = { year: k + 1 };
      ids.forEach((id, i) => {
        const y = stats[i].seasons[k];
        row[id] = y === undefined ? null : c.races.filter((r) => r.season <= y && r.winner?.driverId === id).length;
      });
      return row;
    });
    const peaks = ids.map((id) =>
      [...(standingsIndex().drivers[id] ?? [])].sort((a, b) => (a.position ?? 99) - (b.position ?? 99) || b.wins - a.wins).slice(0, 3),
    );
    const h2h = ids.length === 2 ? teammateSummary(ids[0]).find((m) => m.driverId === ids[1]) : undefined;
    prompts = [`Compare ${names.join(" and ")}`, `Who was faster, ${names[0].split(" ").at(-1)} or ${names[1].split(" ").at(-1)}?`];

    body = (
      <>
        <Section title="Career statistics">
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Career statistics comparison</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted-strong">
                    Statistic
                  </th>
                  {ids.map((id) => (
                    <th key={id} scope="col" className="px-4 py-3 text-right font-medium">
                      <EntityLink entity={entity.driver(id)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => {
                  const vals = ids.map((_, i) => get(i));
                  const nums = vals.map((v) => parseFloat(v.replace(/[,%]/g, "")));
                  const best = Math.max(...nums.filter((n) => !Number.isNaN(n)));
                  return (
                    <tr key={label} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal text-body">
                        {label}
                      </th>
                      {vals.map((v, i) => (
                        <td key={i} className={`tnum px-4 py-2.5 text-right ${nums[i] === best && label !== "Seasons" ? "font-semibold text-ink" : "text-body"}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {h2h && (
            <p className="card mt-4 px-5 py-4 text-sm text-body">
              <span className="font-medium text-ink">As teammates</span> ({h2h.seasons}, {h2h.races} races): {names[0]} finished ahead {h2h.ahead} times and {names[1]}{" "}
              {h2h.behind} times when both were classified. Grid: {h2h.gridAhead}–{h2h.gridBehind}.
            </p>
          )}
        </Section>
        <Section title="Career curves" kicker="Cumulative wins by career season">
          <LineChartCard
            data={curve}
            series={ids.map((id) => ({ key: id, label: c.drivers[id].name }))}
            xKey="year"
            xLabel="Career season"
            yLabel="Wins"
            xPrefix="Yr "
            caption="Cumulative Grand Prix wins at the end of each season of their careers, aligned by season number."
          />
        </Section>
        <Section title="Peak seasons" kicker="Best championship finishes">
          <div className="grid gap-4 md:grid-cols-3">
            {ids.map((id, i) => (
              <div key={id} className="card p-5">
                <p className="font-medium text-ink">{names[i]}</p>
                <ol className="mt-3 space-y-2 text-sm">
                  {peaks[i].map((p) => (
                    <li key={p.season} className="flex justify-between">
                      <EntityLink entity={entity.season(p.season)} />
                      <span className="tnum text-body">
                        {p.position ? ordinal(p.position) : "—"} · {p.wins} wins
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Section>
      </>
    );
  } else {
    const profiles = slugs.map((s) => TEAM_PROFILES.find((t) => t.slug === s)!);
    const stats = profiles.map((p) => teamStats(c.profiledTeams[p.key], p.key));
    const rows: [string, (i: number) => string][] = [
      ["Constructors' titles", (i) => fmtNum(stats[i].constructorsTitles)],
      ["Drivers' titles", (i) => fmtNum(stats[i].driversTitles)],
      ["Wins", (i) => fmtNum(stats[i].wins)],
      ["Poles", (i) => fmtNum(stats[i].poles)],
      ["Podiums", (i) => fmtNum(stats[i].podiums)],
      ["Grands Prix", (i) => fmtNum(stats[i].entries)],
      ["Win rate", (i) => pct(stats[i].wins, stats[i].entries ?? 0)],
    ];
    const allYears = [...new Set(profiles.flatMap((p) => teamHistory(p.key)!.standings.map((s) => s.season)))].sort((a, b) => a - b);
    const curve = allYears.map((y) => {
      const row: Record<string, number | string | null> = { season: y };
      profiles.forEach((p) => {
        row[p.key] = teamHistory(p.key)!.standings.find((s) => s.season === y)?.position ?? null;
      });
      return row;
    });
    const peaks = profiles.map((p) => [...teamHistory(p.key)!.standings].sort((a, b) => (a.position ?? 99) - (b.position ?? 99) || b.wins - a.wins).slice(0, 3));
    prompts = [`Compare ${profiles.map((p) => p.name).join(" and ")}`, `Which was more dominant at its peak, ${profiles[0].name} or ${profiles[1].name}?`];

    body = (
      <>
        <Section title="Team statistics">
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Team statistics comparison</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-3 text-left font-medium text-muted-strong">
                    Statistic
                  </th>
                  {profiles.map((p) => (
                    <th key={p.key} scope="col" className="px-4 py-3 text-right font-medium">
                      <span className="mr-1.5 inline-block h-3 w-1 rounded-full align-middle" style={{ background: p.color }} aria-hidden />
                      <EntityLink entity={entity.team(p.key)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => {
                  const vals = profiles.map((_, i) => get(i));
                  const nums = vals.map((v) => parseFloat(v.replace(/[,%]/g, "")));
                  const best = Math.max(...nums.filter((n) => !Number.isNaN(n)));
                  return (
                    <tr key={label} className="border-b border-line last:border-0">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal text-body">
                        {label}
                      </th>
                      {vals.map((v, i) => (
                        <td key={i} className={`tnum px-4 py-2.5 text-right ${nums[i] === best ? "font-semibold text-ink" : "text-body"}`}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Championship curves" kicker="Constructors' championship position">
          <LineChartCard
            data={curve}
            series={profiles.map((p) => ({ key: p.key, label: p.name }))}
            xKey="season"
            xLabel="Season"
            yLabel="Position"
            invertY
            yDomain={[1, 12]}
            caption="Finishing position in the constructors' championship by season (from 1958). Lower is better; gaps are seasons the team did not compete."
          />
        </Section>
        <Section title="Peak seasons" kicker="Best constructors' finishes">
          <div className="grid gap-4 md:grid-cols-3">
            {profiles.map((p, i) => (
              <div key={p.key} className="card p-5">
                <p className="font-medium text-ink">{p.name}</p>
                <ol className="mt-3 space-y-2 text-sm">
                  {peaks[i].map((s) => (
                    <li key={s.season} className="flex justify-between">
                      <EntityLink entity={entity.season(s.season)} />
                      <span className="tnum text-body">
                        {s.position ? ordinal(s.position) : "—"} · {s.wins} wins
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </Section>
      </>
    );
  }

  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={prompts} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Compare</h1>
      <p className="mt-3 max-w-2xl text-body">Put two or three profiled drivers or teams side by side.</p>
      <div className="mt-6">
        <ComparePicker type={type} selected={slugs} drivers={driverOpts} teams={teamOpts} />
      </div>
      {body}
      <Section title="Ask the Archive" kicker="AI">
        <AskPrompts prompts={prompts} />
      </Section>
    </Container>
  );
}

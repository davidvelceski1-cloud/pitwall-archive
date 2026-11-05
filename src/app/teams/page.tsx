import type { Metadata } from "next";
import { FEATURED_CHAINS, LINEAGE_NODES } from "@/content/lineage";
import { TEAM_PROFILES } from "@/content/teams";
import { core, href, standingsIndex, teamKeyOf, teamStats } from "@/lib/archive/data";
import { plainText } from "@/lib/archive/entities";
import { Breadcrumbs, Container, Section } from "@/components/ui/primitives";
import { TeamDirectory, type TeamCard } from "@/components/teams/TeamDirectory";
import { LineageTree } from "@/components/archive/LineageTree";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Teams",
  description: "Every Formula 1 constructor, active and defunct, with histories, lineage and statistics.",
};

export default function TeamsPage() {
  const c = core();
  const cards: TeamCard[] = TEAM_PROFILES.map((t) => {
    const s = teamStats(c.profiledTeams[t.key], t.key);
    return {
      slug: t.slug,
      href: `/teams/${t.slug}`,
      name: t.name,
      nationality: t.nationality,
      years: t.years,
      status: t.status,
      color: t.color,
      firstSeason: s.firstSeason ?? 0,
      titles: s.constructorsTitles,
      driversTitles: s.driversTitles,
      wins: s.wins,
      summary: plainText(t.summary),
      profiled: true,
    };
  });
  // Every other constructor that scored or won, as a basic card.
  const scoring = new Set(Object.entries(standingsIndex().constructors).filter(([, rows]) => rows.some((r) => r.points > 0)).map(([id]) => id));
  for (const r of c.races) if (r.winner) scoring.add(r.winner.constructorId);
  for (const id of scoring) {
    if (teamKeyOf(id) || !c.constructors[id]) continue;
    const s = teamStats([id]);
    const active = (s.lastSeason ?? 0) >= c.currentSeason;
    cards.push({
      slug: id,
      href: href.constructor(id),
      name: c.constructors[id].name,
      nationality: c.constructors[id].nationality,
      years: s.firstSeason === s.lastSeason ? `${s.firstSeason}` : `${s.firstSeason}–${active ? "" : s.lastSeason}`,
      status: active ? "Active" : LINEAGE_NODES.some((n) => n.constructorId === id) ? "Rebranded" : "Defunct",
      firstSeason: s.firstSeason ?? 0,
      titles: s.constructorsTitles,
      driversTitles: s.driversTitles,
      wins: s.wins,
      profiled: false,
    });
  }

  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={["Why did Brawn GP only race one season?", "Which team has won the most constructors' titles?", "How did Tyrrell become Mercedes?"]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Teams" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Teams</h1>
      <p className="mt-3 max-w-2xl text-body">
        Constructors from the works teams of the 1950s to today's grid. Teams that no longer exist are kept here as archives, with the same depth as active ones.
      </p>
      <div className="mt-8">
        <TeamDirectory teams={cards} />
      </div>

      <Section title="How teams became other teams" kicker="Lineage" serif>
        <p className="mb-6 max-w-2xl text-body">
          Many of today's teams descend from entries that changed hands and names. These are the five longest-running chains on the current grid.
        </p>
        <div className="space-y-4">
          {FEATURED_CHAINS.map((id) => (
            <div key={id} className="card overflow-x-auto p-4">
              <LineageTree nodeId={id} current="__none" />
            </div>
          ))}
        </div>
      </Section>
    </Container>
  );
}

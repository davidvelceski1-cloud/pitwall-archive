import type { Metadata } from "next";
import { ERAS, eraOfYear } from "@/content/eras";
import { core, driverName, teamDisplayName } from "@/lib/archive/data";
import { Container, Breadcrumbs } from "@/components/ui/primitives";
import { SeasonGrid } from "@/components/seasons/SeasonGrid";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Seasons",
  description: "Every Formula 1 World Championship season from 1950 to today: champions, calendars, standings and stories.",
};
export const revalidate = 3600;

export default function SeasonsPage() {
  const c = core();
  const seasons = [...c.seasons].reverse().map((s) => {
    const era = eraOfYear(s.year);
    return {
      year: s.year,
      rounds: s.rounds,
      status: s.status,
      champion: s.driverChampion ? driverName(s.driverChampion.driverId) : undefined,
      constructor: s.constructorChampion ? teamDisplayName(s.constructorChampion.constructorId) : undefined,
      era: era.slug,
      eraName: era.name,
      detailed: s.detailed,
    };
  });
  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={["Which seasons were decided at the final race?", "Who has won the most drivers' titles?", "What changed in the 2009 regulations?"]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Seasons" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Seasons</h1>
      <p className="mt-3 max-w-2xl text-body">
        {c.seasons.length} championships, from Silverstone in {c.seasons[0].year} to the {c.currentSeason} season. Every season has its calendar, winners and final
        standings. The deep-dive seasons add full race results, points progression and the story of the year.
      </p>
      <div className="mt-8">
        <SeasonGrid seasons={seasons} eras={ERAS.map((e) => ({ slug: e.slug, name: e.name }))} />
      </div>
    </Container>
  );
}

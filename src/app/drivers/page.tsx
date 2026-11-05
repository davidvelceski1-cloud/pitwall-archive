import type { Metadata } from "next";
import { ERAS, eraOfYear } from "@/content/eras";
import { core, driverCareer, driverStats, href, standingsIndex, teamDisplayName } from "@/lib/archive/data";
import { Breadcrumbs, Container } from "@/components/ui/primitives";
import { DriverDirectory, type DriverCard } from "@/components/drivers/DriverDirectory";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Drivers",
  description: "Every Formula 1 driver in the archive, searchable by nationality, era, team and titles.",
};

export default function DriversPage() {
  const c = core();
  const idx = standingsIndex().drivers;
  const winningTeams = new Set<string>();
  for (const r of c.races) if (r.winner) winningTeams.add(teamDisplayName(r.winner.constructorId));

  const cards: DriverCard[] = Object.values(c.drivers).map((d) => {
    const s = driverStats(d.id);
    const career = driverCareer(d.id);
    const teamIds = new Set<string>([...(idx[d.id] ?? []).flatMap((x) => x.constructorIds), ...(career?.results.map((r) => r.constructorId) ?? [])]);
    const eras = new Set(s.seasons.map((y) => eraOfYear(y).slug));
    return {
      href: href.driver(d.id),
      name: d.name,
      nationality: d.nationality,
      first: s.firstSeason,
      last: s.lastSeason,
      titles: s.titles,
      wins: s.wins,
      poles: s.poles,
      teams: [...new Set([...teamIds].map(teamDisplayName))],
      eras: [...eras],
      profiled: c.profiledDrivers.includes(d.id),
    };
  });

  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={["Who has the most wins in Formula 1 history?", "Which drivers won their first ever championship race?", "Compare Senna and Prost at McLaren"]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Drivers" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Drivers</h1>
      <p className="mt-3 max-w-2xl text-body">
        {cards.length.toLocaleString()} drivers who won, took pole, scored, or appear in the archive's detailed records. Wins, poles and titles are complete for
        everyone. Profiled drivers also have every race of their career.
      </p>
      <div className="mt-8">
        <DriverDirectory drivers={cards} eras={ERAS.map((e) => ({ slug: e.slug, name: e.name }))} teams={[...winningTeams].sort()} currentSeason={c.currentSeason} />
      </div>
    </Container>
  );
}

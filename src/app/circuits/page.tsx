import type { Metadata } from "next";
import { CIRCUIT_PROFILES } from "@/content/circuits";
import { core, href } from "@/lib/archive/data";
import { entity } from "@/lib/archive/entities";
import { Breadcrumbs, Container, Section } from "@/components/ui/primitives";
import { WorldMap } from "@/components/circuits/WorldMap";
import { StandingsTable, type Row } from "@/components/archive/StandingsTable";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Circuits",
  description: "Every circuit that has hosted a Formula 1 World Championship race, on a world map.",
};

export default function CircuitsPage() {
  const c = core();
  const current = new Set(c.races.filter((r) => r.season === c.currentSeason).map((r) => r.circuitId));
  const list = Object.values(c.circuits)
    .map((ci) => {
      const races = c.races.filter((r) => r.circuitId === ci.id && (r.winner || r.season === c.currentSeason));
      return { ci, races };
    })
    .filter((x) => x.races.length);

  const rows: Row[] = list.map(({ ci, races }) => ({
    key: ci.id,
    cells: {
      name: { sort: ci.name, entity: entity.circuit(ci.id), display: ci.name },
      place: { sort: ci.country, display: `${ci.locality}, ${ci.country}` },
      races: { sort: races.filter((r) => r.winner).length },
      years: { sort: races[0].season, display: `${races[0].season}–${races.at(-1)!.season}` },
    },
  }));

  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={["Which circuit has hosted the most Grands Prix?", "Who has won the most races at Monaco?", "How has Spa changed over the years?"]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Circuits" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Circuits</h1>
      <p className="mt-3 max-w-2xl text-body">
        {list.length} venues have hosted a World Championship race, from airfields and public roads to purpose-built stadium circuits. {CIRCUIT_PROFILES.length} have
        full profiles with layout history.
      </p>
      <div className="mt-8">
        <WorldMap
          circuits={list.map(({ ci, races }) => ({
            id: ci.id,
            href: href.circuit(ci.id),
            name: ci.name,
            place: `${ci.locality}, ${ci.country}`,
            lat: ci.lat,
            lng: ci.lng,
            races: Math.max(1, races.filter((r) => r.winner).length),
            first: races[0].season,
            last: races.at(-1)!.season,
            current: current.has(ci.id),
          }))}
        />
      </div>
      <Section title="All circuits">
        <StandingsTable
          caption="Formula 1 circuits"
          columns={[
            { key: "name", label: "Circuit", primary: true },
            { key: "place", label: "Location" },
            { key: "races", label: "Grands Prix", numeric: true },
            { key: "years", label: "Years" },
          ]}
          rows={rows}
          initialSort={{ key: "races", dir: "desc" }}
          dense
        />
      </Section>
    </Container>
  );
}

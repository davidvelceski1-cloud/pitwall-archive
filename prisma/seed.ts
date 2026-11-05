/**
 * Seeds PostgreSQL from data/generated (built by scripts/build-archive.ts) and the
 * editorial content in src/content. Idempotent: clears and reloads every table.
 *
 *   npm run db:push && npm run db:seed
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import type { Core, DriverCareer, SeasonDetail, TeamHistory, ResultRow } from "../src/lib/archive/types";
import { buildSlugMaps } from "../src/lib/archive/slugs";
import { TEAM_PROFILES } from "../src/content/teams";
import { DRIVER_PROFILES } from "../src/content/drivers";
import { SEASON_EDITORIALS } from "../src/content/seasons";
import { ERAS } from "../src/content/eras";
import { CIRCUIT_PROFILES } from "../src/content/circuits";
import { LINEAGE_EDGES, LINEAGE_NODES } from "../src/content/lineage";

const prisma = new PrismaClient();
const DIR = join(import.meta.dirname, "..", "data", "generated");
const read = <T>(f: string): T => JSON.parse(readFileSync(join(DIR, f), "utf8"));
const day = (iso?: string) => (iso ? new Date(`${iso}T00:00:00Z`) : null);

async function chunked<T>(rows: T[], size: number, fn: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await fn(rows.slice(i, i + size));
}

async function main() {
  if (!existsSync(join(DIR, "core.json"))) throw new Error("Run `npm run data:fetch && npm run data:build` first.");
  const core = read<Core>("core.json");
  const slugs = buildSlugMaps(core, TEAM_PROFILES);

  console.log("Clearing tables…");
  await prisma.$transaction([
    prisma.editorial.deleteMany(),
    prisma.constructorLineage.deleteMany(),
    prisma.qualifying.deleteMany(),
    prisma.result.deleteMany(),
    prisma.driverStanding.deleteMany(),
    prisma.constructorStanding.deleteMany(),
    prisma.race.deleteMany(),
    prisma.season.deleteMany(),
    prisma.driver.deleteMany(),
    prisma.constructor.deleteMany(),
    prisma.circuit.deleteMany(),
  ]);

  console.log("Reference tables…");
  await prisma.season.createMany({ data: core.seasons.map((s) => ({ year: s.year, rounds: s.rounds, status: s.status, detailed: s.detailed })) });
  await prisma.circuit.createMany({ data: Object.values(core.circuits) });
  await prisma.driver.createMany({
    data: Object.values(core.drivers).map((d) => ({
      id: d.id,
      slug: slugs.driverSlug.get(d.id)!,
      givenName: d.given,
      familyName: d.family,
      nationality: d.nationality,
      dob: day(d.dob),
      code: d.code,
      number: d.number,
      wiki: d.wiki,
    })),
  });
  await prisma.constructor.createMany({
    data: Object.values(core.constructors).map((c) => ({
      id: c.id,
      slug: slugs.constructorSlug.get(c.id)!,
      name: c.name,
      nationality: c.nationality,
      teamKey: slugs.teamKeyOf.get(c.id) ?? null,
    })),
  });
  await chunked(core.races, 500, (batch) =>
    prisma.race.createMany({
      data: batch.map((r) => ({
        id: r.id,
        season: r.season,
        round: r.round,
        name: r.name,
        date: day(r.date)!,
        circuitId: r.circuitId,
        wiki: r.wiki,
        winnerDriverId: r.winner?.driverId,
        winnerConstructorId: r.winner?.constructorId,
        poleDriverId: r.pole?.driverId,
        poleSource: r.pole?.source,
        fastestLapDriverId: r.fastestLap?.driverId,
        fastestLapTime: r.fastestLap?.time,
      })),
    }),
  );

  console.log("Results, qualifying and standings…");
  // Union of every result row the archive holds (featured seasons, profiled teams and drivers).
  const results = new Map<string, ResultRow>();
  const add = (rows: ResultRow[]) => rows.forEach((r) => results.set(`${r.raceId}|${r.driverId}|${r.constructorId}|${r.number ?? ""}|${r.grid}`, r));
  for (const f of readdirSync(join(DIR, "seasons"))) {
    const s = read<SeasonDetail>(`seasons/${f}`);
    add(s.results);
    await prisma.driverStanding.createMany({ data: s.driverStandings.map((d) => ({ season: s.year, driverId: d.driverId, position: d.position, points: d.points, wins: d.wins, constructorIds: d.constructorIds })) });
    await prisma.constructorStanding.createMany({ data: s.constructorStandings.map((d) => ({ season: s.year, constructorId: d.constructorId, position: d.position, points: d.points, wins: d.wins })) });
    if (s.qualifying.length) await prisma.qualifying.createMany({ data: s.qualifying });
  }
  for (const f of readdirSync(join(DIR, "teams"))) add(read<TeamHistory>(`teams/${f}`).results);
  for (const f of readdirSync(join(DIR, "drivers"))) {
    const d = read<DriverCareer>(`drivers/${f}`);
    add(d.results);
    add(d.teammateResults);
  }
  await chunked([...results.values()], 2000, (batch) =>
    prisma.result.createMany({
      data: batch.map(({ season: _s, round: _r, ...r }) => r),
    }),
  );

  console.log("Lineage…");
  const nodeConstructor = (id: string) => {
    const n = LINEAGE_NODES.find((x) => x.id === id);
    return n?.teamKey ? core.profiledTeams[n.teamKey]?.[0] : n?.constructorId;
  };
  await prisma.constructorLineage.createMany({
    data: LINEAGE_EDGES.flatMap((e) => {
      const from = nodeConstructor(e.from);
      const to = nodeConstructor(e.to);
      return from && to && core.constructors[from] && core.constructors[to] ? [{ predecessorId: from, successorId: to, year: e.year, type: e.type, note: e.note }] : [];
    }),
    skipDuplicates: true,
  });

  console.log("Editorial…");
  const editorial = [
    ...SEASON_EDITORIALS.flatMap((s) => [
      ...s.story.map((body, i) => ({ entityType: "season", entityId: String(s.year), section: `story:${i + 1}`, title: i === 0 ? s.headline : null, body, source: s.source, lastReviewed: day(s.lastReviewed)! })),
      ...s.moments.map((m) => ({ entityType: "season", entityId: String(s.year), section: `moment:${m.kind}`, title: m.title, body: m.text, source: s.source, lastReviewed: day(s.lastReviewed)! })),
    ]),
    ...TEAM_PROFILES.flatMap((t) => [
      { entityType: "team", entityId: t.key, section: "summary", title: t.fullName, body: t.summary, source: t.source, lastReviewed: day(t.lastReviewed)! },
      ...t.chapters.flatMap((ch) => ch.body.map((body) => ({ entityType: "team", entityId: t.key, section: `chapter:${ch.era}`, title: ch.title, body, source: t.source, lastReviewed: day(t.lastReviewed)! }))),
    ]),
    ...DRIVER_PROFILES.flatMap((d) => d.bio.map((body, i) => ({ entityType: "driver", entityId: d.id, section: `bio:${i + 1}`, title: null, body, source: d.source, lastReviewed: day(d.lastReviewed)! }))),
    ...ERAS.flatMap((e) => e.intro.map((body, i) => ({ entityType: "era", entityId: e.slug, section: `intro:${i + 1}`, title: e.name, body, source: e.source, lastReviewed: day(e.lastReviewed)! }))),
    ...CIRCUIT_PROFILES.map((c) => ({ entityType: "circuit", entityId: c.id, section: "summary", title: null, body: c.summary, source: c.source, lastReviewed: day(c.lastReviewed)! })),
  ];
  await prisma.editorial.createMany({ data: editorial });

  console.log(`Seeded ${core.races.length} races, ${results.size} results, ${editorial.length} editorial passages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

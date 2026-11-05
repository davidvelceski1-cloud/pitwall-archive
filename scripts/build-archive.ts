/**
 * Turns the raw Jolpica responses in data/fetched/ into the archive's own compact files in
 * data/generated/ (read by the app at build/request time, and by prisma/seed.ts).
 *
 *   node scripts/build-archive.ts
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { CURRENT_SEASON, FEATURED_SEASONS, PROFILED_DRIVERS, PROFILED_TEAMS, TEAM_FIRST_SEASON } from "./config.ts";
import type {
  Circuit,
  ConstructorRef,
  ConstructorStanding,
  Core,
  DriverCareer,
  DriverRef,
  DriverStanding,
  Race,
  ResultRow,
  SeasonDetail,
  SeasonSummary,
  TeamHistory,
} from "../src/lib/archive/types.ts";

const ROOT = join(import.meta.dirname, "..", "data");
const OUT = join(ROOT, "generated");
const read = (name: string): any => JSON.parse(readFileSync(join(ROOT, "fetched", `${name}.json`), "utf8"));
const write = (path: string, data: unknown) => writeFileSync(join(OUT, path), JSON.stringify(data));

// Jolpica returns some names with HTML entities (e.g. "Lotus-Pratt &amp; Whitney").
const clean = (s: string) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const num = (s: unknown) => (s === undefined || s === null || s === "" ? NaN : Number(s));

const drivers: Record<string, DriverRef> = {};
const constructors: Record<string, ConstructorRef> = {};

function noteDriver(d: any) {
  if (!d || drivers[d.driverId]) return;
  const given = clean(d.givenName);
  const family = clean(d.familyName);
  drivers[d.driverId] = {
    id: d.driverId,
    name: `${given} ${family}`,
    given,
    family,
    nationality: d.nationality,
    dob: d.dateOfBirth || undefined,
    code: d.code || undefined,
    number: d.permanentNumber || undefined,
    wiki: d.url || undefined,
  };
}
function noteConstructor(c: any) {
  if (!c || constructors[c.constructorId]) return;
  constructors[c.constructorId] = { id: c.constructorId, name: clean(c.name), nationality: c.nationality };
}

const raceId = (r: any) => `${r.season}-${r.round}`;

function toRow(race: any, r: any): ResultRow {
  noteDriver(r.Driver);
  noteConstructor(r.Constructor);
  const classified = /^\d+$/.test(r.positionText);
  return {
    raceId: raceId(race),
    season: Number(race.season),
    round: Number(race.round),
    driverId: r.Driver.driverId,
    constructorId: r.Constructor.constructorId,
    number: r.number || undefined,
    grid: Number(r.grid) || 0,
    position: classified ? Number(r.positionText) : null,
    positionText: r.positionText,
    points: Number(r.points) || 0,
    status: r.status,
    laps: Number(r.laps) || 0,
    time: r.Time?.time,
    fastestLapRank: r.FastestLap?.rank ? Number(r.FastestLap.rank) : undefined,
    fastestLapTime: r.FastestLap?.Time?.time,
  };
}
const rowsOf = (races: any[]) => races.flatMap((race) => (race.Results ?? []).map((r: any) => toRow(race, r)));

function driverStandings(list: any): DriverStanding[] {
  if (!list) return [];
  return list.DriverStandings.map((s: any) => {
    noteDriver(s.Driver);
    s.Constructors.forEach(noteConstructor);
    return {
      position: Number.isFinite(num(s.position)) ? num(s.position) : null,
      driverId: s.Driver.driverId,
      constructorIds: s.Constructors.map((c: any) => c.constructorId),
      points: Number(s.points) || 0,
      wins: Number(s.wins) || 0,
    };
  });
}
function constructorStandings(list: any): ConstructorStanding[] {
  if (!list) return [];
  return list.ConstructorStandings.map((s: any) => {
    noteConstructor(s.Constructor);
    return {
      position: Number.isFinite(num(s.position)) ? num(s.position) : null,
      constructorId: s.Constructor.constructorId,
      points: Number(s.points) || 0,
      wins: Number(s.wins) || 0,
    };
  });
}

function main() {
  rmSync(OUT, { recursive: true, force: true });
  for (const dir of ["", "seasons", "drivers", "teams"]) mkdirSync(join(OUT, dir), { recursive: true });

  // ── Circuits & races ────────────────────────────────────────────────
  const circuits: Record<string, Circuit> = {};
  for (const c of read("circuits"))
    circuits[c.circuitId] = {
      id: c.circuitId,
      name: clean(c.circuitName),
      locality: clean(c.Location.locality),
      country: clean(c.Location.country),
      lat: Number(c.Location.lat),
      lng: Number(c.Location.long),
      wiki: c.url,
    };

  const byId = new Map<string, Race>();
  for (const r of read("races")) {
    if (Number(r.season) > CURRENT_SEASON) continue;
    byId.set(raceId(r), {
      id: raceId(r),
      season: Number(r.season),
      round: Number(r.round),
      name: clean(r.raceName),
      date: r.date,
      circuitId: r.Circuit.circuitId,
      wiki: r.url,
    });
  }
  const ref = (r: any) => {
    noteDriver(r.Driver);
    noteConstructor(r.Constructor);
    return { driverId: r.Driver.driverId, constructorId: r.Constructor.constructorId };
  };
  for (const race of read("winners")) {
    const r = byId.get(raceId(race));
    if (r && race.Results?.[0]) r.winner = ref(race.Results[0]);
  }
  for (const race of read("grid1")) {
    const r = byId.get(raceId(race));
    if (r && race.Results?.[0]) r.pole = { ...ref(race.Results[0]), source: "grid" };
  }
  for (const race of read("quali1")) {
    const r = byId.get(raceId(race));
    if (r && race.QualifyingResults?.[0]) r.pole = { ...ref(race.QualifyingResults[0]), source: "qualifying" };
  }
  for (const race of read("fastest")) {
    const r = byId.get(raceId(race));
    const res = race.Results?.[0];
    if (r && res?.FastestLap?.Time?.time) r.fastestLap = { ...ref(res), time: res.FastestLap.Time.time };
  }
  const races = [...byId.values()].sort((a, b) => a.season - b.season || a.round - b.round);

  // ── Standings for every season ──────────────────────────────────────
  const standings = read("standings") as Record<string, { drivers: any; constructors: any }>;
  const detail = read("seasons-detail") as Record<string, { results: any[]; qualifying: any[] }>;
  const seasonYears = (read("seasons") as number[]).sort((a, b) => a - b);
  const driverSeasons: Record<string, (DriverStanding & { season: number })[]> = {};
  const constructorSeasons: Record<string, (ConstructorStanding & { season: number })[]> = {};
  const summaries: SeasonSummary[] = [];

  for (const year of seasonYears) {
    const ds = driverStandings(standings[year]?.drivers);
    const cs = constructorStandings(standings[year]?.constructors);
    for (const s of ds) (driverSeasons[s.driverId] ??= []).push({ ...s, season: year });
    for (const s of cs) (constructorSeasons[s.constructorId] ??= []).push({ ...s, season: year });

    const yearRaces = races.filter((r) => r.season === year);
    const done = yearRaces.filter((r) => r.winner).length;
    const status: SeasonSummary["status"] = done === 0 ? "upcoming" : done < yearRaces.length ? "in-progress" : "complete";
    const d = detail[year];
    const results = d ? rowsOf(d.results) : [];
    const qualifying = d
      ? d.qualifying.flatMap((race: any) =>
          race.QualifyingResults.map((q: any) => {
            noteDriver(q.Driver);
            noteConstructor(q.Constructor);
            return {
              raceId: raceId(race),
              driverId: q.Driver.driverId,
              constructorId: q.Constructor.constructorId,
              position: Number(q.position),
              q1: q.Q1 || undefined,
              q2: q.Q2 || undefined,
              q3: q.Q3 || undefined,
            };
          }),
        )
      : [];
    const season: SeasonDetail = {
      year,
      results,
      qualifying,
      driverStandings: ds,
      constructorStandings: cs,
      standingsRound: Number(standings[year]?.drivers?.round) || 0,
    };
    write(`seasons/${year}.json`, season);

    const champ = status === "complete" ? ds.find((s) => s.position === 1) : undefined;
    const cchamp = status === "complete" ? cs.find((s) => s.position === 1) : undefined;
    summaries.push({
      year,
      rounds: yearRaces.length,
      status,
      detailed: results.length > 0,
      driverChampion: champ && { driverId: champ.driverId, constructorIds: champ.constructorIds, points: champ.points, wins: champ.wins },
      constructorChampion: cchamp && { constructorId: cchamp.constructorId, points: cchamp.points, wins: cchamp.wins },
    });
  }
  write("standings-index.json", { drivers: driverSeasons, constructors: constructorSeasons });

  // ── Results index (for teammates) ───────────────────────────────────
  const teamsRaw = read("teams-detail") as Record<string, { ids: string[]; results: any[] }>;
  const driversRaw = read("drivers-detail") as Record<string, { results: any[] }>;
  const allRows = new Map<string, ResultRow>();
  const addRows = (rows: ResultRow[]) => {
    for (const r of rows) allRows.set(`${r.raceId}|${r.driverId}|${r.constructorId}|${r.number ?? ""}|${r.grid}`, r);
  };
  const teamRows: Record<string, ResultRow[]> = {};
  for (const [key, t] of Object.entries(teamsRaw)) addRows((teamRows[key] = rowsOf(t.results)));
  for (const y of Object.keys(detail)) addRows(rowsOf(detail[y].results));
  addRows(rowsOf(read("teammate-races")));
  const byRaceTeam = new Map<string, ResultRow[]>();
  for (const r of allRows.values()) {
    const k = `${r.raceId}|${r.constructorId}`;
    (byRaceTeam.get(k) ?? byRaceTeam.set(k, []).get(k)!).push(r);
  }

  // ── Profiled drivers ────────────────────────────────────────────────
  for (const id of PROFILED_DRIVERS) {
    const results = rowsOf(driversRaw[id].results).sort((a, b) => a.season - b.season || a.round - b.round);
    const seen = new Set<string>();
    const teammateResults: ResultRow[] = [];
    for (const r of results)
      for (const t of byRaceTeam.get(`${r.raceId}|${r.constructorId}`) ?? []) {
        const k = `${t.raceId}|${t.driverId}`;
        if (t.driverId !== id && !seen.has(k)) {
          seen.add(k);
          teammateResults.push(t);
        }
      }
    const career: DriverCareer = { driverId: id, results, standings: driverSeasons[id] ?? [], teammateResults };
    write(`drivers/${id}.json`, career);
  }

  // ── Profiled teams ──────────────────────────────────────────────────
  for (const [key, ids] of Object.entries(PROFILED_TEAMS)) {
    const from = TEAM_FIRST_SEASON[key] ?? 0;
    const best = new Map<number, ConstructorStanding & { season: number }>();
    for (const id of ids)
      for (const s of constructorSeasons[id] ?? []) {
        if (s.season < from) continue;
        const prev = best.get(s.season);
        if (!prev || (s.position ?? 99) < (prev.position ?? 99)) best.set(s.season, s);
      }
    const team: TeamHistory = {
      key,
      constructorIds: ids,
      results: teamRows[key].filter((r) => r.season >= from).sort((a, b) => a.season - b.season || a.round - b.round),
      standings: [...best.values()].sort((a, b) => a.season - b.season),
    };
    write(`teams/${key}.json`, team);
  }

  // ── Debuts & first seasons ──────────────────────────────────────────
  const winnerDebuts: Core["winnerDebuts"] = {};
  for (const [id, race] of Object.entries(read("winner-debuts") as Record<string, any>)) {
    if (!race) continue;
    const row = toRow(race, race.Results[0]);
    winnerDebuts[id] = { raceId: row.raceId, position: row.position, constructorId: row.constructorId };
  }
  const championFirstSeasons: Record<string, number> = {};
  for (const [id, y] of Object.entries(read("champion-first-seasons") as Record<string, string>)) championFirstSeasons[id] = Number(y);

  const totals = read("totals");
  const core: Core = {
    generatedAt: new Date().toISOString(),
    currentSeason: CURRENT_SEASON,
    totals: {
      drivers: totals.drivers,
      constructors: totals.constructors,
      races: races.filter((r) => r.winner).length,
      seasons: summaries.filter((s) => s.status !== "upcoming").length,
    },
    drivers,
    constructors,
    circuits,
    races,
    seasons: summaries,
    winnerDebuts,
    championFirstSeasons,
    profiledDrivers: PROFILED_DRIVERS,
    profiledTeams: PROFILED_TEAMS,
    featuredSeasons: FEATURED_SEASONS,
  };
  write("core.json", core);

  console.log(
    `Archive built: ${races.length} races, ${Object.keys(drivers).length} drivers, ` +
      `${Object.keys(constructors).length} constructors, ${summaries.length} seasons.`,
  );
}

main();

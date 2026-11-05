import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ConstructorStanding,
  Core,
  DriverCareer,
  DriverStanding,
  Race,
  SeasonDetail,
  TeamHistory,
} from "./types";
import { buildSlugMaps, type SlugMaps } from "./slugs";
import { TEAM_PROFILES } from "@/content/teams";

/**
 * Read-only access to the generated archive (data/generated). Files are parsed once per
 * server process and memoised; pages are statically generated from them.
 */
const DIR = join(process.cwd(), "data", "generated");
const memo = new Map<string, unknown>();

function load<T>(file: string): T | null {
  if (memo.has(file)) return memo.get(file) as T | null;
  const path = join(DIR, file);
  const value = existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : null;
  memo.set(file, value);
  return value;
}

export function core(): Core {
  const c = load<Core>("core.json");
  if (!c) throw new Error("Archive data missing — run `npm run data:fetch && npm run data:build`.");
  return c;
}

export const seasonDetail = (year: number) => load<SeasonDetail>(`seasons/${year}.json`);
export const driverCareer = (id: string) => load<DriverCareer>(`drivers/${id}.json`);
export const teamHistory = (key: string) => load<TeamHistory>(`teams/${key}.json`);
export const standingsIndex = () =>
  load<{
    drivers: Record<string, (DriverStanding & { season: number })[]>;
    constructors: Record<string, (ConstructorStanding & { season: number })[]>;
  }>("standings-index.json")!;

// ── Slugs ──────────────────────────────────────────────────────────────

export { slugify } from "./slugs";
let slugMaps: SlugMaps | null = null;
const maps = (): SlugMaps => (slugMaps ??= buildSlugMaps(core(), TEAM_PROFILES));

export const driverIdBySlug = (slug: string) => maps().driverBySlug.get(slug);
export const teamBySlug = (slug: string) => maps().teamBySlug.get(slug);
export const teamKeyOf = (constructorId: string) => maps().teamKeyOf.get(constructorId);
export const raceIdBySlug = (year: number, slug: string) => maps().raceBySlug.get(`${year}/${slug}`);

export const href = {
  driver: (id: string) => `/drivers/${maps().driverSlug.get(id) ?? id}`,
  constructor: (id: string) => `/teams/${maps().constructorSlug.get(id) ?? id}`,
  season: (year: number) => `/seasons/${year}`,
  race: (raceId: string) => {
    const [y] = raceId.split("-");
    return `/seasons/${y}/${maps().raceSlug.get(raceId) ?? raceId}`;
  },
  circuit: (id: string) => `/circuits/${id.replace(/_/g, "-")}`,
};
export const circuitIdBySlug = (slug: string) => {
  const id = slug.replace(/-/g, "_");
  return core().circuits[id] ? id : undefined;
};

// ── Lookups ────────────────────────────────────────────────────────────

export const driverName = (id: string) => core().drivers[id]?.name ?? id;
export const constructorName = (id: string) => core().constructors[id]?.name ?? id;
export const racesOf = (year: number) => core().races.filter((r) => r.season === year);
export const raceById = (id: string): Race | undefined => core().races.find((r) => r.id === id);
export const seasonSummary = (year: number) => core().seasons.find((s) => s.year === year);

/** Display name for a constructor, using the team profile name for profiled variants. */
export function teamDisplayName(constructorId: string) {
  const key = teamKeyOf(constructorId);
  const profile = key ? TEAM_PROFILES.find((t) => t.key === key) : undefined;
  return profile?.name ?? constructorName(constructorId);
}

// ── Stats ──────────────────────────────────────────────────────────────

const NON_START = /did not (pre-?)?qualify|withdrew|not classified \(dns\)|did not start|excluded from qualifying|^107% rule/i;

export type DriverStats = {
  coverage: "full" | "partial";
  starts?: number;
  wins: number;
  poles: number;
  podiums?: number;
  fastestLaps: number;
  points?: number;
  titles: number;
  firstSeason?: number;
  lastSeason?: number;
  seasons: number[];
};

export function driverStats(id: string): DriverStats {
  const c = core();
  const career = driverCareer(id);
  const seasonsRows = standingsIndex().drivers[id] ?? [];
  const races = c.races;
  const wins = races.filter((r) => r.winner?.driverId === id).length;
  const poles = races.filter((r) => r.pole?.driverId === id).length;
  const fastestLaps = races.filter((r) => r.fastestLap?.driverId === id).length;
  const titles = c.seasons.filter((s) => s.driverChampion?.driverId === id).length;

  if (career) {
    const started = career.results.filter((r) => !NON_START.test(r.status));
    const starts = new Set(started.map((r) => r.raceId)).size;
    const podiums = new Set(career.results.filter((r) => r.position !== null && r.position <= 3).map((r) => r.raceId)).size;
    const seasons = [...new Set(career.results.map((r) => r.season))];
    // Championship points as officially counted (dropped scores applied) when available.
    const points = seasonsRows.length
      ? seasonsRows.reduce((s, r) => s + r.points, 0)
      : career.results.reduce((s, r) => s + r.points, 0);
    return {
      coverage: "full",
      starts,
      wins,
      poles,
      podiums,
      fastestLaps,
      points: Math.round(points * 100) / 100,
      titles,
      firstSeason: seasons[0],
      lastSeason: seasons[seasons.length - 1],
      seasons,
    };
  }

  const seasons = [
    ...new Set([
      ...seasonsRows.map((r) => r.season),
      ...races.filter((r) => r.winner?.driverId === id || r.pole?.driverId === id).map((r) => r.season),
    ]),
  ].sort((a, b) => a - b);
  return { coverage: "partial", wins, poles, fastestLaps, titles, firstSeason: seasons[0], lastSeason: seasons.at(-1), seasons };
}

export type TeamStats = {
  coverage: "full" | "partial";
  entries?: number;
  wins: number;
  poles: number;
  podiums?: number;
  driversTitles: number;
  constructorsTitles: number;
  firstSeason?: number;
  lastSeason?: number;
};

export function teamStats(constructorIds: string[], teamKey?: string): TeamStats {
  const c = core();
  const ids = new Set(constructorIds);
  const wins = c.races.filter((r) => r.winner && ids.has(r.winner.constructorId)).length;
  const poles = c.races.filter((r) => r.pole && ids.has(r.pole.constructorId)).length;
  // A driver's title counts for the team they finished the season with (last constructor listed).
  const driversTitles = c.seasons.filter((s) => {
    const cs = s.driverChampion?.constructorIds;
    return cs?.length && ids.has(cs[cs.length - 1]);
  }).length;
  const constructorsTitles = c.seasons.filter((s) => s.constructorChampion && ids.has(s.constructorChampion.constructorId)).length;
  const history = teamKey ? teamHistory(teamKey) : null;
  if (history) {
    const entries = new Set(history.results.map((r) => r.raceId)).size;
    const podiums = history.results.filter((r) => r.position !== null && r.position <= 3).length;
    const seasons = history.results.map((r) => r.season);
    return {
      coverage: "full",
      entries,
      wins,
      poles,
      podiums,
      driversTitles,
      constructorsTitles,
      firstSeason: seasons[0],
      lastSeason: seasons.at(-1),
    };
  }
  const idx = standingsIndex().constructors;
  const seasons = [
    ...constructorIds.flatMap((id) => (idx[id] ?? []).map((s) => s.season)),
    ...c.races.filter((r) => (r.winner && ids.has(r.winner.constructorId)) || (r.pole && ids.has(r.pole.constructorId))).map((r) => r.season),
    ...Object.values(standingsIndex().drivers)
      .flat()
      .filter((s) => s.constructorIds.some((x) => ids.has(x)))
      .map((s) => s.season),
  ].sort((a, b) => a - b);
  return { coverage: "partial", wins, poles, driversTitles, constructorsTitles, firstSeason: seasons[0], lastSeason: seasons.at(-1) };
}

/** Cumulative points per round for the season's top-N drivers (by final standing). */
export function pointsProgression(year: number, topN = 5) {
  const detail = seasonDetail(year);
  if (!detail?.results.length) return null;
  const top = detail.driverStandings.slice(0, topN).map((s) => s.driverId);
  const rounds = racesOf(year).filter((r) => detail.results.some((x) => x.raceId === r.id));
  const totals: Record<string, number> = Object.fromEntries(top.map((d) => [d, 0]));
  const rows = rounds.map((r) => {
    const row: Record<string, number | string> = { round: r.round, race: r.name.replace(" Grand Prix", " GP") };
    for (const d of top) {
      totals[d] += detail.results.filter((x) => x.raceId === r.id && x.driverId === d).reduce((s, x) => s + x.points, 0);
      row[d] = Math.round(totals[d] * 100) / 100;
    }
    return row;
  });
  return { drivers: top, rows };
}

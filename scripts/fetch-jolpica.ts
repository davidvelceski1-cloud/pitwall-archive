/**
 * Downloads everything the archive needs from the Jolpica-F1 API (the Ergast-compatible
 * successor) into data/raw/. Every response is cached on disk, so re-runs only fetch what
 * is missing and the script can resume after hitting the rate limit.
 *
 *   node scripts/fetch-jolpica.ts            # fetch what's missing
 *   node scripts/fetch-jolpica.ts --refresh-current   # re-fetch the current season only
 *
 * Jolpica allows ~4 req/s burst and ~500 req/hour, so a cold run waits when throttled.
 */
import { mkdirSync, existsSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { CURRENT_SEASON, FEATURED_SEASONS, PROFILED_DRIVERS, PROFILED_TEAMS } from "./config.ts";

const BASE = "https://api.jolpi.ca/ergast/f1";
const RAW = join(import.meta.dirname, "..", "data", "raw");
const PAGE = 100;
const GAP_MS = 350;

let lastRequest = 0;
let networkCalls = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const cacheFile = (path: string, offset: number) =>
  join(RAW, `${path.replace(/^\//, "").replace(/[/?&=]/g, "_")}__${offset}.json`);

async function getPage(path: string, offset: number): Promise<any> {
  const file = cacheFile(path, offset);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));

  for (let attempt = 0; ; attempt++) {
    const wait = lastRequest + GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequest = Date.now();
    networkCalls++;
    const res = await fetch(`${BASE}${path}.json?limit=${PAGE}&offset=${offset}`);
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after")) || Math.min(60 * 2 ** attempt, 900);
      console.log(`  ${res.status} on ${path} — waiting ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
    const json = await res.json();
    writeFileSync(file, JSON.stringify(json));
    return json;
  }
}

/** Fetch every page of a list endpoint. `pick` extracts the array from MRData. */
async function getAll<T>(path: string, pick: (mr: any) => T[]): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { MRData } = await getPage(path, offset);
    out.push(...pick(MRData));
    if (offset + PAGE >= Number(MRData.total)) return out;
  }
}

/**
 * Result endpoints paginate over result rows but group them by race, so a race can be
 * split across two pages. Merge those back together.
 */
async function getRaces(path: string): Promise<any[]> {
  const pages = await getAll<any>(path, (mr) => mr.RaceTable.Races);
  const byKey = new Map<string, any>();
  for (const race of pages) {
    const key = `${race.season}-${race.round}`;
    const prev = byKey.get(key);
    if (!prev) byKey.set(key, { ...race });
    else
      for (const k of ["Results", "QualifyingResults"])
        if (race[k]) prev[k] = [...(prev[k] ?? []), ...race[k]];
  }
  return [...byKey.values()];
}

const save = (name: string, data: unknown) => {
  writeFileSync(join(RAW, "..", "fetched", `${name}.json`), JSON.stringify(data));
};

async function main() {
  mkdirSync(RAW, { recursive: true });
  mkdirSync(join(RAW, "..", "fetched"), { recursive: true });

  if (process.argv.includes("--refresh-current")) {
    // Drop cached responses that change as the current season progresses.
    const stale = [
      `${CURRENT_SEASON}_`, "races__", "results_1__", "grid_1_results__", "qualifying_1__",
      "fastest_1_results__", "seasons__", "drivers__", "constructors__",
      ...PROFILED_DRIVERS.map((d) => `drivers_${d}_`),
      ...Object.values(PROFILED_TEAMS).flat().map((c) => `constructors_${c}_`),
    ];
    for (const f of readdirSync(RAW)) if (stale.some((p) => f.startsWith(p))) rmSync(join(RAW, f));
  }

  console.log("Global tables…");
  save("races", await getAll("/races", (mr) => mr.RaceTable.Races));
  save("winners", await getRaces("/results/1"));
  save("grid1", await getRaces("/grid/1/results"));
  save("quali1", await getRaces("/qualifying/1"));
  save("fastest", await getRaces("/fastest/1/results"));
  save("circuits", await getAll("/circuits", (mr) => mr.CircuitTable.Circuits));
  const seasonList = (await getAll<any>("/seasons", (mr) => mr.SeasonTable.Seasons))
    .map((s) => Number(s.season))
    .filter((y) => y <= CURRENT_SEASON);
  save("seasons", seasonList);
  const totals = {
    drivers: Number((await getPage("/drivers", 0)).MRData.total),
    constructors: Number((await getPage("/constructors", 0)).MRData.total),
  };
  save("totals", totals);

  // Jolpica only serves standings per season, so walk every year. This also gives
  // every season page its final tables, and every driver/team their yearly positions.
  console.log("Final standings for every season…");
  const standings: Record<string, { drivers: any; constructors: any }> = {};
  for (const y of seasonList) {
    standings[y] = {
      drivers: (await getAll<any>(`/${y}/driverStandings`, (mr) => mr.StandingsTable.StandingsLists))[0] ?? null,
      // The constructors' championship began in 1958.
      constructors: y >= 1958 ? ((await getAll<any>(`/${y}/constructorStandings`, (mr) => mr.StandingsTable.StandingsLists))[0] ?? null) : null,
    };
  }
  save("standings", standings);

  console.log("Featured seasons…");
  const seasons: Record<string, unknown> = {};
  for (const y of [...FEATURED_SEASONS, CURRENT_SEASON]) {
    seasons[y] = {
      results: await getRaces(`/${y}/results`),
      qualifying: y >= 1994 ? await getRaces(`/${y}/qualifying`) : [],
    };
  }
  save("seasons-detail", seasons);

  console.log("Drivers…");
  const drivers: Record<string, unknown> = {};
  for (const id of PROFILED_DRIVERS) {
    const results = await getRaces(`/drivers/${id}/results`);
    if (!results.length) throw new Error(`No results for driver "${id}" — check the id`);
    drivers[id] = { results };
  }
  save("drivers-detail", drivers);

  console.log("Teams…");
  const teams: Record<string, unknown> = {};
  const teamVariants = new Set(Object.values(PROFILED_TEAMS).flat());
  for (const [key, ids] of Object.entries(PROFILED_TEAMS)) {
    const results: any[] = [];
    for (const id of ids) results.push(...(await getRaces(`/constructors/${id}/results`)));
    teams[key] = { ids, results };
  }
  save("teams-detail", teams);

  console.log("Teammates of profiled drivers…");
  const covered = new Set([...FEATURED_SEASONS, CURRENT_SEASON].map(String));
  const pairs = new Set<string>();
  for (const d of Object.values(drivers) as any[])
    for (const race of d.results)
      for (const r of race.Results) {
        const c = r.Constructor.constructorId;
        if (!teamVariants.has(c) && !covered.has(race.season)) pairs.add(`${race.season}|${c}`);
      }
  const teammateRaces: any[] = [];
  for (const pair of [...pairs].sort()) {
    const [season, c] = pair.split("|");
    teammateRaces.push(...(await getRaces(`/${season}/constructors/${c}/results`)));
  }
  save("teammate-races", teammateRaces);

  console.log("Debuts of race winners…");
  const winnerIds = new Set<string>();
  for (const race of (await getRaces("/results/1"))) winnerIds.add(race.Results[0].Driver.driverId);
  const debuts: Record<string, unknown> = {};
  for (const id of [...winnerIds].sort()) {
    const { MRData } = await getPage(`/drivers/${id}/results`, 0);
    debuts[id] = MRData.RaceTable.Races[0];
  }
  save("winner-debuts", debuts);

  console.log("First seasons of constructors' champions…");
  const champIds = new Set<string>();
  for (const s of Object.values(standings)) {
    const top = s.constructors?.ConstructorStandings?.[0];
    if (top?.position === "1") champIds.add(top.Constructor.constructorId);
  }
  const firstSeasons: Record<string, string> = {};
  for (const id of [...champIds].sort()) {
    const { MRData } = await getPage(`/constructors/${id}/seasons`, 0);
    firstSeasons[id] = MRData.SeasonTable.Seasons[0].season;
  }
  save("champion-first-seasons", firstSeasons);

  console.log(`Done. ${networkCalls} network requests (the rest came from cache).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

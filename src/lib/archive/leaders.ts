import "server-only";
import { TEAM_PROFILES } from "@/content/teams";
import { core, driverName, standingsIndex, teamDisplayName, teamKeyOf } from "./data";

/** Chassis brand of a constructor id: the source splits early builders by engine ("brabham-repco"). */
const brandOf = (id: string) => id.replace(/^team_/, "").split("-")[0];

/**
 * Constructors' champions whose title came in their brand's first championship season.
 * The first season is the earliest appearance of any id of the same brand, so engine
 * variants (e.g. Brabham-Repco in 1966) don't count as new teams.
 */
export function titlesInFirstSeason() {
  const c = core();
  const first = new Map<string, number>();
  const note = (id: string, y: number) => {
    const b = brandOf(id);
    if (y < (first.get(b) ?? Infinity)) first.set(b, y);
  };
  for (const [id, y] of Object.entries(c.championFirstSeasons)) note(id, y);
  for (const rows of Object.values(standingsIndex().drivers)) for (const r of rows) r.constructorIds.forEach((id) => note(id, r.season));
  for (const [id, rows] of Object.entries(standingsIndex().constructors)) for (const r of rows) note(id, r.season);
  for (const r of c.races) {
    if (r.winner) note(r.winner.constructorId, r.season);
    if (r.pole) note(r.pole.constructorId, r.season);
  }
  return c.seasons.filter((s) => s.constructorChampion && first.get(brandOf(s.constructorChampion.constructorId)) === s.year);
}

/** Winningest teams and drivers, and champions, for a span of seasons. */
export function eraLeaders(from: number, to: number, limit = 5) {
  const c = core();
  const races = c.races.filter((r) => r.season >= from && r.season <= to && r.winner);
  const teams = new Map<string, number>();
  const drivers = new Map<string, number>();
  for (const r of races) {
    const t = teamKeyOf(r.winner!.constructorId) ?? r.winner!.constructorId;
    teams.set(t, (teams.get(t) ?? 0) + 1);
    drivers.set(r.winner!.driverId, (drivers.get(r.winner!.driverId) ?? 0) + 1);
  }
  const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  return {
    races: races.length,
    teams: top(teams).map(([id, wins]) => {
      const profile = TEAM_PROFILES.find((p) => p.key === id);
      return { id, teamKey: profile?.key, constructorId: profile ? c.profiledTeams[profile.key][0] : id, name: profile?.name ?? teamDisplayName(id), wins };
    }),
    drivers: top(drivers).map(([id, wins]) => ({ id, name: driverName(id), wins })),
    champions: c.seasons
      .filter((s) => s.year >= from && s.year <= to && s.driverChampion)
      .map((s) => ({ year: s.year, driverId: s.driverChampion!.driverId, name: driverName(s.driverChampion!.driverId) })),
  };
}

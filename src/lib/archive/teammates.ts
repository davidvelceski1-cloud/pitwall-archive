import "server-only";
import { driverCareer } from "./data";

export type TeammateRecord = {
  driverId: string;
  teams: string[];
  seasons: string;
  races: number;
  /** Races where both were classified and this driver finished ahead / behind. */
  ahead: number;
  behind: number;
  /** Grid comparisons where both started. */
  gridAhead: number;
  gridBehind: number;
};

/** Head-to-head against every teammate, from races where both drove for the same team. */
export function teammateSummary(driverId: string): TeammateRecord[] {
  const career = driverCareer(driverId);
  if (!career) return [];
  const mine = new Map(career.results.map((r) => [`${r.raceId}|${r.constructorId}`, r]));
  const by = new Map<string, TeammateRecord & { years: Set<number>; teamSet: Set<string>; raceSet: Set<string> }>();

  for (const t of career.teammateResults) {
    const me = mine.get(`${t.raceId}|${t.constructorId}`);
    if (!me) continue;
    let rec = by.get(t.driverId);
    if (!rec) {
      rec = { driverId: t.driverId, teams: [], seasons: "", races: 0, ahead: 0, behind: 0, gridAhead: 0, gridBehind: 0, years: new Set(), teamSet: new Set(), raceSet: new Set() };
      by.set(t.driverId, rec);
    }
    if (rec.raceSet.has(t.raceId)) continue;
    rec.raceSet.add(t.raceId);
    rec.years.add(t.season);
    rec.teamSet.add(t.constructorId);
    if (me.position !== null && t.position !== null) {
      if (me.position < t.position) rec.ahead++;
      else rec.behind++;
    }
    if (me.grid > 0 && t.grid > 0) {
      if (me.grid < t.grid) rec.gridAhead++;
      else if (me.grid > t.grid) rec.gridBehind++;
    }
  }

  return [...by.values()]
    .map(({ years, teamSet, raceSet, ...r }) => {
      const ys = [...years].sort((a, b) => a - b);
      return { ...r, races: raceSet.size, teams: [...teamSet], seasons: ys[0] === ys.at(-1) ? `${ys[0]}` : `${ys[0]}–${ys.at(-1)}` };
    })
    .sort((a, b) => b.races - a.races);
}

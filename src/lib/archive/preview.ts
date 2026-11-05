import "server-only";
import { ERAS } from "@/content/eras";
import { TEAM_PROFILES } from "@/content/teams";
import { core, driverStats, raceById, seasonSummary, teamKeyOf, teamStats, driverName, teamDisplayName, racesOf } from "./data";
import { fmtDate, fmtNum, yearsRange } from "@/lib/utils";

export type Preview = {
  title: string;
  subtitle: string;
  accent?: string;
  stats: { label: string; value: string }[];
  note?: string;
};

export function buildPreview(kind: string, id: string): Preview | null {
  const c = core();
  switch (kind) {
    case "driver": {
      const d = c.drivers[id];
      if (!d) return null;
      const s = driverStats(id);
      return {
        title: d.name,
        subtitle: `${d.nationality} · ${yearsRange(s.firstSeason, s.lastSeason)}`,
        stats: [
          { label: "Titles", value: fmtNum(s.titles) },
          { label: "Wins", value: fmtNum(s.wins) },
          { label: "Poles", value: fmtNum(s.poles) },
          ...(s.starts !== undefined ? [{ label: "Starts", value: fmtNum(s.starts) }] : []),
        ],
      };
    }
    case "team": {
      const key = teamKeyOf(id);
      const profile = key ? TEAM_PROFILES.find((t) => t.key === key) : undefined;
      const ids = key ? c.profiledTeams[key] : [id];
      if (!profile && !c.constructors[id]) return null;
      const s = teamStats(ids, key);
      return {
        title: profile?.name ?? teamDisplayName(id),
        subtitle: profile ? `${profile.nationality} · ${profile.years} · ${profile.status}` : `${c.constructors[id].nationality} · ${yearsRange(s.firstSeason, s.lastSeason)}`,
        accent: profile?.color,
        stats: [
          { label: "Constructors' titles", value: fmtNum(s.constructorsTitles) },
          { label: "Drivers' titles", value: fmtNum(s.driversTitles) },
          { label: "Wins", value: fmtNum(s.wins) },
        ],
      };
    }
    case "season": {
      const year = Number(id);
      const s = seasonSummary(year);
      if (!s) return null;
      return {
        title: `${year} season`,
        subtitle: `${s.rounds} rounds · ${s.status === "complete" ? "complete" : s.status === "in-progress" ? "in progress" : "upcoming"}`,
        stats: [
          { label: "Drivers' champion", value: s.driverChampion ? driverName(s.driverChampion.driverId) : "—" },
          { label: "Constructors' champion", value: s.constructorChampion ? teamDisplayName(s.constructorChampion.constructorId) : year < 1958 ? "Not awarded" : "—" },
        ],
      };
    }
    case "circuit": {
      const ci = c.circuits[id];
      if (!ci) return null;
      const races = c.races.filter((r) => r.circuitId === id && r.winner);
      return {
        title: ci.name,
        subtitle: `${ci.locality}, ${ci.country}`,
        stats: [
          { label: "Grands Prix", value: fmtNum(races.length) },
          { label: "First", value: races[0] ? String(races[0].season) : "—" },
          { label: "Latest", value: races.at(-1) ? String(races.at(-1)!.season) : "—" },
        ],
      };
    }
    case "race": {
      const r = raceById(id);
      if (!r) return null;
      return {
        title: `${r.season} ${r.name}`,
        subtitle: `${fmtDate(r.date)} · ${c.circuits[r.circuitId]?.name ?? ""}`,
        stats: [
          { label: "Winner", value: r.winner ? driverName(r.winner.driverId) : "—" },
          { label: "Pole", value: r.pole ? driverName(r.pole.driverId) : "—" },
          { label: "Round", value: `${r.round} of ${racesOf(r.season).length}` },
        ],
      };
    }
    case "era": {
      const e = ERAS.find((x) => x.slug === id);
      if (!e) return null;
      return { title: e.name, subtitle: `${e.from}–${e.to ?? ""}`, stats: [], note: e.tagline };
    }
  }
  return null;
}

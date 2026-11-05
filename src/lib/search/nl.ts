import "server-only";
import { z } from "zod";
import { TEAM_PROFILES } from "@/content/teams";
import { ERAS } from "@/content/eras";
import { core, driverName, href, teamDisplayName } from "@/lib/archive/data";
import { titlesInFirstSeason } from "@/lib/archive/leaders";
import { fmtDate } from "@/lib/utils";

/**
 * Natural-language search: a question is mapped (by Claude, or by the rule-based parser
 * below when no key is configured) onto one of a fixed set of structured queries, which
 * are then executed against the archive. The model never produces the results itself.
 */
export const QUERY_KINDS = [
  "race_winners",
  "champions",
  "won_on_debut",
  "title_in_first_season",
  "won_from_pole",
  "drivers",
  "unsupported",
] as const;

export const ParsedQuery = z.object({
  kind: z.enum(QUERY_KINDS),
  driver: z.string().nullable(),
  team: z.string().nullable(),
  circuit: z.string().nullable(),
  nationality: z.string().nullable(),
  from_year: z.number().int().nullable(),
  to_year: z.number().int().nullable(),
});
export type ParsedQuery = z.infer<typeof ParsedQuery>;

export type Cell = { text: string; href?: string };
export type NlResult = { title: string; description: string; columns: string[]; rows: Cell[][]; parsed: ParsedQuery; via: "ai" | "rules"; note?: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// ── Name resolution ────────────────────────────────────────────────────

function resolveDriver(name: string | null): string | undefined {
  if (!name) return undefined;
  const c = core();
  const n = norm(name).trim();
  const wins = (id: string) => c.races.filter((r) => r.winner?.driverId === id).length;
  const matches = Object.values(c.drivers).filter((d) => norm(d.name) === n || norm(d.family) === n || norm(d.name).includes(n));
  return matches.sort((a, b) => wins(b.id) - wins(a.id))[0]?.id;
}

function resolveTeam(name: string | null): string[] | undefined {
  if (!name) return undefined;
  const c = core();
  const n = norm(name).replace(/\b(team|racing|f1|gp)\b/g, "").trim();
  const profile = TEAM_PROFILES.find((t) => norm(t.name).includes(n) || n.includes(norm(t.name)) || norm(t.key) === n);
  if (profile) return c.profiledTeams[profile.key];
  const ids = Object.values(c.constructors).filter((x) => norm(x.name) === n || norm(x.name).startsWith(n)).map((x) => x.id);
  return ids.length ? ids : undefined;
}

function resolveCircuit(name: string | null): string | undefined {
  if (!name) return undefined;
  const c = core();
  const n = norm(name).replace(/\b(grand prix|gp|circuit)\b/g, "").trim();
  const byName = Object.values(c.circuits).find((x) => [x.name, x.locality, x.id].some((v) => norm(v).includes(n)));
  if (byName) return byName.id;
  // "Italian" → most-used circuit of races with that name.
  const race = c.races.find((r) => norm(r.name).includes(n));
  return race?.circuitId;
}

// ── Rule-based parser (fallback) ───────────────────────────────────────

const NATIONALITIES = ["British", "German", "Brazilian", "French", "Finnish", "Italian", "Austrian", "Australian", "Argentine", "Spanish", "Dutch", "American", "Canadian", "Swedish", "Belgian", "Mexican", "New Zealander", "South African", "Swiss", "Japanese", "Monegasque", "Colombian", "Polish"];

export function parseWithRules(q: string): ParsedQuery {
  const c = core();
  const n = norm(q);
  const years = [...n.matchAll(/\b(19[5-9]\d|20[0-4]\d)\b/g)].map((m) => Number(m[1]));
  const decade = n.match(/\b(19[5-9]0|20[0-4]0)s\b|\b([5-9]0)s\b/);
  let from: number | null = years.length ? Math.min(...years) : null;
  let to: number | null = years.length ? Math.max(...years) : null;
  if (decade) {
    const d = decade[1] ? Number(decade[1]) : 1900 + Number(decade[2]);
    from = d;
    to = d + 9;
  }
  const era = ERAS.find((e) => n.includes(norm(e.name)) || n.includes(norm(e.name).replace(" era", "")));
  if (era && from === null) {
    from = era.from;
    to = era.to ?? c.currentSeason;
  }

  const driver = Object.values(c.drivers)
    .filter((d) => d.family.length > 3 && new RegExp(`\\b${norm(d.family)}\\b`).test(n))
    .sort((a, b) => c.races.filter((r) => r.winner?.driverId === b.id).length - c.races.filter((r) => r.winner?.driverId === a.id).length)[0];
  const team = TEAM_PROFILES.find((t) => n.includes(norm(t.name)))?.name ?? Object.values(c.constructors).find((x) => x.name.length > 3 && n.includes(norm(x.name)))?.name ?? null;
  const circuit =
    Object.values(c.circuits).find((x) => x.locality.length > 3 && n.includes(norm(x.locality)))?.locality ??
    ["monaco", "monza", "silverstone", "spa", "suzuka", "interlagos", "hockenheim", "imola", "zandvoort"].find((k) => n.includes(k)) ??
    null;
  const nationality = NATIONALITIES.find((x) => n.includes(norm(x))) ?? null;

  let kind: ParsedQuery["kind"] = "unsupported";
  if (/debut|first (ever )?(race|grand prix|start)/.test(n) && /won|win/.test(n)) kind = "won_on_debut";
  else if (/(title|championship).*(first|debut|maiden) season|first season.*(title|championship)/.test(n)) kind = "title_in_first_season";
  else if (/from pole|pole.*(won|win|victor)|(won|win).*pole/.test(n)) kind = "won_from_pole";
  else if (/champion|title/.test(n)) kind = "champions";
  else if (/win|won|winner|victor/.test(n) || circuit || (driver && /race/.test(n))) kind = "race_winners";
  else if (/driver/.test(n) && nationality) kind = "drivers";

  return { kind, driver: driver?.name ?? null, team, circuit, nationality, from_year: from, to_year: to };
}

// ── Executor ───────────────────────────────────────────────────────────

const raceCell = (id: string, label: string): Cell => ({ text: label, href: href.race(id) });
const driverCell = (id: string): Cell => ({ text: driverName(id), href: href.driver(id) });
const teamCell = (id: string): Cell => ({ text: teamDisplayName(id), href: href.constructor(id) });

export function execute(p: ParsedQuery, via: "ai" | "rules"): NlResult {
  const c = core();
  const from = p.from_year ?? 1950;
  const to = p.to_year ?? c.currentSeason;
  const inRange = (y: number) => y >= from && y <= to;
  const driverId = resolveDriver(p.driver);
  const teamIds = resolveTeam(p.team);
  const circuitId = resolveCircuit(p.circuit);
  const span = p.from_year || p.to_year ? ` (${from}–${to})` : "";
  const base = { parsed: p, via };

  const unresolved: string[] = [];
  if (p.driver && !driverId) unresolved.push(`driver “${p.driver}”`);
  if (p.team && !teamIds) unresolved.push(`team “${p.team}”`);
  if (p.circuit && !circuitId) unresolved.push(`circuit “${p.circuit}”`);
  const note = unresolved.length ? `Couldn't find ${unresolved.join(", ")} in the archive, so that filter was ignored.` : undefined;

  switch (p.kind) {
    case "won_on_debut": {
      const rows = Object.entries(c.winnerDebuts)
        .filter(([, d]) => d.position === 1)
        .map(([id, d]) => ({ id, d, race: c.races.find((r) => r.id === d.raceId)! }))
        .filter((x) => x.race && inRange(x.race.season))
        .sort((a, b) => a.race.date.localeCompare(b.race.date));
      return {
        ...base,
        note,
        title: "Drivers who won their first championship race",
        description: `Every driver whose first World Championship start was a win${span}. Indianapolis 500 races (1950–1960) counted toward the championship.`,
        columns: ["Driver", "Race", "Team", "Date"],
        rows: rows.map((x) => [driverCell(x.id), raceCell(x.race.id, `${x.race.season} ${x.race.name}`), teamCell(x.d.constructorId), { text: fmtDate(x.race.date) }]),
      };
    }
    case "title_in_first_season": {
      const rows = titlesInFirstSeason().filter((s) => inRange(s.year));
      return {
        ...base,
        note,
        title: "Constructors that won the title in their first season",
        description: "Constructors' champions whose title came in their first season of World Championship racing (the constructors' title began in 1958).",
        columns: ["Team", "Season", "Points"],
        rows: rows.map((s) => [teamCell(s.constructorChampion!.constructorId), { text: String(s.year), href: href.season(s.year) }, { text: String(s.constructorChampion!.points) }]),
      };
    }
    case "champions": {
      const rows = c.seasons.filter(
        (s) =>
          s.driverChampion &&
          inRange(s.year) &&
          (!driverId || s.driverChampion.driverId === driverId) &&
          (!teamIds || s.driverChampion.constructorIds.some((x) => teamIds.includes(x))) &&
          (!p.nationality || norm(c.drivers[s.driverChampion.driverId]?.nationality ?? "") === norm(p.nationality)),
      );
      return {
        ...base,
        note,
        title: "World champions",
        description: `Drivers' champions${span}${p.nationality ? `, ${p.nationality}` : ""}${teamIds ? `, driving for ${teamDisplayName(teamIds[0])}` : ""}.`,
        columns: ["Season", "Driver", "Team", "Constructors' champion"],
        rows: rows.map((s) => [
          { text: String(s.year), href: href.season(s.year) },
          driverCell(s.driverChampion!.driverId),
          teamCell(s.driverChampion!.constructorIds.at(-1)!),
          s.constructorChampion ? teamCell(s.constructorChampion.constructorId) : { text: s.year < 1958 ? "Not awarded" : "—" },
        ]),
      };
    }
    case "won_from_pole":
    case "race_winners": {
      const fromPole = p.kind === "won_from_pole";
      const rows = c.races.filter(
        (r) =>
          r.winner &&
          inRange(r.season) &&
          (!driverId || r.winner.driverId === driverId) &&
          (!teamIds || teamIds.includes(r.winner.constructorId)) &&
          (!circuitId || r.circuitId === circuitId) &&
          (!p.nationality || norm(c.drivers[r.winner.driverId]?.nationality ?? "") === norm(p.nationality)) &&
          (!fromPole || r.pole?.driverId === r.winner.driverId),
      );
      const where = circuitId ? ` at ${c.circuits[circuitId].name}` : "";
      const who = driverId ? ` by ${driverName(driverId)}` : teamIds ? ` by ${teamDisplayName(teamIds[0])}` : "";
      return {
        ...base,
        note,
        title: fromPole ? `Wins from pole${who}${where}` : `Race winners${where}${who}`,
        description: `${rows.length} race${rows.length === 1 ? "" : "s"}${span}.${fromPole ? " Pole is taken from the starting grid where qualifying records are unavailable." : ""}`,
        columns: ["Race", "Winner", "Team", "Date"],
        rows: rows.map((r) => [raceCell(r.id, `${r.season} ${r.name}`), driverCell(r.winner!.driverId), teamCell(r.winner!.constructorId), { text: fmtDate(r.date) }]),
      };
    }
    case "drivers": {
      const wins = new Map<string, number>();
      for (const r of c.races) if (r.winner && inRange(r.season)) wins.set(r.winner.driverId, (wins.get(r.winner.driverId) ?? 0) + 1);
      const rows = [...wins.entries()]
        .filter(([id]) => !p.nationality || norm(c.drivers[id]?.nationality ?? "") === norm(p.nationality))
        .filter(([id]) => !teamIds || c.races.some((r) => r.winner?.driverId === id && teamIds.includes(r.winner.constructorId)))
        .sort((a, b) => b[1] - a[1]);
      return {
        ...base,
        note,
        title: `Race-winning ${p.nationality ?? ""} drivers`.replace(/\s+/g, " "),
        description: `Drivers with at least one win${span}, by number of wins.`,
        columns: ["Driver", "Nationality", "Wins"],
        rows: rows.map(([id, n]) => [driverCell(id), { text: c.drivers[id]?.nationality ?? "" }, { text: String(n) }]),
      };
    }
    default:
      return {
        ...base,
        title: "That's not a question smart search can answer yet",
        description:
          "Smart search handles race winners (by driver, team, circuit, nationality or years), champions, wins from pole, drivers who won on debut, and teams that won the title in their first season. For anything else, try Ask the Archive.",
        columns: [],
        rows: [],
      };
  }
}

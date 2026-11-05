import { ERAS } from "@/content/eras";
import { TEAM_PROFILES } from "@/content/teams";
import { core, driverStats, href, standingsIndex, teamKeyOf } from "@/lib/archive/data";

export const dynamic = "force-static";
export const revalidate = 86400;

export type SearchItem = { t: "season" | "team" | "driver" | "circuit" | "race" | "era"; l: string; s?: string; h: string; w?: number };

/** Compact index for the ⌘K command palette. */
export async function GET() {
  const c = core();
  const items: SearchItem[] = [];
  for (const s of [...c.seasons].reverse()) items.push({ t: "season", l: `${s.year} season`, s: s.status === "complete" ? "Season" : "Season · in progress", h: href.season(s.year), w: 3 });
  for (const t of TEAM_PROFILES) items.push({ t: "team", l: t.name, s: `${t.years} · ${t.status}`, h: `/teams/${t.slug}`, w: 5 });
  const scored = new Set(Object.entries(standingsIndex().constructors).map(([id]) => id));
  for (const [id, con] of Object.entries(c.constructors))
    if (!teamKeyOf(id) && (scored.has(id) || c.races.some((r) => r.winner?.constructorId === id))) items.push({ t: "team", l: con.name, s: con.nationality, h: href.constructor(id), w: 1 });
  for (const id of c.profiledDrivers) items.push({ t: "driver", l: c.drivers[id].name, s: `${c.drivers[id].nationality} · ${driverStats(id).titles} titles`, h: href.driver(id), w: 6 });
  for (const [id, d] of Object.entries(c.drivers)) if (!c.profiledDrivers.includes(id)) items.push({ t: "driver", l: d.name, s: d.nationality, h: href.driver(id), w: 1 });
  for (const ci of Object.values(c.circuits)) items.push({ t: "circuit", l: ci.name, s: `${ci.locality}, ${ci.country}`, h: href.circuit(ci.id), w: 2 });
  for (const e of ERAS) items.push({ t: "era", l: e.name, s: e.short, h: `/eras/${e.slug}`, w: 4 });
  for (const r of c.races) items.push({ t: "race", l: `${r.season} ${r.name}`, s: r.date, h: href.race(r.id), w: 0 });
  return Response.json(items);
}

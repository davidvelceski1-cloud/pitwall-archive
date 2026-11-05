import type { Core } from "./types";

/** Pure slug logic shared by the app (data.ts) and the database seed. */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export type SlugMaps = {
  driverSlug: Map<string, string>;
  driverBySlug: Map<string, string>;
  /** constructorId → slug (profiled variants map to their team's slug) */
  constructorSlug: Map<string, string>;
  /** slug → { teamKey } for profiled teams or { constructorId } for the rest */
  teamBySlug: Map<string, { teamKey?: string; constructorId?: string }>;
  teamKeyOf: Map<string, string>;
  raceSlug: Map<string, string>;
  raceBySlug: Map<string, string>;
};

export function buildSlugMaps(c: Core, teams: { key: string; slug: string }[]): SlugMaps {
  const driverSlug = new Map<string, string>();
  const driverBySlug = new Map<string, string>();
  // Profiled drivers claim their natural slug first.
  const order = [...c.profiledDrivers, ...Object.keys(c.drivers).filter((d) => !c.profiledDrivers.includes(d)).sort()];
  for (const id of order) {
    const d = c.drivers[id];
    if (!d) continue;
    let slug = slugify(d.name);
    if (driverBySlug.has(slug)) slug = `${slug}-${d.dob?.slice(0, 4) ?? slugify(id)}`;
    if (driverBySlug.has(slug)) slug = slugify(id);
    driverSlug.set(id, slug);
    driverBySlug.set(slug, id);
  }

  const constructorSlug = new Map<string, string>();
  const teamBySlug = new Map<string, { teamKey?: string; constructorId?: string }>();
  const teamKeyOf = new Map<string, string>();
  for (const t of teams) {
    teamBySlug.set(t.slug, { teamKey: t.key });
    for (const cid of c.profiledTeams[t.key] ?? []) {
      constructorSlug.set(cid, t.slug);
      teamKeyOf.set(cid, t.key);
    }
  }
  for (const id of Object.keys(c.constructors).sort()) {
    if (constructorSlug.has(id)) continue;
    let slug = slugify(c.constructors[id].name);
    if (teamBySlug.has(slug)) slug = slugify(id);
    constructorSlug.set(id, slug);
    teamBySlug.set(slug, { constructorId: id });
  }

  const raceSlug = new Map<string, string>();
  const raceBySlug = new Map<string, string>();
  for (const r of c.races) {
    let slug = slugify(r.name);
    if (raceBySlug.has(`${r.season}/${slug}`)) slug = `${slug}-round-${r.round}`;
    raceSlug.set(r.id, slug);
    raceBySlug.set(`${r.season}/${slug}`, r.id);
  }
  return { driverSlug, driverBySlug, constructorSlug, teamBySlug, teamKeyOf, raceSlug, raceBySlug };
}

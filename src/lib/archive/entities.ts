import "server-only";
import { ERAS } from "@/content/eras";
import { TEAM_PROFILES } from "@/content/teams";
import { circuitProfile } from "@/content/circuits";
import { core, driverName, href, raceById, teamDisplayName } from "./data";

export type EntityKind = "driver" | "team" | "season" | "circuit" | "race" | "era";
export type EntityRef = { kind: EntityKind; id: string; href: string; label: string };

/** Build link targets for anything in the archive (server-side; passed to client components). */
export const entity = {
  driver: (id: string, label?: string): EntityRef => ({ kind: "driver", id, href: href.driver(id), label: label ?? driverName(id) }),
  team: (keyOrConstructorId: string, label?: string): EntityRef => {
    const profile = TEAM_PROFILES.find((t) => t.key === keyOrConstructorId);
    const cid = profile ? core().profiledTeams[profile.key][0] : keyOrConstructorId;
    return {
      kind: "team",
      id: cid,
      href: profile ? `/teams/${profile.slug}` : href.constructor(cid),
      label: label ?? (profile ? profile.name : teamDisplayName(cid)),
    };
  },
  season: (year: number, label?: string): EntityRef => ({ kind: "season", id: String(year), href: href.season(year), label: label ?? String(year) }),
  circuit: (id: string, label?: string): EntityRef => ({
    kind: "circuit",
    id,
    href: href.circuit(id),
    label: label ?? core().circuits[id]?.name ?? id,
  }),
  race: (raceId: string, label?: string): EntityRef => {
    const r = raceById(raceId);
    return { kind: "race", id: raceId, href: href.race(raceId), label: label ?? (r ? `${r.season} ${r.name}` : raceId) };
  },
  era: (slug: string, label?: string): EntityRef => ({
    kind: "era",
    id: slug,
    href: `/eras/${slug}`,
    label: label ?? ERAS.find((e) => e.slug === slug)?.name ?? slug,
  }),
};

/** Resolve an inline editorial token like `d:senna` or `t:mclaren`. */
export function resolveToken(token: string, label?: string): EntityRef | null {
  const [kind, id] = token.split(":");
  try {
    switch (kind) {
      case "d":
        return core().drivers[id] ? entity.driver(id, label) : null;
      case "t":
        return entity.team(id, label);
      case "s":
        return entity.season(Number(id), label);
      case "c":
        return core().circuits[id] ? entity.circuit(id, label ?? (circuitProfile(id) ? core().circuits[id].locality : undefined)) : null;
      case "e":
        return entity.era(id, label);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Strip tokens to plain text (for AI retrieval, meta descriptions). */
export function plainText(text: string) {
  return text.replace(/\[\[([a-z]):([^|\]]+)(?:\|([^\]]+))?\]\]/g, (_, k, id, label) => label ?? resolveToken(`${k}:${id}`)?.label ?? id);
}

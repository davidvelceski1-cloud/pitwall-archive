/**
 * Editorial content lives apart from statistics. Every piece carries a source and a
 * last-reviewed date. Prose may contain inline entity tokens that render as links:
 *
 *   [[d:senna]]            driver (Jolpica id) — rendered with the driver's name
 *   [[t:mclaren|McLaren]]  team (profile key or Jolpica constructor id), custom label
 *   [[s:1988]]             season
 *   [[c:monaco|Monaco]]    circuit (Jolpica id)
 *   [[e:turbo]]            era (slug)
 */
export type Editorial = {
  source: string;
  lastReviewed: string;
};

export type TeamStatus = "Active" | "Defunct" | "Rebranded";

export type TeamProfile = Editorial & {
  key: string;
  slug: string;
  name: string;
  fullName: string;
  nationality: string;
  base: string;
  status: TeamStatus;
  /** Years the profile covers as a works constructor, e.g. "1962–1992". */
  years: string;
  color: string;
  summary: string;
  chapters: { era: string; title: string; body: string[] }[];
  cars: { season: string; chassis: string; engine: string; designers?: string; note: string }[];
  /** Lineage node this team corresponds to (see lineage.ts). */
  lineageNode?: string;
};

export type DriverProfile = Editorial & {
  id: string;
  died?: string;
  bio: string[];
  keyRaces: { season: number; race: string; note: string }[];
  /** Fixed historical milestones (statistical records are computed from data). */
  milestones: string[];
};

export type SeasonEditorial = Editorial & {
  year: number;
  headline: string;
  regulations: string[];
  story: string[];
  moments: {
    /** Match a race of this season by name fragment — its date and link come from data. */
    race?: string;
    when?: string;
    kind: "debut" | "retirement" | "crash" | "controversy" | "rules" | "milestone" | "title";
    title: string;
    text: string;
  }[];
};

export type Era = Editorial & {
  slug: string;
  name: string;
  short: string;
  from: number;
  to: number | null;
  tagline: string;
  intro: string[];
  regulations: string[];
  innovations: string[];
  safety: string[];
};

export type CircuitProfile = Editorial & {
  id: string;
  summary: string;
  /** Schematic outline in a 0–100 viewBox. Not to scale. */
  outline: string;
  layouts: { years: string; note: string }[];
  /** Fastest race laps are only compared from this season on (current layout). */
  currentLayoutSince: number;
};

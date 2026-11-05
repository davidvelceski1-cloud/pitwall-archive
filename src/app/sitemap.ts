import type { MetadataRoute } from "next";
import { CIRCUIT_PROFILES } from "@/content/circuits";
import { ERAS } from "@/content/eras";
import { TEAM_PROFILES } from "@/content/teams";
import { core, href } from "@/lib/archive/data";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const c = core();
  const paths = [
    "/",
    "/seasons",
    "/teams",
    "/drivers",
    "/circuits",
    "/eras",
    "/compare",
    "/ask",
    ...c.seasons.map((s) => href.season(s.year)),
    ...c.races.filter((r) => c.featuredSeasons.includes(r.season)).map((r) => href.race(r.id)),
    ...TEAM_PROFILES.map((t) => `/teams/${t.slug}`),
    ...c.profiledDrivers.map((d) => href.driver(d)),
    ...CIRCUIT_PROFILES.map((p) => href.circuit(p.id)),
    ...ERAS.map((e) => `/eras/${e.slug}`),
  ];
  return paths.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: c.generatedAt }));
}

import { TEAM_PROFILES } from "@/content/teams";
import { core, teamBySlug, teamStats } from "@/lib/archive/data";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Formula 1 team profile";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const t = teamBySlug((await params).slug);
  const c = core();
  const profile = t?.teamKey ? TEAM_PROFILES.find((p) => p.key === t.teamKey) : undefined;
  const ids = profile ? c.profiledTeams[profile.key] : t?.constructorId ? [t.constructorId] : [];
  const s = teamStats(ids, profile?.key);
  return ogCard({
    kicker: "Teams",
    title: profile?.name ?? (ids[0] ? c.constructors[ids[0]]?.name : "Team"),
    subtitle: profile ? `${profile.years} · ${profile.status}` : undefined,
    accent: profile?.color,
    stats: [
      ["Wins", String(s.wins)],
      ["Constructors' titles", String(s.constructorsTitles)],
      ["Drivers' titles", String(s.driversTitles)],
    ],
  });
}

import { core, driverIdBySlug, driverStats } from "@/lib/archive/data";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Formula 1 driver profile";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const id = driverIdBySlug((await params).slug);
  const d = id ? core().drivers[id] : undefined;
  const s = id ? driverStats(id) : undefined;
  return ogCard({
    kicker: "Drivers",
    title: d?.name ?? "Driver",
    subtitle: d ? `${d.nationality} · ${s?.firstSeason}–${s?.lastSeason}` : undefined,
    stats: s
      ? [
          ["Titles", String(s.titles)],
          ["Wins", String(s.wins)],
          ["Poles", String(s.poles)],
        ]
      : undefined,
  });
}

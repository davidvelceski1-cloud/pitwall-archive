import { driverName, seasonSummary, teamDisplayName } from "@/lib/archive/data";
import { OG_SIZE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Formula 1 season summary";

export default async function Image({ params }: { params: Promise<{ year: string }> }) {
  const year = Number((await params).year);
  const s = seasonSummary(year);
  return ogCard({
    kicker: "Seasons",
    title: String(year),
    subtitle: s?.driverChampion ? `Champion: ${driverName(s.driverChampion.driverId)}` : `${s?.rounds ?? ""} races`,
    stats: [
      ["Races", String(s?.rounds ?? "—")],
      ["Constructors' champion", s?.constructorChampion ? teamDisplayName(s.constructorChampion.constructorId) : "—"],
    ],
  });
}

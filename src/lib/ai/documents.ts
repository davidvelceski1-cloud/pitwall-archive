import "server-only";
import { CIRCUIT_PROFILES } from "@/content/circuits";
import { DRIVER_PROFILES } from "@/content/drivers";
import { ERAS } from "@/content/eras";
import { lineageChain } from "@/content/lineage";
import { SEASON_EDITORIALS } from "@/content/seasons";
import { TEAM_PROFILES } from "@/content/teams";
import {
  core,
  driverCareer,
  driverName,
  driverStats,
  href,
  racesOf,
  seasonDetail,
  standingsIndex,
  teamDisplayName,
  teamKeyOf,
  teamStats,
} from "@/lib/archive/data";
import { plainText } from "@/lib/archive/entities";
import { teammateSummary } from "@/lib/archive/teammates";
import { eraLeaders, titlesInFirstSeason } from "@/lib/archive/leaders";

/**
 * The retrieval corpus for "Ask the Archive": one passage per archive page (and per race),
 * written from the same data the pages render, so every answer can cite a page.
 */
export type Doc = { id: string; kind: string; title: string; href: string; text: string };

let corpus: Doc[] | null = null;

const ordinalPos = (p: number | null) => (p === null ? "unclassified" : `P${p}`);

export function getCorpus(): Doc[] {
  if (corpus) return corpus;
  const c = core();
  const docs: Doc[] = [];

  // Seasons
  for (const s of c.seasons) {
    const races = racesOf(s.year);
    const detail = seasonDetail(s.year);
    const ed = SEASON_EDITORIALS.find((e) => e.year === s.year);
    const lines = [
      `${s.year} Formula 1 World Championship season: ${s.rounds} rounds, status ${s.status}.`,
      s.driverChampion
        ? `Drivers' champion: ${driverName(s.driverChampion.driverId)} (${s.driverChampion.constructorIds.map(teamDisplayName).join("/")}), ${s.driverChampion.points} points, ${s.driverChampion.wins} wins.`
        : s.status === "complete"
          ? ""
          : "The drivers' championship is not yet decided.",
      s.constructorChampion
        ? `Constructors' champion: ${teamDisplayName(s.constructorChampion.constructorId)} with ${s.constructorChampion.points} points.`
        : s.year < 1958
          ? "No constructors' championship was awarded (it began in 1958)."
          : "",
      detail?.driverStandings.length
        ? `Drivers' standings${s.status !== "complete" ? ` after round ${detail.standingsRound}` : ""}: ${detail.driverStandings
            .slice(0, 10)
            .map((d) => `${d.position ?? "-"}. ${driverName(d.driverId)} ${d.points} pts`)
            .join("; ")}.`
        : "",
      detail?.constructorStandings.length
        ? `Constructors' standings: ${detail.constructorStandings
            .slice(0, 6)
            .map((d) => `${d.position ?? "-"}. ${teamDisplayName(d.constructorId)} ${d.points} pts`)
            .join("; ")}.`
        : "",
      `Race winners: ${races
        .filter((r) => r.winner)
        .map((r) => `${r.name} — ${driverName(r.winner!.driverId)}`)
        .join("; ")}.`,
    ];
    if (ed) {
      lines.push(ed.headline, ...ed.story.map(plainText), `Regulation changes: ${ed.regulations.join(" ")}`);
      lines.push(`Notable moments: ${ed.moments.map((m) => `${m.title}: ${m.text}`).join(" ")}`);
    }
    docs.push({ id: `season:${s.year}`, kind: "season", title: `${s.year} season`, href: href.season(s.year), text: lines.filter(Boolean).join("\n") });
  }

  // Races
  const detailCache = new Map<number, ReturnType<typeof seasonDetail>>();
  for (const r of c.races) {
    if (!r.winner) continue;
    if (!detailCache.has(r.season)) detailCache.set(r.season, seasonDetail(r.season));
    const detail = detailCache.get(r.season);
    const top = detail?.results
      .filter((x) => x.raceId === r.id && x.position !== null)
      .sort((a, b) => a.position! - b.position!)
      .slice(0, 6);
    const ci = c.circuits[r.circuitId];
    docs.push({
      id: `race:${r.id}`,
      kind: "race",
      title: `${r.season} ${r.name}`,
      href: href.race(r.id),
      text: [
        `${r.season} ${r.name}, round ${r.round}, held ${r.date} at ${ci?.name ?? r.circuitId} (${ci?.locality}, ${ci?.country}).`,
        `Winner: ${driverName(r.winner.driverId)} (${teamDisplayName(r.winner.constructorId)}).`,
        r.pole ? `Pole position: ${driverName(r.pole.driverId)} (${teamDisplayName(r.pole.constructorId)}).` : "",
        r.fastestLap ? `Fastest lap: ${driverName(r.fastestLap.driverId)}, ${r.fastestLap.time}.` : "",
        top?.length ? `Top finishers: ${top.map((x) => `${x.position}. ${driverName(x.driverId)} (${teamDisplayName(x.constructorId)})`).join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // Drivers: profiled drivers in full; others who won, took pole, or scored championship points.
  const idx = standingsIndex().drivers;
  const notable = new Set<string>([
    ...c.profiledDrivers,
    ...c.races.flatMap((r) => [r.winner?.driverId, r.pole?.driverId].filter(Boolean) as string[]),
    ...Object.entries(idx)
      .filter(([, rows]) => rows.some((x) => x.points > 0))
      .map(([id]) => id),
  ]);
  for (const id of notable) {
    const d = c.drivers[id];
    if (!d) continue;
    const s = driverStats(id);
    const profile = DRIVER_PROFILES.find((p) => p.id === id);
    const seasons = (idx[id] ?? []).map((x) => `${x.season}: P${x.position ?? "-"} (${x.points} pts, ${x.constructorIds.map(teamDisplayName).join("/")})`);
    const debut = c.winnerDebuts[id];
    const lines = [
      `${d.name}, ${d.nationality} driver, born ${d.dob ?? "unknown"}${profile?.died ? `, died ${profile.died}` : ""}.`,
      `Career: ${s.firstSeason ?? "?"}–${s.lastSeason ?? "?"}. Titles: ${s.titles}. Wins: ${s.wins}. Pole positions: ${s.poles}. Fastest laps recorded (data from 2004 onward): ${s.fastestLaps}.` +
        (s.coverage === "full" ? ` Starts: ${s.starts}. Podiums: ${s.podiums}. Championship points: ${s.points}.` : " Race-by-race data not held in the archive for this driver."),
      seasons.length ? `Championship finishes by season: ${seasons.join("; ")}.` : "",
      debut ? `First championship race: ${debut.raceId.replace("-", " round ")}, finished ${ordinalPos(debut.position)}.` : "",
    ];
    if (profile) lines.push(...profile.bio.map(plainText), `Key races: ${profile.keyRaces.map((k) => `${k.season} ${k.race}: ${k.note}`).join(" ")}`);
    if (driverCareer(id)) {
      const mates = teammateSummary(id).slice(0, 10);
      if (mates.length)
        lines.push(
          `Teammate head-to-heads (races both classified, who finished ahead): ${mates
            .map((m) => `vs ${driverName(m.driverId)} (${m.teams.map(teamDisplayName).join("/")}, ${m.seasons}): ${m.ahead}-${m.behind}`)
            .join("; ")}.`,
        );
    }
    docs.push({ id: `driver:${id}`, kind: "driver", title: d.name, href: href.driver(id), text: lines.filter(Boolean).join("\n") });
  }

  // Teams
  for (const t of TEAM_PROFILES) {
    const ids = c.profiledTeams[t.key];
    const s = teamStats(ids, t.key);
    const chain = lineageChain(t.lineageNode ?? t.key);
    docs.push({
      id: `team:${t.key}`,
      kind: "team",
      title: t.name,
      href: `/teams/${t.slug}`,
      text: [
        `${t.fullName} (${t.name}), ${t.nationality} team based in ${t.base}. Years: ${t.years}. Status: ${t.status}.`,
        `Statistics: ${s.entries} Grands Prix entered, ${s.wins} wins, ${s.poles} pole positions, ${s.podiums} podium finishes, ${s.driversTitles} drivers' titles, ${s.constructorsTitles} constructors' titles.`,
        plainText(t.summary),
        ...t.chapters.flatMap((ch) => [`${ch.era} — ${ch.title}.`, ...ch.body.map(plainText)]),
        chain.length > 1 ? `Lineage: ${chain.map((n) => `${n.name} (${n.years})`).join(" → ")}.` : "",
        `Notable cars: ${t.cars.map((car) => `${car.chassis} (${car.season}, ${car.engine}): ${car.note}`).join(" ")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }
  // Other constructors with wins or titles
  for (const [id, con] of Object.entries(c.constructors)) {
    if (teamKeyOf(id)) continue;
    const s = teamStats([id]);
    if (!s.wins && !s.constructorsTitles && !s.poles) continue;
    const chain = lineageChain(id);
    docs.push({
      id: `team:${id}`,
      kind: "team",
      title: con.name,
      href: href.constructor(id),
      text: `${con.name}, ${con.nationality} constructor, ${s.firstSeason ?? "?"}–${s.lastSeason ?? "?"}. Wins: ${s.wins}. Pole positions: ${s.poles}. Drivers' titles: ${s.driversTitles}. Constructors' titles: ${s.constructorsTitles}.${chain.length > 1 ? ` Lineage: ${chain.map((n) => n.name).join(" → ")}.` : ""}`,
    });
  }

  // Circuits
  for (const ci of Object.values(c.circuits)) {
    const races = c.races.filter((r) => r.circuitId === ci.id && r.winner);
    if (!races.length) continue;
    const wins = new Map<string, number>();
    for (const r of races) wins.set(r.winner!.driverId, (wins.get(r.winner!.driverId) ?? 0) + 1);
    const top = [...wins.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const profile = CIRCUIT_PROFILES.find((p) => p.id === ci.id);
    docs.push({
      id: `circuit:${ci.id}`,
      kind: "circuit",
      title: ci.name,
      href: href.circuit(ci.id),
      text: [
        `${ci.name}, ${ci.locality}, ${ci.country}. Hosted ${races.length} championship Grands Prix, first in ${races[0].season}, most recently ${races.at(-1)!.season}.`,
        `Most wins here: ${top.map(([d, n]) => `${driverName(d)} ${n}`).join(", ")}.`,
        profile ? plainText(profile.summary) : "",
        profile ? `Layout history: ${profile.layouts.map((l) => `${l.years}: ${l.note}`).join(" ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  // Eras
  for (const e of ERAS) {
    const leaders = eraLeaders(e.from, e.to ?? c.currentSeason);
    docs.push({
      id: `era:${e.slug}`,
      kind: "era",
      title: e.name,
      href: `/eras/${e.slug}`,
      text: [
        `${e.name} (${e.from}–${e.to ?? "present"}): ${e.tagline}`,
        ...e.intro.map(plainText),
        `Regulations: ${e.regulations.join(" ")}`,
        `Technical innovations: ${e.innovations.join(" ")}`,
        `Safety: ${e.safety.map(plainText).join(" ")}`,
        `Most race wins in this era (teams): ${leaders.teams.map((x) => `${x.name} ${x.wins}`).join(", ")}.`,
        `Most race wins in this era (drivers): ${leaders.drivers.map((x) => `${x.name} ${x.wins}`).join(", ")}.`,
        `Drivers' champions: ${leaders.champions.map((x) => `${x.year} ${x.name}`).join(", ")}.`,
      ].join("\n"),
    });
  }

  // All-time records (computed)
  const tally = (pick: (r: (typeof c.races)[number]) => string | undefined) => {
    const m = new Map<string, number>();
    for (const r of c.races) {
      const id = pick(r);
      if (id) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  };
  const titles = new Map<string, number>();
  for (const s of c.seasons) if (s.driverChampion) titles.set(s.driverChampion.driverId, (titles.get(s.driverChampion.driverId) ?? 0) + 1);
  const debutWinners = Object.entries(c.winnerDebuts).filter(([, d]) => d.position === 1);
  const firstSeasonChamps = titlesInFirstSeason();
  docs.push({
    id: "records",
    kind: "records",
    title: "All-time records",
    href: "/drivers?sort=wins",
    text: [
      `All-time race wins leaders: ${tally((r) => r.winner?.driverId).map(([d, n]) => `${driverName(d)} ${n}`).join(", ")}.`,
      `All-time pole positions leaders: ${tally((r) => r.pole?.driverId).map(([d, n]) => `${driverName(d)} ${n}`).join(", ")}.`,
      `Most drivers' championships: ${[...titles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([d, n]) => `${driverName(d)} ${n}`).join(", ")}.`,
      `Most wins by team: ${tally((r) => (r.winner ? (teamKeyOf(r.winner.constructorId) ?? r.winner.constructorId) : undefined)).map(([t, n]) => `${TEAM_PROFILES.find((p) => p.key === t)?.name ?? teamDisplayName(t)} ${n}`).join(", ")}.`,
      `Drivers who won their first championship race (won on debut): ${debutWinners.map(([d, x]) => `${driverName(d)} (${x.raceId.split("-")[0]})`).join(", ") || "none"}.`,
      `Constructors that won the constructors' title in their first season: ${firstSeasonChamps.map((s) => `${teamDisplayName(s.constructorChampion!.constructorId)} (${s.year})`).join(", ") || "none"}.`,
    ].join("\n"),
  });

  corpus = docs;
  return docs;
}

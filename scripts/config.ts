/**
 * What the data pipeline pulls in. Extend the archive by adding ids here, then
 * re-run `npm run data:fetch && npm run data:build` (see README → Extending).
 */

/** Seasons with full race-by-race results, standings and points progression. */
export const FEATURED_SEASONS = [1976, 1988, 2009, 2021];

/** The season the nightly job refreshes. Also fetched in full. */
export const CURRENT_SEASON = 2026;

/** Drivers with full career data (every result, teammates, heatmap). Jolpica driverIds. */
export const PROFILED_DRIVERS = [
  "fangio",
  "clark",
  "stewart",
  "lauda",
  "hunt",
  "prost",
  "senna",
  "mansell",
  "michael_schumacher",
  "alonso",
  "button",
  "hamilton",
  "max_verstappen",
];

/**
 * Teams with full histories. Jolpica splits some early chassis builders by engine
 * (e.g. "Brabham-Repco"); the archive aggregates every variant under one chassis brand.
 */
export const PROFILED_TEAMS: Record<string, string[]> = {
  ferrari: ["ferrari"],
  mclaren: ["mclaren", "mclaren-ford", "mclaren-brm", "mclaren-alfa_romeo", "mclaren-seren"],
  mercedes: ["mercedes"],
  red_bull: ["red_bull"],
  williams: ["williams"],
  brabham: ["brabham", "brabham-climax", "brabham-repco", "brabham-ford", "brabham-brm", "brabham-alfa_romeo"],
  lotus: ["team_lotus", "lotus-climax", "lotus-ford", "lotus-brm", "lotus-maserati", "lotus-borgward", "lotus-pw"],
  tyrrell: ["tyrrell"],
  jordan: ["jordan"],
  brawn: ["brawn"],
};

/**
 * Seasons to drop from a profiled team's history when the source groups an unrelated
 * earlier outfit under the same id. Jolpica files Frank Williams Racing Cars' 1975–76
 * entries under "williams"; Williams Grand Prix Engineering (founded 1977) first raced
 * its own chassis in 1978.
 */
export const TEAM_FIRST_SEASON: Record<string, number> = { williams: 1978 };

/**
 * Shapes of the generated archive (data/generated/*). Produced by scripts/build-archive.ts
 * from Jolpica-F1 responses and mirrored 1:1 by the Prisma schema.
 */

export type DriverRef = {
  id: string;
  name: string;
  given: string;
  family: string;
  nationality: string;
  dob?: string;
  code?: string;
  number?: string;
  wiki?: string;
};

export type ConstructorRef = {
  id: string;
  name: string;
  nationality: string;
};

export type Circuit = {
  id: string;
  name: string;
  locality: string;
  country: string;
  lat: number;
  lng: number;
  wiki?: string;
};

export type RaceRef = { driverId: string; constructorId: string };

export type Race = {
  /** `${season}-${round}` */
  id: string;
  season: number;
  round: number;
  name: string;
  date: string;
  circuitId: string;
  wiki?: string;
  winner?: RaceRef;
  /** "qualifying" when from official qualifying data, "grid" when inferred from grid P1. */
  pole?: RaceRef & { source: "qualifying" | "grid" };
  fastestLap?: RaceRef & { time: string };
};

export type ResultRow = {
  raceId: string;
  season: number;
  round: number;
  driverId: string;
  constructorId: string;
  number?: string;
  grid: number;
  /** null when not classified */
  position: number | null;
  positionText: string;
  points: number;
  status: string;
  laps: number;
  time?: string;
  fastestLapRank?: number;
  fastestLapTime?: string;
};

export type DriverStanding = {
  position: number | null;
  driverId: string;
  constructorIds: string[];
  points: number;
  wins: number;
};

export type ConstructorStanding = {
  position: number | null;
  constructorId: string;
  points: number;
  wins: number;
};

export type SeasonSummary = {
  year: number;
  rounds: number;
  status: "complete" | "in-progress" | "upcoming";
  /** True when race-by-race results and full standings are in the archive. */
  detailed: boolean;
  driverChampion?: { driverId: string; constructorIds: string[]; points: number; wins: number };
  constructorChampion?: { constructorId: string; points: number; wins: number };
};

export type SeasonDetail = {
  year: number;
  results: ResultRow[];
  qualifying: { raceId: string; driverId: string; constructorId: string; position: number; q1?: string; q2?: string; q3?: string }[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  /** Standings round the standings tables reflect (for in-progress seasons). */
  standingsRound: number;
};

export type DriverCareer = {
  driverId: string;
  results: ResultRow[];
  standings: (DriverStanding & { season: number })[];
  /** Results of every teammate in every race the driver entered. */
  teammateResults: ResultRow[];
};

export type TeamHistory = {
  key: string;
  constructorIds: string[];
  results: ResultRow[];
  /** One row per season; best position if several chassis variants were classified. */
  standings: (ConstructorStanding & { season: number })[];
};

export type Core = {
  generatedAt: string;
  currentSeason: number;
  totals: { drivers: number; constructors: number; races: number; seasons: number };
  drivers: Record<string, DriverRef>;
  constructors: Record<string, ConstructorRef>;
  circuits: Record<string, Circuit>;
  races: Race[];
  seasons: SeasonSummary[];
  /** First championship race of every driver who has won a race. */
  winnerDebuts: Record<string, { raceId: string; position: number | null; constructorId: string }>;
  /** First season of every constructors' champion (by Jolpica constructor id). */
  championFirstSeasons: Record<string, number>;
  profiledDrivers: string[];
  profiledTeams: Record<string, string[]>;
  featuredSeasons: number[];
};

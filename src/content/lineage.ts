/**
 * How team entries evolved. Mirrors the constructor_lineage table in prisma/schema.prisma
 * (predecessor → successor, year of change, type).
 */
export type LineageType = "rebrand" | "takeover" | "merger";

export type LineageNode = {
  id: string;
  name: string;
  years: string;
  /** Profiled team key, when the archive has a full page for it. */
  teamKey?: string;
  /** Jolpica constructor id, for a basic page when not profiled. */
  constructorId?: string;
};

export type LineageEdge = { from: string; to: string; year: number; type: LineageType; note?: string };

export const LINEAGE_NODES: LineageNode[] = [
  { id: "ferrari", name: "Ferrari", years: "1950–", teamKey: "ferrari" },
  { id: "mclaren", name: "McLaren", years: "1966–", teamKey: "mclaren" },
  { id: "williams", name: "Williams", years: "1977–", teamKey: "williams" },
  { id: "brabham", name: "Brabham", years: "1962–1992", teamKey: "brabham" },
  { id: "lotus", name: "Team Lotus", years: "1958–1994", teamKey: "lotus" },

  { id: "tyrrell", name: "Tyrrell", years: "1970–1998", teamKey: "tyrrell" },
  { id: "bar", name: "BAR", years: "1999–2005", constructorId: "bar" },
  { id: "honda", name: "Honda", years: "2006–2008", constructorId: "honda" },
  { id: "brawn", name: "Brawn GP", years: "2009", teamKey: "brawn" },
  { id: "mercedes", name: "Mercedes", years: "2010–", teamKey: "mercedes" },

  { id: "toleman", name: "Toleman", years: "1981–1985", constructorId: "toleman" },
  { id: "benetton", name: "Benetton", years: "1986–2001", constructorId: "benetton" },
  { id: "renault", name: "Renault", years: "2002–2011", constructorId: "renault" },
  { id: "lotus_f1", name: "Lotus F1", years: "2012–2015", constructorId: "lotus_f1" },
  { id: "renault2", name: "Renault", years: "2016–2020", constructorId: "renault" },
  { id: "alpine", name: "Alpine", years: "2021–", constructorId: "alpine" },

  { id: "jordan", name: "Jordan", years: "1991–2005", teamKey: "jordan" },
  { id: "midland", name: "Midland", years: "2006", constructorId: "mf1" },
  { id: "spyker", name: "Spyker", years: "2007", constructorId: "spyker" },
  { id: "force_india", name: "Force India", years: "2008–2018", constructorId: "force_india" },
  { id: "racing_point", name: "Racing Point", years: "2019–2020", constructorId: "racing_point" },
  { id: "aston_martin", name: "Aston Martin", years: "2021–", constructorId: "aston_martin" },

  { id: "minardi", name: "Minardi", years: "1985–2005", constructorId: "minardi" },
  { id: "toro_rosso", name: "Toro Rosso", years: "2006–2019", constructorId: "toro_rosso" },
  { id: "alphatauri", name: "AlphaTauri", years: "2020–2023", constructorId: "alphatauri" },
  { id: "rb", name: "RB", years: "2024–", constructorId: "rb" },

  { id: "stewart", name: "Stewart", years: "1997–1999", constructorId: "stewart" },
  { id: "jaguar", name: "Jaguar", years: "2000–2004", constructorId: "jaguar" },
  { id: "red_bull", name: "Red Bull", years: "2005–", teamKey: "red_bull" },
];

export const LINEAGE_EDGES: LineageEdge[] = [
  { from: "tyrrell", to: "bar", year: 1999, type: "takeover", note: "Bought by British American Tobacco in 1997" },
  { from: "bar", to: "honda", year: 2006, type: "takeover" },
  { from: "honda", to: "brawn", year: 2009, type: "takeover", note: "Management buyout led by Ross Brawn" },
  { from: "brawn", to: "mercedes", year: 2010, type: "takeover" },

  { from: "toleman", to: "benetton", year: 1986, type: "takeover" },
  { from: "benetton", to: "renault", year: 2002, type: "takeover", note: "Renault bought the team in 2000" },
  { from: "renault", to: "lotus_f1", year: 2012, type: "rebrand" },
  { from: "lotus_f1", to: "renault2", year: 2016, type: "takeover" },
  { from: "renault2", to: "alpine", year: 2021, type: "rebrand" },

  { from: "jordan", to: "midland", year: 2006, type: "takeover" },
  { from: "midland", to: "spyker", year: 2007, type: "takeover" },
  { from: "spyker", to: "force_india", year: 2008, type: "takeover" },
  { from: "force_india", to: "racing_point", year: 2019, type: "takeover", note: "Assets bought mid-2018 by a consortium led by Lawrence Stroll" },
  { from: "racing_point", to: "aston_martin", year: 2021, type: "rebrand" },

  { from: "minardi", to: "toro_rosso", year: 2006, type: "takeover" },
  { from: "toro_rosso", to: "alphatauri", year: 2020, type: "rebrand" },
  { from: "alphatauri", to: "rb", year: 2024, type: "rebrand" },

  { from: "stewart", to: "jaguar", year: 2000, type: "takeover" },
  { from: "jaguar", to: "red_bull", year: 2005, type: "takeover" },
];

/** The full chain (root → leaf) containing a node, or just the node if it has no lineage. */
export function lineageChain(nodeId: string): LineageNode[] {
  const byId = new Map(LINEAGE_NODES.map((n) => [n.id, n]));
  let root = nodeId;
  for (;;) {
    const prev = LINEAGE_EDGES.find((e) => e.to === root);
    if (!prev) break;
    root = prev.from;
  }
  const chain: LineageNode[] = [];
  for (let cur: string | undefined = root; cur; cur = LINEAGE_EDGES.find((e) => e.from === cur)?.to) {
    const n = byId.get(cur);
    if (n) chain.push(n);
  }
  return chain;
}

export const edgeInto = (nodeId: string) => LINEAGE_EDGES.find((e) => e.to === nodeId);

/** Chains shown on the Teams index. */
export const FEATURED_CHAINS = ["mercedes", "alpine", "aston_martin", "rb", "red_bull"];

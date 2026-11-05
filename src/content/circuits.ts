import type { CircuitProfile } from "./types";

const SOURCE = "Pitwall Archive editorial; race history computed from Jolpica-F1";
const REVIEWED = "2026-10-11";

/** Outlines are hand-drawn schematics in a 0–100 viewBox. They are not to scale. */
export const CIRCUIT_PROFILES: CircuitProfile[] = [
  {
    id: "monaco",
    summary:
      "A street circuit through Monte Carlo's harbour, casino and tunnel. It has been on the calendar since the championship's first season. Overtaking is nearly impossible, so qualifying is everything, and a win here carries unique prestige.",
    outline:
      "M60 72 L76 72 L81 66 L71 36 C68 26 60 23 55 29 L46 41 C41 46 36 41 31 46 L26 55 C20 63 25 76 36 76 L45 77 L48 73 L51 76 L56 73 L59 70 L62 74 Z",
    layouts: [
      { years: "1950–1972", note: "Original layout around the old gasworks hairpin." },
      { years: "1973", note: "Swimming-pool section and La Rascasse added as the pits moved to the harbour front." },
      { years: "2000s", note: "Rascasse and pit lane reconfigured with the new pit buildings." },
    ],
    currentLayoutSince: 2004,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "monza",
    summary:
      "The 'Temple of Speed' in the royal park north of Milan. It has hosted the Italian Grand Prix in every year but one since 1950. Long straights and chicanes make it the fastest lap of the season, and the tifosi make it Ferrari's home.",
    outline:
      "M30 85 L80 85 L83 82 L86 83 C95 75 95 58 88 50 L85 48 L86 45 L82 30 C80 22 72 20 70 28 C68 34 62 34 60 28 L48 45 L45 45 L43 49 L20 70 C12 78 18 85 30 85 Z",
    layouts: [
      { years: "1955–1961", note: "The high-speed banking was used in some years (1955, 1956, 1960, 1961)." },
      { years: "1972", note: "Chicanes added to slow the cars." },
      { years: "1976", note: "Chicanes revised and the Roggia chicane added." },
      { years: "2000", note: "First chicane reprofiled after a start-line accident." },
    ],
    currentLayoutSince: 2004,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "silverstone",
    summary:
      "A former RAF airfield in Northamptonshire that hosted the first World Championship race on 13 May 1950. The flowing Maggotts–Becketts–Chapel sequence and Copse remain among the great tests of a car.",
    outline:
      "M20 60 L35 75 C40 80 50 78 55 70 L70 72 C80 74 88 65 82 55 L75 40 C70 30 62 32 60 25 L55 15 C50 10 42 12 40 20 L35 35 C30 40 22 45 20 60 Z",
    layouts: [
      { years: "1950–1990", note: "Airfield perimeter layout, one of the fastest tracks in the world." },
      { years: "1991", note: "Major redesign with the Becketts complex and a new Luffield section." },
      { years: "2010–2011", note: "Arena section added. The pits and start moved to the new 'Wing'." },
    ],
    currentLayoutSince: 2011,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "spa",
    summary:
      "Seven kilometres of Ardennes forest, home to Eau Rouge and Raidillon, Pouhon and Blanchimont. The weather often differs from one end of the lap to the other.",
    outline:
      "M25 25 C18 22 15 30 22 35 L30 55 L28 61 L32 65 L80 30 L85 32 L83 38 C85 50 75 55 78 65 C80 75 65 80 55 70 L35 40 L32 35 L30 27 Z",
    layouts: [
      { years: "1950–1970", note: "The original 14 km road circuit, fast and dangerous." },
      { years: "1983", note: "Shortened circuit of about 7 km, keeping Eau Rouge." },
      { years: "2007", note: "Bus Stop chicane and pit entry revised." },
    ],
    currentLayoutSince: 2007,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "suzuka",
    summary:
      "Honda's figure-of-eight test track, the only one on the calendar, crossing itself by a bridge. It has decided many championships, including Senna and Prost's collisions in 1989 and 1990.",
    outline:
      "M20 70 L50 70 C60 70 62 60 55 55 C48 50 52 42 58 45 C64 48 68 40 62 36 L45 30 C35 27 38 15 48 18 L70 30 C80 36 86 26 80 18 C74 10 64 16 66 26 L60 50 L40 78 C34 86 16 80 20 70 Z",
    layouts: [
      { years: "1987", note: "First Japanese Grand Prix at Suzuka." },
      { years: "2003", note: "130R and the final chicane reprofiled." },
    ],
    currentLayoutSince: 2003,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "interlagos",
    summary:
      "The Autódromo José Carlos Pace in São Paulo is a short, undulating, anticlockwise lap set in a natural bowl. Its crowd and its weather have made it a frequent title decider.",
    outline:
      "M30 20 L70 18 C80 18 82 28 75 32 L55 40 C48 44 52 52 60 52 L78 55 C88 58 86 72 76 74 L35 80 C22 82 15 70 20 60 L28 45 C32 38 22 30 30 20 Z",
    layouts: [
      { years: "1973–1980", note: "Original 7.9 km layout." },
      { years: "1990", note: "Returned to the calendar shortened to about 4.3 km." },
    ],
    currentLayoutSince: 2004,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "nurburgring",
    summary:
      "The Nordschleife, 22.8 km through the Eifel mountains, was the ultimate test of the early championship. After Lauda's 1976 crash F1 left it. Grands Prix returned from 1984 on the modern GP-Strecke.",
    outline:
      "M20 30 C15 40 25 45 35 42 L60 40 C70 40 72 30 80 30 C90 30 88 45 80 50 L55 70 C45 78 30 75 25 65 L22 55 C18 48 24 44 20 30 Z",
    layouts: [
      { years: "1951–1976", note: "Nordschleife, about 22.8 km." },
      { years: "1984", note: "New Grand Prix circuit opened." },
      { years: "2002", note: "Mercedes Arena section added." },
    ],
    currentLayoutSince: 2002,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
  {
    id: "yas_marina",
    summary:
      "Abu Dhabi's twilight venue, with a hotel bridging the track. It has usually closed the season since 2009, including the decisive final lap of 2021.",
    outline:
      "M15 55 L45 52 C55 51 58 42 52 38 L35 30 C28 26 32 18 40 20 L85 30 C92 32 92 42 85 44 L70 48 C64 50 66 60 72 62 L82 66 C88 70 84 80 76 78 L20 70 C10 68 8 56 15 55 Z",
    layouts: [
      { years: "2009", note: "Opened with the first day-to-night Grand Prix." },
      { years: "2021", note: "Revised layout: hairpin and chicanes removed for faster, flowing corners." },
    ],
    currentLayoutSince: 2021,
    source: SOURCE,
    lastReviewed: REVIEWED,
  },
];

export const circuitProfile = (id: string) => CIRCUIT_PROFILES.find((c) => c.id === id);

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

export type MapCircuit = { id: string; href: string; name: string; place: string; races: number; first: number; last: number; current: boolean };

const W = 960;
const H = 500;

/** Equal-area-ish world map with every circuit as a dot (sized by races hosted). */
export function WorldMap({ circuits }: { circuits: (MapCircuit & { lat: number; lng: number })[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const { land, grat, project } = useMemo(() => {
    const projection = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [W - 8, H - 8],
      ],
      { type: "Sphere" },
    );
    const path = geoPath(projection);
    const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
    return {
      land: path(feature(topo, topo.objects.land)) ?? "",
      grat: path(geoGraticule10()) ?? "",
      project: (lng: number, lat: number) => projection([lng, lat]) ?? [0, 0],
    };
  }, []);
  const active = circuits.find((c) => c.id === hover);

  return (
    <figure className="card relative overflow-hidden p-2 sm:p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="World map of Formula 1 circuits">
        <path d={grat} fill="none" stroke="var(--border)" strokeWidth={0.6} />
        <path d={land} fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth={0.6} />
        {[...circuits]
          .sort((a, b) => Number(a.current) - Number(b.current))
          .map((c) => {
            const [x, y] = project(c.lng, c.lat);
            const r = 2.5 + Math.sqrt(c.races) * 0.75;
            return (
              <Link key={c.id} href={c.href} aria-label={`${c.name}, ${c.place}: ${c.races} Grands Prix`}>
                <circle
                  cx={x}
                  cy={y}
                  r={hover === c.id ? r + 2 : r}
                  fill={c.current ? "var(--accent)" : "var(--muted)"}
                  fillOpacity={c.current ? 0.85 : 0.55}
                  stroke="var(--surface)"
                  strokeWidth={1.5}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(c.id)}
                  onBlur={() => setHover(null)}
                  style={{ transition: "r 150ms ease" }}
                />
              </Link>
            );
          })}
      </svg>
      {active && (
        <div className="card pointer-events-none absolute left-4 top-4 px-3 py-2 text-xs shadow-lift">
          <p className="font-medium text-ink">{active.name}</p>
          <p className="text-muted-strong">{active.place}</p>
          <p className="tnum mt-1 text-body">
            {active.races} Grand{active.races === 1 ? "" : "s"} Prix · {active.first}
            {active.last !== active.first && `–${active.last}`}
          </p>
        </div>
      )}
      <figcaption className="flex flex-wrap gap-4 px-2 pt-2 text-xs text-muted-strong">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent" aria-hidden /> On the current calendar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-muted" aria-hidden /> Former venue
        </span>
        <span>Dot size reflects Grands Prix hosted.</span>
      </figcaption>
    </figure>
  );
}

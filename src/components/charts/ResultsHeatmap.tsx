import Link from "next/link";
import { cn } from "@/lib/utils";

export type HeatCell = {
  raceId: string;
  href: string;
  round: number;
  raceName: string;
  team: string;
  position: number | null;
  positionText: string;
  status: string;
};

/** One-hue sequential ramp: darker = better finish. Retirements are neutral; non-starts are outlined. */
const BANDS = [
  { max: 1, fill: "#184f95", ink: "#ffffff", label: "Win" },
  { max: 3, fill: "#2a78d6", ink: "#ffffff", label: "Podium" },
  { max: 6, fill: "#5598e7", ink: "#ffffff", label: "P4–6" },
  { max: 10, fill: "#9ec5f4", ink: "#0f172a", label: "P7–10" },
  { max: 99, fill: "#cde2fb", ink: "#0f172a", label: "P11+" },
];
const NON_START = /did not (pre-?)?qualify|withdrew|did not start|excluded from qualifying/i;

function style(c: HeatCell) {
  if (NON_START.test(c.status)) return { className: "border border-dashed border-line-strong text-muted-strong", text: "—" };
  if (c.position === null) return { className: "bg-[#e2e5ea] text-[#475569] dark:bg-[#2e3442] dark:text-[#b6c0cf]", text: c.positionText === "D" ? "DQ" : "×" };
  const b = BANDS.find((x) => c.position! <= x.max)!;
  return { style: { background: b.fill, color: b.ink }, text: String(c.position) };
}

/** Finishing position for every race of a career, one row per season. */
export function ResultsHeatmap({ seasons }: { seasons: { season: number; cells: HeatCell[] }[] }) {
  return (
    <figure className="card p-4 sm:p-5">
      <div className="space-y-1.5 overflow-x-auto pb-1">
        {seasons.map((s) => (
          <div key={s.season} className="flex items-center gap-2">
            <Link href={`/seasons/${s.season}`} className="tnum w-10 shrink-0 text-xs text-muted-strong hover:text-ink">
              {s.season}
            </Link>
            <ol className="flex gap-1" aria-label={`${s.season} results`}>
              {s.cells.map((c) => {
                const st = style(c);
                const desc = `${s.season} ${c.raceName}: ${c.position ? `P${c.position}` : c.status} (${c.team})`;
                return (
                  <li key={c.raceId}>
                    <Link
                      href={c.href}
                      title={desc}
                      aria-label={desc}
                      className={cn(
                        "tnum flex size-6 items-center justify-center rounded-[5px] text-[10px] font-medium transition-transform hover:scale-110 sm:size-7",
                        st.className,
                      )}
                      style={st.style}
                    >
                      {st.text}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-strong">
        {BANDS.map((b) => (
          <span key={b.label} className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px]" style={{ background: b.fill }} aria-hidden /> {b.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-[#e2e5ea] dark:bg-[#2e3442]" aria-hidden /> Retired / not classified (×)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border border-dashed border-line-strong" aria-hidden /> Did not start / qualify
        </span>
      </figcaption>
    </figure>
  );
}

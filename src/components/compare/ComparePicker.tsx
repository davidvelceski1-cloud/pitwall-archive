"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { slug: string; name: string };

/** Choose 2–3 drivers or teams; updates the URL so comparisons are shareable. */
export function ComparePicker({
  type,
  selected,
  drivers,
  teams,
}: {
  type: "drivers" | "teams";
  selected: string[];
  drivers: Option[];
  teams: Option[];
}) {
  const router = useRouter();
  const [picks, setPicks] = useState<string[]>(selected);
  const options = type === "drivers" ? drivers : teams;

  const go = (t: "drivers" | "teams", ids: string[]) => router.push(`/compare?type=${t}&ids=${ids.filter(Boolean).join(",")}`, { scroll: false });

  return (
    <div className="card p-4">
      <div role="tablist" aria-label="Compare" className="mb-4 inline-flex rounded-full border border-line bg-surface-2 p-0.5">
        {(["drivers", "teams"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={type === t}
            type="button"
            onClick={() => {
              const def = t === "drivers" ? ["ayrton-senna", "alain-prost"] : ["ferrari", "mclaren"];
              setPicks(def);
              go(t, def);
            }}
            className={cn("rounded-full px-4 py-1.5 text-sm capitalize", type === t ? "bg-surface text-ink shadow-card" : "text-body")}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {picks.map((p, i) => (
          <div key={i} className="flex items-center gap-1 rounded-full border border-line bg-surface pl-3 pr-1">
            <label className="sr-only" htmlFor={`pick-${i}`}>
              {type === "drivers" ? "Driver" : "Team"} {i + 1}
            </label>
            <select
              id={`pick-${i}`}
              value={p}
              onChange={(e) => {
                const next = [...picks];
                next[i] = e.target.value;
                setPicks(next);
                go(type, next);
              }}
              className="bg-transparent py-1.5 text-sm text-ink outline-none"
            >
              {options.map((o) => (
                <option key={o.slug} value={o.slug} disabled={picks.includes(o.slug) && o.slug !== p}>
                  {o.name}
                </option>
              ))}
            </select>
            {picks.length > 2 && (
              <button
                type="button"
                aria-label="Remove"
                onClick={() => {
                  const next = picks.filter((_, j) => j !== i);
                  setPicks(next);
                  go(type, next);
                }}
                className="rounded-full p-1 text-muted-strong hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {picks.length < 3 && (
          <button
            type="button"
            onClick={() => {
              const extra = options.find((o) => !picks.includes(o.slug));
              if (!extra) return;
              const next = [...picks, extra.slug];
              setPicks(next);
              go(type, next);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-sm text-body hover:text-ink"
          >
            <Plus className="size-3.5" /> Add a third
          </button>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

const NAMES = ["--series-1", "--series-2", "--series-3", "--series-4", "--series-5", "--grid", "--axis", "--muted-strong", "--ink", "--surface", "--border"] as const;
type Tokens = Record<(typeof NAMES)[number], string>;

const FALLBACK: Tokens = {
  "--series-1": "#2a78d6",
  "--series-2": "#eb6834",
  "--series-3": "#1baf7a",
  "--series-4": "#eda100",
  "--series-5": "#e87ba4",
  "--grid": "#e1e0d9",
  "--axis": "#c3c2b7",
  "--muted-strong": "#64748b",
  "--ink": "#0f172a",
  "--surface": "#ffffff",
  "--border": "#eef0f3",
};

/** Resolves chart CSS tokens to concrete colors (SVG attributes can't take var()), tracking theme changes. */
export function useChartTokens(): Tokens {
  const [tokens, setTokens] = useState<Tokens>(FALLBACK);
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setTokens(Object.fromEntries(NAMES.map((n) => [n, cs.getPropertyValue(n).trim() || FALLBACK[n]])) as Tokens);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return tokens;
}

export const seriesColor = (t: Tokens, i: number) => t[`--series-${(i % 5) + 1}` as keyof Tokens];

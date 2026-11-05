"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { palette } from "@/components/layout/CommandPalette";

/** Big hero search: Enter runs a natural-language search; ⌘K jumps straight to a page. */
export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        else palette.open();
      }}
      className="mx-auto mt-9 max-w-2xl"
    >
      <div className="flex items-center gap-3 rounded-full border border-line-strong bg-surface py-2 pl-5 pr-2 shadow-lift transition-colors focus-within:border-ink/30">
        <Search className="size-5 shrink-0 text-muted-strong" strokeWidth={1.5} aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          Search the archive
        </label>
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search 75+ years of Formula 1…"
          className="h-10 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted-strong"
          autoComplete="off"
        />
        <button type="submit" className="flex size-10 items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-105" aria-label="Search">
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
      </div>
      <p className="mt-3 text-center text-sm text-muted-strong">
        Try “drivers who won on debut” or “Monaco winners in the 1980s”, or press{" "}
        <button type="button" onClick={palette.open} className="rounded border border-line bg-surface px-1.5 text-xs text-body hover:text-ink">
          ⌘K
        </button>{" "}
        to jump to any page.
      </p>
    </form>
  );
}

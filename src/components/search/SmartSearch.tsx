"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import type { NlResult } from "@/lib/search/nl";
import { askStore } from "@/lib/ask-store";
import { AiLabel } from "@/components/ui/primitives";

const EXAMPLES = [
  "drivers who won on debut",
  "teams that won a title in their first season",
  "Monaco winners in the 1980s",
  "Senna wins from pole",
  "British champions",
  "Ferrari wins at Monza",
];

export function SmartSearch() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [state, setState] = useState<{ loading: boolean; result?: NlResult; error?: string }>({ loading: false });

  useEffect(() => {
    setInput(q);
    if (!q) {
      setState({ loading: false });
      return;
    }
    let live = true;
    setState({ loading: true });
    fetch("/api/nl-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q }) })
      .then(async (r) => {
        const data = await r.json();
        if (!live) return;
        if (!r.ok) setState({ loading: false, error: data.error ?? "Search failed." });
        else setState({ loading: false, result: data as NlResult });
      })
      .catch(() => live && setState({ loading: false, error: "Couldn't reach the archive. Check your connection and try again." }));
    return () => {
      live = false;
    };
  }, [q]);

  const submit = (v: string) => v.trim() && router.push(`/search?q=${encodeURIComponent(v.trim())}`);
  const r = state.result;

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-3 rounded-full border border-line-strong bg-surface py-1.5 pl-5 pr-1.5 shadow-card focus-within:border-ink/30"
      >
        <Search className="size-5 text-muted-strong" strokeWidth={1.5} aria-hidden />
        <label htmlFor="smart-q" className="sr-only">
          Search question
        </label>
        <input
          id="smart-q"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. teams that won a title in their first season"
          className="h-10 flex-1 bg-transparent text-ink outline-none placeholder:text-muted-strong"
        />
        <button type="submit" className="flex size-10 items-center justify-center rounded-full bg-accent text-white" aria-label="Search">
          <ArrowRight className="size-4" />
        </button>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <li key={e}>
            <button type="button" onClick={() => submit(e)} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-body hover:text-ink">
              {e}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10" aria-live="polite" aria-busy={state.loading}>
        {state.loading && (
          <div className="space-y-3">
            <div className="skeleton h-7 w-1/2" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton mt-6 h-64 w-full" />
          </div>
        )}
        {state.error && <p className="card px-5 py-4 text-accent-ink">{state.error}</p>}
        {r && !state.loading && (
          <div className="rise">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-3xl">{r.title}</h2>
            </div>
            <p className="mt-2 max-w-3xl text-body">{r.description}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-strong">
              {r.via === "ai" ? <AiLabel /> : <span className="rounded-full border border-line px-2 py-0.5">Keyword parser</span>}
              Your question was read as a structured query. Every row comes straight from the archive's records.
            </p>
            {r.note && <p className="mt-3 text-sm text-accent-ink">{r.note}</p>}
            {r.columns.length > 0 &&
              (r.rows.length ? (
                <div className="card mt-6 max-h-[640px] overflow-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{r.title}</caption>
                    <thead className="sticky top-0 bg-surface">
                      <tr className="border-b border-line">
                        {r.columns.map((c) => (
                          <th key={c} scope="col" className="px-4 py-2.5 text-left font-medium text-muted-strong">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {r.rows.map((row, i) => (
                        <tr key={i} className="border-b border-line last:border-0">
                          {row.map((cell, j) => (
                            <td key={j} className="tnum px-4 py-2">
                              {cell.href ? (
                                <Link href={cell.href} className="text-ink underline decoration-line-strong underline-offset-[3px] hover:decoration-accent">
                                  {cell.text}
                                </Link>
                              ) : (
                                cell.text
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="card mt-6 px-6 py-8 text-center text-body">No records match. Try widening the years or removing a filter.</p>
              ))}
            <button
              type="button"
              onClick={() => askStore.open(q)}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink shadow-card"
            >
              <Sparkles className="size-4 text-accent" strokeWidth={1.5} /> Ask the Archive instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

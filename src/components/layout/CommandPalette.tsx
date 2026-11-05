"use client";

import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Calendar, Flag, Landmark, MapPin, Search, Sparkles, Trophy, User } from "lucide-react";
import type { SearchItem } from "@/app/api/search-index/route";
import { askStore } from "@/lib/ask-store";

let items: SearchItem[] | null = null;
let loading: Promise<void> | null = null;
let isOpen = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((s) => s());
export const palette = {
  open: () => {
    isOpen = true;
    emit();
  },
  set: (v: boolean) => {
    isOpen = v;
    emit();
  },
};

const ICONS = { season: Calendar, team: Flag, driver: User, circuit: MapPin, race: Trophy, era: Landmark };
const GROUPS: [SearchItem["t"], string][] = [
  ["driver", "Drivers"],
  ["team", "Teams"],
  ["season", "Seasons"],
  ["circuit", "Circuits"],
  ["era", "Eras"],
  ["race", "Races"],
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Global ⌘K palette: jump to any season, team, driver, circuit, era or race. */
export function CommandPalette() {
  const open = useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => isOpen,
    () => false,
  );
  const [data, setData] = useState<SearchItem[] | null>(items);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.set(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || items) return;
    loading ??= fetch("/api/search-index")
      .then((r) => r.json())
      .then((d: SearchItem[]) => {
        items = d;
      });
    loading.then(() => setData(items));
  }, [open]);

  // Our own ranking (cmdk's built-in filter is slow on thousands of rows).
  const results = useMemo(() => {
    if (!data) return [];
    const nq = norm(q.trim());
    if (!nq) return data.filter((i) => i.w! >= 4).slice(0, 24);
    const words = nq.split(/\s+/);
    return data
      .map((i) => {
        const l = norm(i.l);
        if (!words.every((w) => l.includes(w) || norm(i.s ?? "").includes(w))) return null;
        const score = (l.startsWith(nq) ? 50 : 0) + (l.split(" ").some((p) => p.startsWith(words[0])) ? 20 : 0) + (i.w ?? 0) * 5 - l.length / 10;
        return { i, score };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 40)
      .map((x) => x!.i);
  }, [data, q]);

  const go = (h: string) => {
    palette.set(false);
    setQ("");
    router.push(h);
  };

  return (
    <Dialog.Root open={open} onOpenChange={palette.set}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-[2px]" />
        <Dialog.Content className="card rise fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden p-0 shadow-lift" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Search the archive</Dialog.Title>
          <Command shouldFilter={false} label="Search the archive" loop>
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="size-4 text-muted-strong" strokeWidth={1.5} aria-hidden />
              <Command.Input
                value={q}
                onValueChange={setQ}
                placeholder="Jump to a season, team, driver, circuit…"
                className="h-12 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted-strong"
              />
              <kbd className="rounded border border-line px-1.5 text-[10px] text-muted-strong">ESC</kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              {!data && (
                <Command.Loading>
                  <div className="space-y-2 p-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="skeleton h-8" />
                    ))}
                  </div>
                </Command.Loading>
              )}
              {data && (
                <Command.Empty className="px-3 py-8 text-center text-sm text-body">
                  Nothing in the archive matches “{q}”.
                  <button
                    type="button"
                    className="mt-2 block w-full text-accent-ink hover:underline"
                    onClick={() => {
                      palette.set(false);
                      router.push(`/search?q=${encodeURIComponent(q)}`);
                    }}
                  >
                    Try it as a natural-language search →
                  </button>
                </Command.Empty>
              )}
              {GROUPS.map(([t, label]) => {
                const group = results.filter((r) => r.t === t);
                if (!group.length) return null;
                const Icon = ICONS[t];
                return (
                  <Command.Group key={t} heading={label} className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-strong">
                    {group.map((r) => (
                      <Command.Item
                        key={r.h}
                        value={r.h}
                        onSelect={() => go(r.h)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-body data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
                      >
                        <Icon className="size-4 shrink-0 text-muted-strong" strokeWidth={1.5} aria-hidden />
                        <span className="truncate text-ink">{r.l}</span>
                        {r.s && <span className="ml-auto shrink-0 truncate text-xs text-muted-strong">{r.s}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}
              {q.trim().length > 3 && (
                <Command.Group heading="Ask" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-strong">
                  <Command.Item
                    value="__ask"
                    onSelect={() => {
                      palette.set(false);
                      askStore.open(q);
                      setQ("");
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-body data-[selected=true]:bg-surface-2 data-[selected=true]:text-ink"
                  >
                    <Sparkles className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
                    Ask the Archive: “{q}”
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

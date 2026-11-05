"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { useEffect, useState, type ReactNode } from "react";
import type { Preview } from "@/lib/archive/preview";

const cache = new Map<string, Promise<Preview | null>>();

function fetchPreview(kind: string, id: string) {
  const key = `${kind}:${id}`;
  if (!cache.has(key))
    cache.set(
      key,
      fetch(`/api/preview?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`)
        .then((r) => (r.ok ? (r.json() as Promise<Preview>) : null))
        .catch(() => null),
    );
  return cache.get(key)!;
}

/** Wraps a link with a mini-profile card shown on hover/focus (loaded lazily). */
export function HoverPreview({ kind, id, children }: { kind: string; id: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Preview | null | undefined>(undefined);

  useEffect(() => {
    if (!open || preview !== undefined) return;
    let live = true;
    fetchPreview(kind, id).then((p) => live && setPreview(p));
    return () => {
      live = false;
    };
  }, [open, kind, id, preview]);

  return (
    <HoverCard.Root openDelay={350} closeDelay={80} open={open} onOpenChange={setOpen}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="start"
          sideOffset={6}
          className="card rise z-50 w-72 p-4 text-sm"
          style={preview?.accent ? { borderTop: `3px solid ${preview.accent}` } : undefined}
        >
          {preview === undefined ? (
            <div className="space-y-2" aria-busy="true">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton mt-3 h-8 w-full" />
            </div>
          ) : preview === null ? (
            <p className="text-muted-strong">No preview available.</p>
          ) : (
            <div>
              <p className="font-medium text-ink">{preview.title}</p>
              <p className="mt-0.5 text-xs text-muted-strong">{preview.subtitle}</p>
              {preview.note && <p className="mt-2 text-body">{preview.note}</p>}
              {preview.stats.length > 0 && (
                <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                  {preview.stats.map((s) => (
                    <div key={s.label} className={s.value.length > 6 ? "col-span-3 flex justify-between gap-2" : ""}>
                      <dt className="text-[11px] text-muted-strong">{s.label}</dt>
                      <dd className="tnum font-medium text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}
          <HoverCard.Arrow className="fill-[var(--surface)]" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

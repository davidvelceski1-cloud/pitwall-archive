import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { LINEAGE_EDGES, lineageChain } from "@/content/lineage";
import { TEAM_PROFILES } from "@/content/teams";
import { core, href } from "@/lib/archive/data";
import { cn } from "@/lib/utils";

const TYPE_LABEL = { rebrand: "Rebrand", takeover: "Takeover", merger: "Merger" } as const;

/**
 * How a team's entry evolved, root → today. Horizontal on wide screens, vertical on mobile.
 * `current` highlights the node for the page being viewed.
 */
export function LineageTree({ nodeId, current }: { nodeId: string; current?: string }) {
  const chain = lineageChain(nodeId);
  const c = core();

  const nodeHref = (n: (typeof chain)[number]) => {
    if (n.teamKey) return `/teams/${TEAM_PROFILES.find((t) => t.key === n.teamKey)!.slug}`;
    if (n.constructorId && c.constructors[n.constructorId]) return href.constructor(n.constructorId);
    return undefined;
  };

  if (chain.length <= 1)
    return <p className="text-sm text-body">This team's entry has no predecessor or successor. It raced under one identity throughout.</p>;

  return (
    <ol className="flex flex-col items-stretch gap-1 md:flex-row md:flex-wrap md:items-center" aria-label="Team lineage, oldest first">
      {chain.map((n, i) => {
        const edge = i > 0 ? LINEAGE_EDGES.find((e) => e.from === chain[i - 1].id && e.to === n.id) : undefined;
        const target = nodeHref(n);
        const isCurrent = n.id === (current ?? nodeId);
        const profile = n.teamKey ? TEAM_PROFILES.find((t) => t.key === n.teamKey) : undefined;
        const box = (
          <span
            className={cn(
              "block rounded-xl border bg-surface px-3 py-2 text-sm transition-colors",
              isCurrent ? "border-ink shadow-card" : "border-line hover:border-line-strong",
            )}
            style={profile ? { borderLeft: `3px solid ${profile.color}` } : undefined}
          >
            <span className="block font-medium text-ink">{n.name}</span>
            <span className="tnum block text-xs text-muted-strong">{n.years}</span>
          </span>
        );
        return (
          <li key={n.id} className="flex flex-col items-stretch gap-1 md:flex-row md:items-center">
            {edge && (
              <span className="flex items-center gap-1 self-center px-1 text-[11px] text-muted-strong" title={edge.note}>
                <ArrowDown className="size-3.5 md:hidden" aria-hidden />
                <span className="tnum">
                  {TYPE_LABEL[edge.type]} · {edge.year}
                </span>
                <ArrowRight className="hidden size-3.5 md:block" aria-hidden />
              </span>
            )}
            {target && !isCurrent ? (
              <Link href={target} aria-label={`${n.name}, ${n.years}`}>
                {box}
              </Link>
            ) : (
              <span aria-current={isCurrent ? "true" : undefined}>{box}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

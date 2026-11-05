import type { Metadata } from "next";
import Link from "next/link";
import { ERAS } from "@/content/eras";
import { core } from "@/lib/archive/data";
import { eraLeaders } from "@/lib/archive/leaders";
import { Breadcrumbs, Container } from "@/components/ui/primitives";
import { EraBadge } from "@/components/archive/EraBadge";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Eras",
  description: "Formula 1 history in ten eras: regulations, dominant teams and drivers, technical innovation and safety.",
};

export default function ErasPage() {
  const c = core();
  return (
    <Container className="pt-8">
      <AskContext kind="other" suggestions={["Who were the dominant teams of the turbo era?", "What was ground effect and why was it banned?", "How did safety change after 1994?"]} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Eras" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Eras</h1>
      <p className="mt-3 max-w-2xl text-body">Ten chapters of Formula 1, each defined by its rules, its machines and the people who mastered them.</p>

      <ol className="relative mt-10 space-y-4 md:space-y-0">
        {ERAS.map((e, i) => {
          const L = eraLeaders(e.from, e.to ?? c.currentSeason, 1);
          return (
            <li key={e.slug} className="md:grid md:grid-cols-[140px_1fr] md:gap-6">
              <div className="hidden pt-6 text-right md:block">
                <span className="tnum font-serif text-2xl text-ink">{e.from}</span>
              </div>
              <Link href={`/eras/${e.slug}`} className="card card-hover block p-6 md:mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <EraBadge era={e} index={i} link={false} />
                  <span className="tnum text-xs text-muted-strong">
                    {e.from}–{e.to ?? "present"}
                  </span>
                </div>
                <p className="mt-3 font-serif text-3xl leading-tight text-ink">{e.name}</p>
                <p className="mt-2 text-body">{e.tagline}</p>
                {L.teams[0] && (
                  <p className="mt-4 text-sm text-muted-strong">
                    Most wins: <span className="text-ink">{L.teams[0].name}</span> ({L.teams[0].wins}) · <span className="text-ink">{L.drivers[0].name}</span> ({L.drivers[0].wins})
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}

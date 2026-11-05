import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ERAS, eraBySlug } from "@/content/eras";
import { core } from "@/lib/archive/data";
import { entity } from "@/lib/archive/entities";
import { eraLeaders } from "@/lib/archive/leaders";
import { TEAM_PROFILES } from "@/content/teams";
import { Breadcrumbs, Container, Section, SourceNote } from "@/components/ui/primitives";
import { EraBadge } from "@/components/archive/EraBadge";
import { EntityLink } from "@/components/archive/EntityLink";
import { Prose, RichText } from "@/components/archive/RichText";
import { AskContext, AskPrompts } from "@/components/layout/AskContext";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ERAS.map((e) => ({ slug: e.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = eraBySlug((await params).slug);
  return e ? { title: `${e.name} (${e.from}–${e.to ?? "present"})`, description: e.tagline } : {};
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 text-[15px] text-body">
      {items.map((x) => (
        <li key={x} className="flex gap-2.5">
          <span className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>
            <RichText text={x} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function EraPage({ params }: Props) {
  const e = eraBySlug((await params).slug);
  if (!e) notFound();
  const c = core();
  const i = ERAS.indexOf(e);
  const to = e.to ?? c.currentSeason;
  const L = eraLeaders(e.from, to, 6);
  const seasons = c.seasons.filter((s) => s.year >= e.from && s.year <= to);
  const prev = ERAS[i - 1];
  const next = ERAS[i + 1];
  const maxWins = Math.max(1, ...L.teams.map((t) => t.wins));

  return (
    <>
      <AskContext
        kind="era"
        id={e.slug}
        label={`the ${e.name}`}
        suggestions={[`Who were the dominant teams of the ${e.name.toLowerCase()}?`, `What were the key technical innovations of the ${e.name.toLowerCase()}?`, `How did safety change during the ${e.name.toLowerCase()}?`]}
      />
      <div className="hero-wash border-b border-line/60">
        <Container className="pb-12 pt-8">
          <Breadcrumbs items={[{ label: "Eras", href: "/eras" }, { label: e.name }]} />
          <EraBadge era={e} index={i} link={false} />
          <h1 className="mt-4 font-serif text-6xl leading-none tracking-tight sm:text-7xl">{e.name}</h1>
          <p className="tnum mt-3 text-lg text-muted-strong">
            {e.from}–{e.to ?? "present"}
          </p>
          <p className="mt-4 max-w-2xl font-serif text-2xl leading-snug text-ink">{e.tagline}</p>
        </Container>
      </div>
      <Container>
        <Section title="Overview" serif>
          <Prose paragraphs={e.intro} />
        </Section>

        <div className="grid gap-x-10 md:grid-cols-2">
          <Section title="Dominant teams" kicker={`By race wins, ${e.from}–${to}`}>
            <ol className="card space-y-3 p-5">
              {L.teams.map((t) => {
                const p = TEAM_PROFILES.find((x) => x.key === t.teamKey);
                return (
                  <li key={t.id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <EntityLink entity={entity.team(t.teamKey ?? t.constructorId)} />
                      <span className="tnum text-ink">{t.wins}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-surface-2">
                      <div className="h-full rounded-full" style={{ width: `${(t.wins / maxWins) * 100}%`, background: p?.color ?? "var(--muted)" }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>
          <Section title="Dominant drivers" kicker="By race wins">
            <ol className="card divide-y divide-line">
              {L.drivers.map((d, n) => (
                <li key={d.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="tnum w-4 text-muted-strong">{n + 1}</span>
                    <EntityLink entity={entity.driver(d.id)} />
                  </span>
                  <span className="tnum text-ink">{d.wins} wins</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="grid gap-x-10 md:grid-cols-3">
          <Section title="Regulations">
            <Bullets items={e.regulations} />
          </Section>
          <Section title="Technical innovations">
            <Bullets items={e.innovations} />
          </Section>
          <Section title="Safety">
            <Bullets items={e.safety} />
          </Section>
        </div>

        <Section title="Seasons in this era" kicker={`${seasons.length} seasons`}>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {seasons.map((s) => (
              <li key={s.year}>
                <Link href={`/seasons/${s.year}`} className="card card-hover block px-4 py-3">
                  <span className="tnum font-serif text-2xl text-ink">{s.year}</span>
                  <span className="block truncate text-xs text-muted-strong">{s.driverChampion ? c.drivers[s.driverChampion.driverId].name : s.status === "complete" ? "—" : "In progress"}</span>
                </Link>
              </li>
            ))}
          </ul>
          <SourceNote source={e.source} lastReviewed={e.lastReviewed} />
        </Section>

        <Section title="Ask about this era" kicker="AI">
          <AskPrompts prompts={[`Who were the dominant teams of the ${e.name.toLowerCase()}?`, `Explain the ${e.name.toLowerCase()} in 30 seconds`]} />
        </Section>

        <nav aria-label="Era navigation" className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6 text-sm">
          {prev ? (
            <Link href={`/eras/${prev.slug}`} className="flex items-center gap-2 text-body hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/eras/${next.slug}`} className="flex items-center gap-2 text-body hover:text-ink">
              {next.name} <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}

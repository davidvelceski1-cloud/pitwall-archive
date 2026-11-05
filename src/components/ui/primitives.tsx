import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Section({
  title,
  kicker,
  action,
  children,
  className,
  id,
  serif,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  serif?: boolean;
}) {
  return (
    <section id={id} className={cn("mt-14 scroll-mt-24", className)} aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          {kicker && <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-strong">{kicker}</p>}
          <h2 id={id ? `${id}-h` : undefined} className={cn("text-xl font-semibold tracking-tight", serif && "font-serif text-[28px] font-normal")}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Chip({
  active,
  href,
  children,
  className,
}: {
  active?: boolean;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
        active ? "border-ink bg-ink text-[var(--bg)]" : "border-line bg-surface text-body hover:border-line-strong hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "archival"; className?: string }) {
  const tones = {
    neutral: "border-line bg-surface-2 text-body",
    accent: "border-accent/25 bg-accent-soft text-accent-ink",
    archival: "border-amber-700/20 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  };
  return <span className={cn("inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-strong">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-muted" aria-hidden />}
            {it.href ? (
              <Link href={it.href} className="hover:text-ink">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Clearly labels machine-generated content. */
export function AiLabel({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-800 dark:text-violet-200", className)}>
      <Sparkles className="size-3" strokeWidth={1.75} aria-hidden /> AI-generated
    </span>
  );
}

export function EmptyState({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-body">{children}</div>}
    </div>
  );
}

export function SourceNote({ source, lastReviewed }: { source: string; lastReviewed: string }) {
  return (
    <p className="mt-4 text-xs text-muted-strong">
      Source: {source} · Last reviewed {new Date(lastReviewed).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
    </p>
  );
}

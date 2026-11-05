import type { ReactNode } from "react";
import { cn, fmtNum } from "@/lib/utils";

/** A single headline statistic. `hint` explains coverage caveats (shown as a tooltip and to screen readers). */
export function StatCard({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: number | string | undefined | null;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  const display = typeof value === "number" ? fmtNum(value) : (value ?? "—");
  return (
    <div className={cn("card px-4 py-3.5", className)} title={hint}>
      <dt className="text-xs text-muted-strong">
        {label}
        {hint && <span className="sr-only"> ({hint})</span>}
        {hint && (
          <span aria-hidden className="ml-1 text-muted">
            *
          </span>
        )}
      </dt>
      <dd className={cn("tnum mt-1 text-2xl font-semibold tracking-tight", accent ? "text-accent-ink" : "text-ink")}>{display}</dd>
    </div>
  );
}

export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>{children}</dl>;
}

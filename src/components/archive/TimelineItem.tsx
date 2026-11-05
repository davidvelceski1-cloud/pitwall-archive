import type { ReactNode } from "react";
import { AlertTriangle, Flag, Gavel, Sparkles, Trophy, UserMinus, UserPlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND: Record<string, { icon: LucideIcon; label: string }> = {
  debut: { icon: UserPlus, label: "Debut" },
  retirement: { icon: UserMinus, label: "Farewell" },
  crash: { icon: AlertTriangle, label: "Accident" },
  controversy: { icon: Gavel, label: "Controversy" },
  rules: { icon: Flag, label: "Rules" },
  milestone: { icon: Sparkles, label: "Milestone" },
  title: { icon: Trophy, label: "Title" },
};

/** One event on a vertical timeline. */
export function TimelineItem({
  date,
  kind,
  title,
  children,
  last,
}: {
  date: ReactNode;
  kind: keyof typeof KIND | string;
  title: ReactNode;
  children?: ReactNode;
  last?: boolean;
}) {
  const k = KIND[kind] ?? KIND.milestone;
  const Icon = k.icon;
  return (
    <li className="relative flex gap-4 pb-7 last:pb-0">
      {!last && <span aria-hidden className="absolute left-[15px] top-8 bottom-0 w-px bg-line" />}
      <span
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface",
          kind === "title" && "border-accent/30 bg-accent-soft text-accent-ink",
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-xs text-muted-strong">
          <span className="tnum">{date}</span> · {k.label}
        </p>
        <p className="mt-0.5 font-medium text-ink">{title}</p>
        {children && <div className="mt-1 text-sm text-body">{children}</div>}
      </div>
    </li>
  );
}

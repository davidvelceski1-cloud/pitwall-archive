import Link from "next/link";
import type { Era } from "@/content/types";
import { cn } from "@/lib/utils";

/** Soft tinted pill naming an era; hue steps around the wheel so adjacent eras differ. */
const HUES = [12, 32, 160, 350, 210, 260, 190, 140, 280, 0];

export function EraBadge({ era, index, link = true, className }: { era: Era; index: number; link?: boolean; className?: string }) {
  const hue = HUES[index % HUES.length];
  const style = {
    background: `hsl(${hue} 80% 50% / 0.09)`,
    color: `hsl(${hue} 55% 32%)`,
    borderColor: `hsl(${hue} 60% 50% / 0.2)`,
  };
  const body = (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium dark:!text-[var(--ink)]", className)}
      style={style}
    >
      <span className="size-1.5 rounded-full" style={{ background: `hsl(${hue} 65% 48%)` }} aria-hidden />
      {era.name}
    </span>
  );
  return link ? (
    <Link href={`/eras/${era.slug}`} className="rounded-full">
      {body}
    </Link>
  ) : (
    body
  );
}

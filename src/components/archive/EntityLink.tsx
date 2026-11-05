import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityRef } from "@/lib/archive/entities";
import { cn } from "@/lib/utils";
import { HoverPreview } from "./HoverPreview";

/**
 * A link to any archive entity, with a hover preview card. Takes a resolved EntityRef
 * (built server-side with `entity.*`) so it works in server and client components alike.
 */
export function EntityLink({
  entity,
  children,
  className,
  preview = true,
}: {
  entity: EntityRef;
  children?: ReactNode;
  className?: string;
  preview?: boolean;
}) {
  const link = (
    <Link
      href={entity.href}
      className={cn(
        "text-ink underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent",
        className,
      )}
    >
      {children ?? entity.label}
    </Link>
  );
  return preview ? (
    <HoverPreview kind={entity.kind} id={entity.id}>
      {link}
    </HoverPreview>
  ) : (
    link
  );
}

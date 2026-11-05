import { Fragment } from "react";
import { resolveToken } from "@/lib/archive/entities";
import { EntityLink } from "./EntityLink";

const TOKEN = /\[\[([a-z]:[^|\]]+)(?:\|([^\]]+))?\]\]/g;

/** Renders editorial prose, turning [[d:senna]]-style tokens into entity links. */
export function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    parts.push(text.slice(last, m.index));
    const ref = resolveToken(m[1], m[2]);
    parts.push(ref ? <EntityLink key={m.index} entity={ref} /> : (m[2] ?? m[1].split(":")[1]));
    last = m.index! + m[0].length;
  }
  parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}

export function Prose({ paragraphs, className }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`prose-archive max-w-[68ch] text-[15.5px] text-body ${className ?? ""}`}>
      {paragraphs.map((p, i) => (
        <p key={i}>
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}

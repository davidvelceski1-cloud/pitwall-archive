import Link from "next/link";
import { core } from "@/lib/archive/data";
import { fmtDate } from "@/lib/utils";

export function SiteFooter() {
  const c = core();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div>
          <p className="font-medium text-ink">Pitwall Archive</p>
          <p className="mt-2 max-w-sm text-body">
            An independent encyclopedia of the Formula 1 World Championship. Not affiliated with Formula 1, the FIA or any team.
          </p>
          <p className="mt-3 text-xs text-muted-strong">
            Results data:{" "}
            <a className="underline underline-offset-2 hover:text-ink" href="https://github.com/jolpica/jolpica-f1" rel="noreferrer">
              Jolpica-F1
            </a>{" "}
            (Ergast-compatible). Last updated {fmtDate(c.generatedAt.slice(0, 10))}.
          </p>
        </div>
        <nav aria-label="Archive">
          <p className="mb-2 font-medium text-ink">Archive</p>
          <ul className="space-y-1.5 text-body">
            {[
              ["/seasons", "Seasons"],
              ["/teams", "Teams"],
              ["/drivers", "Drivers"],
              ["/circuits", "Circuits"],
              ["/eras", "Eras"],
            ].map(([h, l]) => (
              <li key={h}>
                <Link href={h} className="hover:text-ink">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tools">
          <p className="mb-2 font-medium text-ink">Tools</p>
          <ul className="space-y-1.5 text-body">
            {[
              ["/ask", "Ask the Archive"],
              ["/search", "Smart search"],
              ["/compare", "Compare"],
            ].map(([h, l]) => (
              <li key={h}>
                <Link href={h} className="hover:text-ink">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

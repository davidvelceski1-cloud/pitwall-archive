import Link from "next/link";
import { Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="tnum font-serif text-7xl text-ink">404</p>
      <h1 className="mt-4 text-xl font-semibold">This page isn't in the archive</h1>
      <p className="mx-auto mt-2 max-w-md text-body">
        The season, team or driver you're looking for may be spelled differently, or isn't covered yet. Press ⌘K to search, or start from one of the indexes.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
        {[
          ["/seasons", "Seasons"],
          ["/teams", "Teams"],
          ["/drivers", "Drivers"],
          ["/circuits", "Circuits"],
        ].map(([h, l]) => (
          <Link key={h} href={h} className="rounded-full border border-line bg-surface px-4 py-1.5 text-body hover:text-ink">
            {l}
          </Link>
        ))}
      </div>
    </Container>
  );
}

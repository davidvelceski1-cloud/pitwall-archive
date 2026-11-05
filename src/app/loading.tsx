import { Container } from "@/components/ui/primitives";

/** Skeleton shown while a page streams in. */
export default function Loading() {
  return (
    <Container className="pt-8" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-6 h-14 w-2/3 max-w-xl" />
      <div className="skeleton mt-4 h-4 w-1/2" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20" />
        ))}
      </div>
      <div className="skeleton mt-10 h-72 w-full" />
    </Container>
  );
}

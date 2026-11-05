"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/primitives";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container className="py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong in the stacks</h1>
      <p className="mx-auto mt-3 max-w-md text-body">This page failed to load. It's probably temporary, so try again. If it keeps happening, the archive data may need rebuilding.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-full bg-ink px-5 py-2 text-sm font-medium text-[var(--bg)]">
        Try again
      </button>
    </Container>
  );
}

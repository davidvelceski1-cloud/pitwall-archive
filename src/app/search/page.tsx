import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs, Container } from "@/components/ui/primitives";
import { SmartSearch } from "@/components/search/SmartSearch";

export const metadata: Metadata = {
  title: "Smart search",
  description: "Search Formula 1 history in plain English and get structured results from the archive.",
};

export default function SearchPage() {
  return (
    <Container className="pt-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Smart search" }]} />
      <h1 className="font-serif text-5xl tracking-tight">Smart search</h1>
      <p className="mt-3 max-w-2xl text-body">Ask for a list in plain English. The archive turns it into a query and answers with records, not prose.</p>
      <div className="mt-8 max-w-4xl">
        <Suspense fallback={<div className="skeleton h-12 w-full rounded-full" />}>
          <SmartSearch />
        </Suspense>
      </div>
    </Container>
  );
}

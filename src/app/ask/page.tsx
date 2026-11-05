import type { Metadata } from "next";
import { Container } from "@/components/ui/primitives";
import { AskChat } from "@/components/ask/AskChat";
import { AskContext } from "@/components/layout/AskContext";

export const metadata: Metadata = {
  title: "Ask the Archive",
  description: "Ask questions about Formula 1 history. Answers are grounded in the archive's records, with sources.",
};

export default function AskPage() {
  return (
    <Container className="pt-10">
      <AskContext
        kind="other"
        suggestions={[
          "Why did Brawn GP only race one season?",
          "Who were the dominant teams of the turbo era?",
          "Compare Senna and Prost at McLaren",
          "Which constructors won the title in their first season?",
          "How was the 2021 championship decided?",
        ]}
      />
      <div className="mx-auto flex h-[calc(100vh-11rem)] min-h-[520px] max-w-3xl flex-col">
        <h1 className="sr-only">Ask the Archive</h1>
        <AskChat variant="page" />
      </div>
    </Container>
  );
}

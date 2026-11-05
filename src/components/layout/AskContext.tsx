"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { askStore, type PageContext } from "@/lib/ask-store";
import { cn } from "@/lib/utils";

/** Rendered by each page to tell the assistant what is being viewed. */
export function AskContext(props: PageContext) {
  const key = JSON.stringify(props);
  useEffect(() => {
    askStore.setContext(JSON.parse(key));
    return () => askStore.setContext({ kind: "other", suggestions: [] });
  }, [key]);
  return null;
}

/** Suggested-prompt chips that open the assistant with a question. */
export function AskPrompts({ prompts, className }: { prompts: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {prompts.map((p) => (
        <li key={p}>
          <button
            type="button"
            onClick={() => askStore.open(p)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-left text-sm text-body transition-colors hover:border-line-strong hover:text-ink"
          >
            <Sparkles className="size-3.5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            {p}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AskButton({ question, children, className }: { question: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => askStore.open(question)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink shadow-card transition-colors hover:border-line-strong",
        className,
      )}
    >
      <Sparkles className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
      {children}
    </button>
  );
}

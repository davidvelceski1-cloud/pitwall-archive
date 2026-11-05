"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowUp, BookOpen, Calendar, Flag, Landmark, MapPin, RotateCcw, Trophy, User } from "lucide-react";
import type { AskEvent, AskSource } from "@/lib/ai/types";
import { askStore, useAsk } from "@/lib/ask-store";
import { AiLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; sources?: AskSource[]; mode?: "ai" | "offline"; error?: string; streaming?: boolean };

const KIND_ICON = { driver: User, team: Flag, season: Calendar, race: Trophy, circuit: MapPin, era: Landmark, records: BookOpen } as const;

const GENERAL = [
  "Why did Brawn GP only race one season?",
  "Who were the dominant teams of the turbo era?",
  "Compare Senna and Prost at McLaren",
  "Which drivers won their first ever championship race?",
];

/** Citation chips for the sources an answer actually cited (all retrieved sources if none were). */
function SourceChips({ sources, text }: { sources: AskSource[]; text: string }) {
  const cited = new Set([...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const shown = cited.size ? sources.filter((s) => cited.has(s.n)) : sources.slice(0, 4);
  if (!shown.length) return null;
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-strong">Sources in the archive</p>
      <ul className="flex flex-wrap gap-1.5">
        {shown.map((s) => {
          const Icon = KIND_ICON[s.kind as keyof typeof KIND_ICON] ?? BookOpen;
          return (
            <li key={s.n}>
              <Link
                href={s.href}
                onClick={() => askStore.close()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-body transition-colors hover:border-line-strong hover:text-ink"
              >
                <span className="tnum text-muted-strong">{s.n}</span>
                <Icon className="size-3" strokeWidth={1.5} aria-hidden />
                {s.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Answer({ msg }: { msg: Msg }) {
  const byN = new Map((msg.sources ?? []).map((s) => [s.n, s]));
  // Turn [n] citations into links the markdown renderer can style.
  const md = msg.content.replace(/\[(\d+)\]/g, (m, n) => (byN.has(Number(n)) ? `[${n}](cite:${n})` : m));
  return (
    <div>
      <div className="prose-archive text-[15px] leading-relaxed text-body [&_li]:mt-1 [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-ink [&_table]:mt-3 [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:border-line [&_td]:py-1 [&_th]:border-b [&_th]:border-line [&_th]:py-1 [&_th]:text-left [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={(url) => url}
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith("cite:")) {
                const s = byN.get(Number(href.slice(5)));
                return s ? (
                  <Link
                    href={s.href}
                    onClick={() => askStore.close()}
                    title={s.title}
                    className="tnum mx-0.5 inline-flex h-4 min-w-4 -translate-y-0.5 items-center justify-center rounded-full bg-surface-2 px-1 align-middle text-[10px] font-medium text-ink no-underline ring-1 ring-line hover:ring-accent"
                  >
                    {children}
                  </Link>
                ) : (
                  <>{children}</>
                );
              }
              return href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} rel="noreferrer">{children}</a>;
            },
          }}
        >
          {md}
        </ReactMarkdown>
        {msg.streaming && <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-accent/60 align-middle" aria-hidden />}
      </div>
      {msg.error && <p className="mt-2 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent-ink">{msg.error}</p>}
      {!msg.streaming && msg.sources && <SourceChips sources={msg.sources} text={msg.content} />}
    </div>
  );
}

// The panel unmounts when closed; keep its conversation for the session.
let panelHistory: Msg[] = [];

export function AskChat({ variant = "panel" }: { variant?: "panel" | "page" }) {
  const { context, open } = useAsk();
  const [messages, setMessages] = useState<Msg[]>(() => (variant === "panel" ? panelHistory : []));
  useEffect(() => {
    if (variant === "panel") panelHistory = messages.filter((m) => !m.streaming);
  }, [messages, variant]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setBusy(true);
      setInput("");
      const history = messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content.replace(/\[\d+\]/g, "") }));
      setMessages((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "", streaming: true }]);
      const patch = (fn: (m: Msg) => Msg) => setMessages((all) => [...all.slice(0, -1), fn(all[all.length - 1])]);

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q,
            history: history.slice(-10),
            context: context.id ? { kind: context.kind, id: context.id, label: context.label } : undefined,
          }),
        });
        if (!res.ok || !res.body) throw new Error();
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const e = JSON.parse(line) as AskEvent;
            if (e.type === "sources") patch((m) => ({ ...m, sources: e.sources }));
            else if (e.type === "text") patch((m) => ({ ...m, content: m.content + e.delta }));
            else if (e.type === "done") patch((m) => ({ ...m, mode: e.mode }));
            else if (e.type === "error") patch((m) => ({ ...m, error: e.message }));
          }
        }
      } catch {
        patch((m) => ({ ...m, error: "Couldn't reach the archive. Check your connection and try again." }));
      } finally {
        patch((m) => ({ ...m, streaming: false }));
        setBusy(false);
      }
    },
    [busy, messages, context],
  );

  // Questions queued by suggested-prompt chips elsewhere on the page.
  useEffect(() => {
    if (variant === "panel" && !open) return;
    const pending = askStore.consumePending();
    if (pending) ask(pending);
    else inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variant]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const suggestions = context.suggestions.length ? context.suggestions : GENERAL;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("min-h-0 flex-1 overflow-y-auto", variant === "panel" ? "px-5 py-4" : "py-2")} aria-live="polite">
        {messages.length === 0 ? (
          <div className="rise">
            <p className="font-serif text-2xl text-ink">What would you like to know?</p>
            <p className="mt-1 text-sm text-body">
              Answers come only from the archive's own records and pages, with sources.
              {context.label && (
                <>
                  {" "}
                  You're viewing <span className="font-medium text-ink">{context.label}</span>, so you can ask about it directly.
                </>
              )}
            </p>
            <ul className="mt-5 space-y-2">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => ask(s)}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-sm text-body transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="space-y-6">
            {messages.map((m, i) => (
              <li key={i} className="rise">
                {m.role === "user" ? (
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-sm text-[var(--bg)]">{m.content}</p>
                ) : (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      {m.mode === "offline" ? (
                        <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-body">Archive excerpts</span>
                      ) : (
                        <AiLabel />
                      )}
                    </div>
                    {m.content || m.error ? (
                      <Answer msg={m} />
                    ) : (
                      <div className="space-y-2" aria-label="Loading answer">
                        <div className="skeleton h-3.5 w-11/12" />
                        <div className="skeleton h-3.5 w-4/5" />
                        <div className="skeleton h-3.5 w-2/3" />
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className={cn("border-t border-line", variant === "panel" ? "px-4 py-3" : "pt-4")}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface p-1.5 pl-3.5 shadow-card focus-within:border-ink/40">
          <label htmlFor={`ask-${variant}`} className="sr-only">
            Ask the Archive
          </label>
          <textarea
            id={`ask-${variant}`}
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder={context.label ? `Ask about ${context.label}…` : "Ask about any season, team or driver…"}
            className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted-strong"
          />
          {messages.length > 0 && !busy && (
            <button type="button" onClick={() => setMessages([])} className="rounded-full p-2 text-muted-strong hover:text-ink" aria-label="Start a new conversation">
              <RotateCcw className="size-4" strokeWidth={1.5} />
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-accent p-2 text-white transition-opacity disabled:opacity-40"
            aria-label="Send question"
          >
            <ArrowUp className="size-4" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-strong">Answers are AI-generated from archive records and may contain mistakes. Check the cited pages.</p>
      </form>
    </div>
  );
}

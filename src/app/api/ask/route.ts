/**
 * POST /api/ask — "Ask the Archive". Streams newline-delimited JSON (AskEvent).
 *
 * Flow: retrieve passages (BM25 over the archive, plus the page being viewed) → send the
 * numbered sources to the client → stream Claude's answer, which cites passages as [n].
 * Without credentials, answers in offline mode from the passages themselves.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { retrieve, tokenize } from "@/lib/ai/retrieval";
import { MODEL, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import type { AskEvent, AskSource } from "@/lib/ai/types";
import type { Doc } from "@/lib/ai/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  question: z.string().trim().min(1).max(1_000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(12_000) })).max(20),
  context: z
    .object({ kind: z.string().max(20), id: z.string().max(80).optional(), label: z.string().max(120).optional() })
    .optional(),
});

const hasCredentials = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

function contextDocId(ctx?: { kind: string; id?: string }) {
  if (!ctx?.id) return undefined;
  return ["driver", "team", "season", "race", "circuit", "era"].includes(ctx.kind) ? `${ctx.kind}:${ctx.id}` : undefined;
}

function userTurn(question: string, docs: Doc[], ctx?: { kind: string; label?: string }) {
  const passages = docs.map((d, i) => `<passage n="${i + 1}" title="${d.title}" page="${d.href}">\n${d.text}\n</passage>`).join("\n");
  const page = ctx?.label ? `The reader is viewing the ${ctx.kind} page for: ${ctx.label}.` : "The reader is browsing the archive.";
  return `<archive_passages>\n${passages}\n</archive_passages>\n\n<page_context>${page}</page_context>\n\n<question>${question}</question>`;
}

/** The best-matching line of each top passage, cited — used when no model is available. */
function offlineAnswer(question: string, docs: Doc[]) {
  if (!docs.length) return "The archive has no pages matching that question yet. Try naming a season, team, driver or circuit.";
  const q = new Set(tokenize(question).map((t) => t.replace(/s$/, "")));
  const picks = docs
    .map((d, i) => {
      const scored = d.text
        .split("\n")
        .map((line) => ({ line, score: tokenize(line).filter((t) => q.has(t.replace(/s$/, ""))).length }))
        .sort((a, b) => b.score - a.score);
      const best = scored[0];
      const line = best.line.length > 420 ? `${best.line.slice(0, 420).replace(/[;,][^;,]*$/, "")}…` : best.line;
      return { d, n: i + 1, line, score: best.score };
    })
    .filter((p, i) => i === 0 || p.score > 0)
    .slice(0, 3);
  const lines = picks.map((p) => `- **${p.d.title}**: ${p.line.trim()} [${p.n}]`);
  return `Written answers are switched off on this deployment (no AI key is configured), so here are the archive passages that best match your question:\n\n${lines.join("\n")}`;
}

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { question, history, context } = parsed.data;

  // Include the previous question so follow-ups ("and his teammates?") still retrieve well.
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const docs = retrieve(`${question} ${lastUser}`, contextDocId(context));
  const sources: AskSource[] = docs.map((d, i) => ({ n: i + 1, id: d.id, kind: d.kind, title: d.title, href: d.href }));
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: AskEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      emit({ type: "sources", sources });

      if (!hasCredentials()) {
        emit({ type: "text", delta: offlineAnswer(question, docs) });
        emit({ type: "done", mode: "offline" });
        controller.close();
        return;
      }

      try {
        const client = new Anthropic();
        const s = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 16_000,
          system: SYSTEM_PROMPT,
          // Earlier turns are replayed as plain text; this turn carries fresh passages.
          messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: userTurn(question, docs, context) }],
          output_config: { effort: "low" },
          cache_control: { type: "ephemeral" },
          // On a safety-classifier refusal, re-run on Anthropic's recommended fallback model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        s.on("text", (delta) => emit({ type: "text", delta }));
        const message = await s.finalMessage();
        if (message.stop_reason === "refusal") emit({ type: "text", delta: "\n\nI can't help with that one, but ask me anything about Formula 1 history." });
        emit({ type: "done", mode: "ai" });
      } catch (err) {
        if (err instanceof Anthropic.AuthenticationError) {
          emit({ type: "text", delta: offlineAnswer(question, docs) });
          emit({ type: "done", mode: "offline" });
        } else if (err instanceof Anthropic.RateLimitError) {
          emit({ type: "error", message: "The archivist is busy right now. Please try again in a moment." });
        } else if (err instanceof Anthropic.APIError) {
          console.error("Claude API error", err.status, err.message);
          emit({ type: "error", message: "Something went wrong reaching the archivist. Please try again." });
        } else {
          console.error(err);
          emit({ type: "error", message: "Something went wrong. Please try again." });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}

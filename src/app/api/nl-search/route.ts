/**
 * POST /api/nl-search — natural-language search returning structured results.
 * Claude only classifies the question into a fixed query shape (structured output);
 * the archive executes it, so every row comes from the data.
 */
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { MODEL } from "@/lib/ai/prompt";
import { ERAS } from "@/content/eras";
import { ParsedQuery, QUERY_KINDS, execute, parseWithRules } from "@/lib/search/nl";
import { core } from "@/lib/archive/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ q: z.string().trim().min(2).max(300) });

const nullable = (type: "string" | "integer", description: string) => ({ type: [type, "null"], description });

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "driver", "team", "circuit", "nationality", "from_year", "to_year"],
  properties: {
    kind: {
      type: "string",
      enum: [...QUERY_KINDS],
      description:
        "race_winners: list race wins filtered by driver/team/circuit/nationality/years. champions: drivers' champions. won_on_debut: drivers who won their first championship race. title_in_first_season: constructors that won the constructors' title in their first season. won_from_pole: wins from pole position. drivers: race-winning drivers filtered by nationality/team/years. unsupported: anything else.",
    },
    driver: nullable("string", "Driver name as written, e.g. 'Senna'. null if none."),
    team: nullable("string", "Team/constructor name, e.g. 'McLaren'. null if none."),
    circuit: nullable("string", "Circuit, town or Grand Prix name, e.g. 'Monaco', 'Spa', 'Italian'. null if none."),
    nationality: nullable("string", "Demonym like 'British', 'Brazilian'. null if none."),
    from_year: nullable("integer", "First season in range, inclusive. Decades: '1980s' → 1980."),
    to_year: nullable("integer", "Last season in range, inclusive. Decades: '1980s' → 1989."),
  },
} as const;

async function parseWithClaude(q: string): Promise<ParsedQuery | null> {
  const client = new Anthropic();
  const c = core();
  const eras = ERAS.map((e) => `${e.name}: ${e.from}–${e.to ?? c.currentSeason}`).join("; ");
  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `Map a reader's search about Formula 1 history onto one structured query. Only fill fields the reader actually asked for; never guess names they did not mention. Era name → year range: ${eras}. The current season is ${c.currentSeason}.`,
    messages: [{ role: "user", content: q }],
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA as unknown as Record<string, unknown> } },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  if (res.stop_reason === "refusal") return null;
  const text = res.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;
  const parsed = ParsedQuery.safeParse(JSON.parse(text.text));
  return parsed.success ? parsed.data : null;
}

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Enter a question of at least two characters." }, { status: 400 });
  const { q } = body.data;

  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
    try {
      const parsed = await parseWithClaude(q);
      if (parsed) return Response.json(execute(parsed, "ai"));
    } catch (err) {
      if (!(err instanceof Anthropic.APIError || err instanceof SyntaxError)) throw err;
      console.error("nl-search: falling back to rules", err instanceof Anthropic.APIError ? err.status : err.message);
    }
  }
  return Response.json(execute(parseWithRules(q), "rules"));
}

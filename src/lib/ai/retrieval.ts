import "server-only";
import { getCorpus, type Doc } from "./documents";

/**
 * Lexical retrieval (BM25) over the archive corpus. Runs in-process with no external
 * services. prisma/schema.prisma includes an `ArchiveChunk` table with a pgvector column
 * for swapping in embedding search (see README → Retrieval).
 */
const STOP = new Set(
  "a an the of and or in on at to for with by from is was were be been are did does do how why what who whom which when where than then that this these those he she him his her hers they them their its it i me my you your we our as into about vs versus compare f1 formula one grand prix gp season team driver drivers teams".split(
    " ",
  ),
);

export const tokenize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));

type Index = { docs: Doc[]; tf: Map<string, number>[]; len: number[]; df: Map<string, number>; avg: number };
let index: Index | null = null;

function build(): Index {
  const docs = getCorpus();
  const tf: Map<string, number>[] = [];
  const len: number[] = [];
  const df = new Map<string, number>();
  for (const d of docs) {
    // Titles count three times so "Senna" finds Senna's page before races he merely entered.
    const toks = [...tokenize(d.title), ...tokenize(d.title), ...tokenize(d.title), ...tokenize(d.text)];
    const m = new Map<string, number>();
    for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    tf.push(m);
    len.push(toks.length);
  }
  return { docs, tf, len, df, avg: len.reduce((a, b) => a + b, 0) / Math.max(1, len.length) };
}

const KIND_PRIOR: Record<string, number> = { driver: 1.25, team: 1.25, season: 1.2, era: 1.2, records: 1.3, circuit: 1.1, race: 1 };

export function retrieve(query: string, contextDocId?: string, k = 8): Doc[] {
  index ??= build();
  const { docs, tf, len, df, avg } = index;
  const q = [...new Set(tokenize(query))];
  const N = docs.length;
  const k1 = 1.2;
  const b = 0.75;
  const scored: { i: number; s: number }[] = [];
  for (let i = 0; i < N; i++) {
    let s = 0;
    for (const t of q) {
      const f = tf[i].get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - df.get(t)! + 0.5) / (df.get(t)! + 0.5));
      s += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * len[i]) / avg)));
    }
    if (s > 0) scored.push({ i, s: s * (KIND_PRIOR[docs[i].kind] ?? 1) });
  }
  scored.sort((a, b) => b.s - a.s);
  const out: Doc[] = [];
  const ctx = contextDocId ? docs.find((d) => d.id === contextDocId) : undefined;
  if (ctx) out.push(ctx);
  for (const { i } of scored) {
    if (out.length >= k) break;
    if (docs[i] !== ctx) out.push(docs[i]);
  }
  return out;
}

export function docById(id: string) {
  index ??= build();
  return index.docs.find((d) => d.id === id);
}

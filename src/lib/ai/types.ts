export type AskSource = { n: number; id: string; kind: string; title: string; href: string };

export type AskEvent =
  | { type: "sources"; sources: AskSource[] }
  | { type: "text"; delta: string }
  | { type: "done"; mode: "ai" | "offline" }
  | { type: "error"; message: string };

export type AskRequest = {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  context?: { kind: string; id?: string; label?: string };
};

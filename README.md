# Pitwall Archive

An encyclopedia of the Formula 1 World Championship from 1950 to today. You can browse it season by season, team by team (defunct teams included) and driver by driver. It also has an AI assistant that answers questions from the archive's own records and cites its sources.

Built with Next.js (App Router) · TypeScript · Tailwind CSS 4 · Radix primitives · Recharts · Claude (`claude-opus-5-5`) · PostgreSQL/Prisma (optional).

## Quick start

```bash
npm install
npm run data:fetch     # downloads Jolpica-F1 data into data/raw (cached; ~550 requests, rate-limited)
npm run data:build     # builds data/generated/*.json
cp .env.example .env.local   # optionally add ANTHROPIC_API_KEY
npm run dev
```

The site reads `data/generated/` directly, so **no database is needed to run it**. Commit `data/generated/` so deployments build without hitting the API. `data/raw/` is a cache and stays out of git.

A cold `data:fetch` takes a while because Jolpica allows about 500 requests an hour. The script caches every response and waits when it is throttled, so you can stop it and run it again at any time.

### Optional: PostgreSQL

```bash
# DATABASE_URL in .env; requires the pgvector extension to be available
npm run db:push    # create tables from prisma/schema.prisma
npm run db:seed    # load data/generated + editorial content
```

## What's in the archive

| Coverage | What you get |
|---|---|
| **Every season (1950 to the current season)** | Calendar, winner, pole and fastest lap (fastest-lap data from 2004) for every race, plus final drivers' and constructors' standings |
| **Featured seasons** (1976, 1988, 2009, 2021) and the current season | Full race classifications, qualifying (1994+), points progression, and for featured seasons an editorial story, regulation changes and a moments timeline |
| **Profiled drivers** (13: Fangio, Clark, Stewart, Lauda, Hunt, Prost, Senna, Mansell, M. Schumacher, Alonso, Button, Hamilton, Verstappen) | Every race result, results heatmap, teammate head-to-heads, biography, key races, computed records |
| **Profiled teams** (active: Ferrari, McLaren, Mercedes, Red Bull, Williams; defunct: Brabham, Lotus, Tyrrell, Jordan, Brawn GP) | Every entry, history chapters by era, lineage, notable cars, season-by-season table, championship-position chart |
| **Every other driver and constructor** | A summary page with wins, poles and titles (all complete), plus season-by-season championship finishes |
| **Circuits** | World map of all venues. Every circuit's race history, top drivers and teams. 8 profiled circuits add a schematic outline, layout changes and the fastest race lap on the current layout |
| **Eras** | Ten editorial era pages with regulations, innovations and safety, plus dominant teams and drivers computed from results |

### Data sources and caveats

- **Results and standings:** [Jolpica-F1](https://github.com/jolpica/jolpica-f1), the Ergast-compatible API. All statistics are computed from it and never written by hand.
- **Pole positions** come from qualifying data where it exists (mostly 1994 onwards) and from grid P1 otherwise. Pages say so where it matters.
- **Fastest laps** in the source begin in 2004.
- **Points** are championship points as counted, so dropped-score rules apply before 1991. The points-progression chart shows Grand Prix points, so it excludes sprint points.
- **Chassis brands:** Jolpica lists some early constructors by engine (for example "Brabham-Repco"). Profiled teams aggregate every variant (see `PROFILED_TEAMS` in `scripts/config.ts`).
- **Williams:** Jolpica files Frank Williams Racing Cars' 1975–76 entries under the same id as today's Williams team. The Williams profile starts at 1978, the first season with its own chassis (`TEAM_FIRST_SEASON`).
- **Editorial text** lives in `src/content/` and is separate from the statistics. Each piece carries a `source` and a `lastReviewed` date, which are shown on the page. No official F1, FIA or team logos are used.

## Ask the Archive (AI)

- **Panel and page:** a slide-over on every page (the header button or any suggested-prompt chip) and a full-page view at `/ask`.
- **Retrieval:** `src/lib/ai/documents.ts` turns every page into one passage: each season, race, driver, team, circuit and era, plus an all-time records passage. `src/lib/ai/retrieval.ts` ranks the passages with BM25. The passage for the page you're viewing is always included, so "How did he compare to his teammates?" works on a driver page.
- **Answering:** `POST /api/ask` streams NDJSON. It sends the numbered sources first, then Claude's answer, which cites passages as `[n]`. The UI turns the citations into links and shows chips for the cited pages. The system prompt forbids statistics that aren't in the passages. Every answer is labelled "AI-generated".
- **Offline mode:** without `ANTHROPIC_API_KEY` the assistant still works. It returns the best-matching passages, cited, clearly labelled "Archive excerpts".
- **Smart search** (`/search`, `POST /api/nl-search`): Claude maps the question onto one of a fixed set of structured queries (structured outputs), and the archive executes it. Examples: race winners filtered by driver, team, circuit, nationality or years; champions; wins from pole; drivers who won on debut; teams that won the title in their first season. The rows always come from data. Without a key, a rule-based parser does the mapping.
- **Fallbacks:** requests use server-side refusal fallbacks (`fallbacks: "default"`).

**pgvector:** `ArchiveChunk` in the Prisma schema has a `vector(1024)` column. To switch from BM25 to embeddings: write the corpus from `getCorpus()` into that table with an embedding model of your choice, then replace `retrieve()` with a `ORDER BY embedding <=> $1` query. The rest of the pipeline (sources, citations, prompt) is unchanged.

## Nightly refresh

`.github/workflows/nightly-refresh.yml` runs `npm run data:refresh-current` every night. That command drops the cached responses that change during a season (current-season results and standings, global winner and pole lists, active profiled drivers and teams), re-fetches them and rebuilds. It then commits `data/generated/`, and Vercel redeploys, so historical pages stay fully static and the current season is at most a day old.

## Extending the archive

- **Feature another season:** add the year to `FEATURED_SEASONS` in `scripts/config.ts` and run `data:fetch` + `data:build`. Optionally add a story in `src/content/seasons.ts`.
- **Profile a driver:** add their Jolpica `driverId` to `PROFILED_DRIVERS` and a biography to `src/content/drivers.ts`.
- **Profile a team:** add it to `PROFILED_TEAMS` (list every Jolpica id variant), then add a `TeamProfile` in `src/content/teams.ts` and, if it has a lineage, nodes and edges in `src/content/lineage.ts`.
- **Profile a circuit:** add a `CircuitProfile` in `src/content/circuits.ts`.
- **Link entities in prose:** use tokens in editorial text: `[[d:senna]]`, `[[t:mclaren|McLaren]]`, `[[s:1988]]`, `[[c:monaco|Monaco]]`, `[[e:turbo]]`. They render as links with hover previews.

## Project layout

```
scripts/            fetch-jolpica.ts, build-archive.ts, config.ts
data/generated/     the archive (core.json, seasons/, drivers/, teams/, standings-index.json)
prisma/             schema.prisma, seed.ts
src/content/        editorial: seasons, teams, drivers, eras, circuits, lineage
src/lib/archive/    data access, slugs, stats, previews, teammates, leaders
src/lib/ai/         corpus, BM25 retrieval, system prompt
src/lib/search/     natural-language query parser and executor
src/components/     archive/ (StatCard, StandingsTable, TimelineItem, LineageTree, EntityLink,
                    HoverPreview, EraBadge, RichText), charts/, ask/, layout/, …
src/app/            routes: /, /seasons/[year]/[race], /teams/[slug], /drivers/[slug],
                    /circuits/[slug], /eras/[slug], /compare, /ask, /search, api/*
```

## Design notes

The UI is light-first, with an optional dark mode (toggle in the header, or `?theme=dark|light`). Text is set in Inter, with Instrument Serif for archival headings. All statistics use tabular figures. Cards use 14px radii and soft shadows, and the racing red is kept for actions and highlights. Team pages use the team's historic colour only as an accent bar and a faint tint. Charts follow a validated colourblind-safe palette with legends, direct labels and a table view. Motion is limited to fast fades and lifts and respects `prefers-reduced-motion`. Tables collapse to stacked cards on phones.

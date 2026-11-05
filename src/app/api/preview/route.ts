import { buildPreview } from "@/lib/archive/preview";

/** GET /api/preview?kind=driver&id=senna — mini profile for hover cards. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "";
  const id = searchParams.get("id") ?? "";
  const preview = buildPreview(kind, id);
  if (!preview) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(preview, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}

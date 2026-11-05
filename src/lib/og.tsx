import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared Open Graph card: soft hero wash, archival title, optional team-color bar. */
export function ogCard({ kicker, title, subtitle, stats, accent }: { kicker: string; title: string; subtitle?: string; stats?: [string, string][]; accent?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          background: "#FAFAFB",
          backgroundImage:
            "radial-gradient(60% 80% at 15% 0%, rgba(239,59,54,0.14), transparent 70%), radial-gradient(55% 80% at 95% 0%, rgba(167,139,250,0.18), transparent 70%)",
          fontFamily: "serif",
          borderTop: accent ? `12px solid ${accent}` : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#475569", fontFamily: "sans-serif" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 18, height: 12, borderRadius: 3, background: "#EF3B36", transform: "skewX(-18deg)" }} />
          </div>
          Pitwall Archive · {kicker}
        </div>
        <div style={{ marginTop: "auto", fontSize: title.length > 18 ? 96 : 128, lineHeight: 1, color: "#0F172A", letterSpacing: -2 }}>{title}</div>
        {subtitle && <div style={{ marginTop: 20, fontSize: 34, color: "#475569", fontFamily: "sans-serif" }}>{subtitle}</div>}
        {stats && (
          <div style={{ display: "flex", gap: 56, marginTop: 40, fontFamily: "sans-serif" }}>
            {stats.map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 22, color: "#64748B" }}>{label}</div>
                <div style={{ fontSize: 44, color: "#0F172A", fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    OG_SIZE,
  );
}

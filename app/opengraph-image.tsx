import { ImageResponse } from "next/og";
import { getMatches, getStandings } from "@/lib/data";
import { MEDALS } from "@/lib/constants";

export const alt = "Quiniela Hunters · Mundial 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 9 -> "9", 7.5 -> "7.5" (igual que en app/api/quiniela/route.ts)
function fmtPts(p: number): string {
  return p % 1 === 0 ? String(p) : p.toFixed(1);
}

export default async function OpengraphImage() {
  // Igual que el endpoint del bot: si Supabase falla (o no hay datos aún),
  // se sirve una imagen genérica en vez de romper la generación.
  let jugados = 0;
  let total = 0;
  let top: { name: string; emoji: string; points: number }[] = [];

  try {
    const [standings, matches] = await Promise.all([
      getStandings(),
      getMatches(),
    ]);
    jugados = matches.filter((m) => m.finished).length;
    total = matches.length;
    top = standings.slice(0, 3).map((s) => ({
      name: s.participant.display_name,
      emoji: s.participant.avatar_emoji,
      points: s.points,
    }));
  } catch {
    // Sin datos: se sirve la imagen genérica de abajo.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0a1410",
          color: "#eaf2ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#8aa399", letterSpacing: 2 }}>
            MUNDIAL FIFA 2026 · FASE DE GRUPOS
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 30 }}>⚽</div>
            <div style={{ fontSize: 68, fontWeight: 700 }}>
              Quiniela <span style={{ color: "#f5c542" }}>Hunters</span>
            </div>
          </div>
          <div style={{ fontSize: 30, color: "#34d399", marginTop: 8 }}>
            {total > 0
              ? `${jugados} de ${total} partidos jugados`
              : "La quiniela entre amigos"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {top.length > 0 ? (
            top.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  padding: 24,
                  borderRadius: 24,
                  background: i === 0 ? "rgba(245,197,66,0.12)" : "rgba(255,255,255,0.04)",
                  border:
                    i === 0
                      ? "2px solid rgba(245,197,66,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 34 }}>{MEDALS[i]}</div>
                <div style={{ fontSize: 40, marginTop: 4 }}>{row.emoji}</div>
                <div style={{ fontSize: 24, marginTop: 6 }}>{row.name}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#f5c542", marginTop: 4 }}>
                  {fmtPts(row.points)} pts
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                fontSize: 26,
                color: "#8aa399",
                padding: 24,
              }}
            >
              Tabla de posiciones en vivo
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

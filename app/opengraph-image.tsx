import { ImageResponse } from "next/og";
import { getStandings, getMatches } from "@/lib/data";

export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Quiniela Hunters · Mundial 2026";

export default async function OpengraphImage() {
  let jugados = 0;
  let total = 0;
  let top: { name: string; points: number }[] = [];

  try {
    const [standings, matches] = await Promise.all([getStandings(), getMatches()]);
    jugados = matches.filter((m) => m.finished).length;
    total = matches.length;
    top = standings.slice(0, 3).map((s) => ({
      name: s.participant.display_name,
      points: s.points,
    }));
  } catch {
    // Sin datos (p. ej. build sin credenciales): se renderiza la versión genérica.
  }

  const fmt = (p: number) => (p % 1 === 0 ? String(p) : p.toFixed(1));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#060912",
          backgroundImage:
            "radial-gradient(900px 500px at 12% -8%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(900px 520px at 88% -4%, rgba(24,201,100,0.32), transparent 60%), radial-gradient(800px 600px at 50% 120%, rgba(255,77,77,0.25), transparent 60%)",
          color: "#eaf1ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#93a4c4",
            }}
          >
            Mundial FIFA 2026 · Fase de grupos
          </div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>
            Quiniela Hunters
          </div>
          <div style={{ fontSize: 34, color: "#ffce3a", marginTop: 8 }}>
            {total > 0 ? `${jugados}/${total} partidos jugados` : "La quiniela del Mundial"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {top.length > 0 ? (
            top.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: 28,
                  borderRadius: 24,
                  background: i === 0 ? "rgba(255,206,58,0.14)" : "rgba(255,255,255,0.05)",
                  border:
                    i === 0
                      ? "2px solid rgba(255,206,58,0.5)"
                      : "2px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 30, color: "#93a4c4" }}>{i + 1}º</div>
                <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4 }}>{t.name}</div>
                <div style={{ fontSize: 56, fontWeight: 800, color: "#ffce3a" }}>
                  {fmt(t.points)} pts
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 34, color: "#93a4c4" }}>
              Tabla de posiciones en vivo entre amigos ⚽
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

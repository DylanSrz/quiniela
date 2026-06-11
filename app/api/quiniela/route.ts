import { NextResponse } from "next/server";
import { getMatches, getStandings } from "@/lib/data";

// Endpoint público para bots/integraciones (ej. comando /quiniela de Discord).
// Devuelve la tabla de posiciones en JSON + un texto ya formateado.
export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

// 9 -> "9", 7.5 -> "7.5"
function fmtPts(p: number): string {
  return p % 1 === 0 ? String(p) : p.toFixed(1);
}

export async function GET() {
  try {
    const [standings, matches] = await Promise.all([
      getStandings(),
      getMatches(),
    ]);
    const jugados = matches.filter((m) => m.finished).length;
    const total = matches.length;

    const rows = standings.map((s, i) => ({
      pos: i + 1,
      name: s.participant.display_name,
      emoji: s.participant.avatar_emoji,
      points: s.points,
      exactos: s.exactos,
      resultados: s.resultados,
      jugados: s.jugados,
    }));

    // Texto formateado listo para enviar a Discord (tabla en bloque de código).
    const header = `${"#".padEnd(3)}${"Jugador".padEnd(15)}${"Pts".padStart(
      5
    )} ${"Ex".padStart(3)} ${"Re".padStart(3)}`;
    const body = rows
      .map((r) => {
        const name = r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name;
        return `${String(r.pos).padEnd(3)}${name.padEnd(15)}${fmtPts(
          r.points
        ).padStart(5)} ${String(r.exactos).padStart(3)} ${String(
          r.resultados
        ).padStart(3)}`;
      })
      .join("\n");

    const text =
      `🏆 **Quiniela Hunters** — ${jugados}/${total} partidos jugados\n` +
      "```\n" +
      header +
      "\n" +
      body +
      "\n```";

    return NextResponse.json(
      {
        updated_at: new Date().toISOString(),
        jugados,
        total_partidos: total,
        scoring: { exacto: 3, ganador: 1.5, empate: 1 },
        standings: rows,
        text,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo obtener la tabla", detail: String(err) },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

import type { Participant, Prediction, StandingRow } from "./types";
import { SCORING } from "./constants";

// Calcula la tabla de posiciones a partir de participantes y pronósticos ya puntuados.
// points = null significa partido sin resultado todavía (no cuenta como jugado).
export function computeStandings(
  participants: Participant[],
  predictions: Prediction[]
): StandingRow[] {
  const byParticipant = new Map<number, StandingRow>();
  for (const p of participants) {
    byParticipant.set(p.id, {
      participant: p,
      points: 0,
      exactos: 0,
      resultados: 0,
      jugados: 0,
    });
  }

  for (const pred of predictions) {
    if (pred.points === null || pred.points === undefined) continue;
    const row = byParticipant.get(pred.participant_id);
    if (!row) continue;
    const pts = Number(pred.points);
    row.points += pts;
    row.jugados += 1;
    if (pts === 3) row.exactos += 1;
    else if (pts > 0) row.resultados += 1; // ganador (1.5) o empate (1)
  }

  return [...byParticipant.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.exactos - a.exactos ||
      b.resultados - a.resultados ||
      a.participant.display_name.localeCompare(b.participant.display_name)
  );
}

// Puntos de un pronóstico contra un resultado.
// IMPORTANTE: esta lógica DEBE coincidir con el trigger SQL en Postgres
// (scripts/*.sql) — son dos fuentes de la misma regla. El test en
// standings.test.ts codifica la tabla de puntos como guardia ante divergencias.
// exacto=3, ganador acertado=1.5, empate acertado=1, nada=0.
export function scoreOf(
  predHome: number,
  predAway: number,
  home: number,
  away: number
): number {
  if (predHome === home && predAway === away) return SCORING.exacto;
  if (home === away && predHome === predAway) return SCORING.empate;
  if (home !== away && Math.sign(predHome - predAway) === Math.sign(home - away))
    return SCORING.ganador;
  return 0;
}

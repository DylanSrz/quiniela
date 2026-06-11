import type { Participant, Prediction, StandingRow } from "./types";

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
    row.points += pred.points;
    row.jugados += 1;
    if (pred.points === 3) row.exactos += 1;
    else if (pred.points === 1) row.resultados += 1;
  }

  return [...byParticipant.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.exactos - a.exactos ||
      b.resultados - a.resultados ||
      a.participant.display_name.localeCompare(b.participant.display_name)
  );
}

// Puntos de un pronóstico contra un resultado (misma lógica que el trigger SQL).
export function scoreOf(
  predHome: number,
  predAway: number,
  home: number,
  away: number
): 0 | 1 | 3 {
  if (predHome === home && predAway === away) return 3;
  if (Math.sign(predHome - predAway) === Math.sign(home - away)) return 1;
  return 0;
}

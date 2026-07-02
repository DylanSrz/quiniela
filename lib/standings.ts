import { JORNADAS, type Jornada } from "./constants";
import type { Match, Participant, Prediction, StandingRow } from "./types";

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

// Puntos de un pronóstico contra un resultado (misma lógica que el trigger SQL).
// exacto=3, ganador acertado=1.5, empate acertado=1, nada=0.
export function scoreOf(
  predHome: number,
  predAway: number,
  home: number,
  away: number
): number {
  if (predHome === home && predAway === away) return 3;
  if (home === away && predHome === predAway) return 1;
  if (home !== away && Math.sign(predHome - predAway) === Math.sign(home - away))
    return 1.5;
  return 0;
}

// Cambio de posición de cada participante respecto al cierre de la jornada
// ANTERIOR a la última jornada con resultados. Devuelve id -> delta, donde
// delta = posiciónPrevia - posiciónActual (>0 subió, <0 bajó, 0 igual).
// Map vacío cuando no hay una jornada previa con puntos (p. ej. solo J1 jugada).
export function computePositionDeltas(
  participants: Participant[],
  predictions: Prediction[],
  matches: Match[]
): Map<number, number> {
  const jornadaByMatch = new Map(matches.map((m) => [m.id, m.jornada]));

  const finishedJornadas = matches
    .filter((m) => m.finished)
    .map((m) => m.jornada);
  if (finishedJornadas.length === 0) return new Map();
  const latest = [...finishedJornadas].sort().at(-1)!;

  const before = computeStandings(
    participants,
    predictions.filter((p) => {
      const j = jornadaByMatch.get(p.match_id);
      return j !== undefined && j < latest;
    })
  );

  // Sin jornada previa con puntos → sin referencia (no mostrar flechas).
  if (before.every((r) => r.jugados === 0)) return new Map();

  const prevIndex = new Map(before.map((r, i) => [r.participant.id, i]));
  const now = computeStandings(participants, predictions);

  const deltas = new Map<number, number>();
  now.forEach((r, i) => {
    const prev = prevIndex.get(r.participant.id);
    if (prev !== undefined) deltas.set(r.participant.id, prev - i);
  });
  return deltas;
}

// Jornada "activa": la primera con partidos sin terminar (la que se está
// jugando o está por jugarse). Si todo terminó, la última. Sirve como pestaña
// por defecto en /partidos y /admin/resultados.
export function currentJornada(matches: Match[]): Jornada {
  if (matches.length === 0) return JORNADAS[0];
  for (const j of JORNADAS) {
    if (matches.some((m) => m.jornada === j && !m.finished)) return j;
  }
  return JORNADAS[JORNADAS.length - 1];
}

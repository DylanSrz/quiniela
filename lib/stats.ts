import { computeStandings } from "./standings";
import { fmtPts } from "./format";
import type { Match, Participant, Prediction } from "./types";

// Estadísticas curiosas de la quiniela. Cada función es pura y devuelve null
// cuando aún no hay datos suficientes (la página omite esa tarjeta).

export type StatEntry = { participant: Participant; label?: string };
export type Stat = { entries: StatEntry[]; value: string };

function byId(participants: Participant[]): Map<number, Participant> {
  return new Map(participants.map((p) => [p.id, p]));
}

function toEntries(
  participants: Participant[],
  ids: number[],
  labelOf?: (id: number) => string | undefined
): StatEntry[] {
  const map = byId(participants);
  const entries: StatEntry[] = [];
  for (const id of ids) {
    const participant = map.get(id);
    if (participant) entries.push({ participant, label: labelOf?.(id) });
  }
  return entries;
}

// 🎯 Más marcadores exactos.
export function reyDeExactos(
  participants: Participant[],
  predictions: Prediction[]
): Stat | null {
  const counts = new Map<number, number>();
  for (const p of predictions) {
    if (Number(p.points) === 3) {
      counts.set(p.participant_id, (counts.get(p.participant_id) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;
  const max = Math.max(...counts.values());
  const ids = [...counts].filter(([, c]) => c === max).map(([id]) => id);
  const entries = toEntries(participants, ids);
  if (entries.length === 0) return null;
  return { entries, value: `${max} exacto${max === 1 ? "" : "s"}` };
}

// 🔥 Más puntos en una sola jornada.
export function mejorJornada(
  participants: Participant[],
  predictions: Prediction[],
  matches: Match[]
): Stat | null {
  const jornadaByMatch = new Map(matches.map((m) => [m.id, m.jornada]));
  const sums = new Map<string, number>(); // "pid|jornada" -> pts
  for (const p of predictions) {
    if (p.points === null || p.points === undefined) continue;
    const j = jornadaByMatch.get(p.match_id);
    if (!j) continue;
    const k = `${p.participant_id}|${j}`;
    sums.set(k, (sums.get(k) ?? 0) + Number(p.points));
  }
  const max = Math.max(0, ...sums.values());
  if (max <= 0) return null;
  const best = [...sums].filter(([, v]) => v === max).map(([k]) => k);
  const jornadaOf = new Map(
    best.map((k) => [Number(k.split("|")[0]), k.split("|")[1]])
  );
  const entries = toEntries(participants, [...jornadaOf.keys()], (id) =>
    jornadaOf.get(id)
  );
  if (entries.length === 0) return null;
  return { entries, value: `${fmtPts(max)} pts` };
}

// 🥄 Último de la tabla (con al menos un partido puntuado en la quiniela).
export function cucharaDePalo(
  participants: Participant[],
  predictions: Prediction[]
): Stat | null {
  const rows = computeStandings(participants, predictions);
  if (rows.length < 2 || !rows.some((r) => r.jugados > 0)) return null;
  const min = rows[rows.length - 1].points;
  const losers = rows.filter((r) => r.points === min);
  // Si todos están empatados no hay cuchara que repartir.
  if (losers.length === rows.length) return null;
  return {
    entries: losers.map((r) => ({ participant: r.participant })),
    value: `${fmtPts(min)} pts`,
  };
}

// 📈 Racha actual: partidos seguidos sumando puntos (contando hacia atrás
// desde el último partido terminado). Rachas de 1 no cuentan.
export function rachaActual(
  participants: Participant[],
  predictions: Prediction[],
  matches: Match[]
): Stat | null {
  const finished = matches
    .filter((m) => m.finished)
    .sort((a, b) => a.kickoff_utc.localeCompare(b.kickoff_utc) || a.id - b.id);
  if (finished.length === 0) return null;

  const predByKey = new Map(
    predictions.map((p) => [`${p.participant_id}:${p.match_id}`, p])
  );

  const streaks = new Map<number, number>();
  for (const part of participants) {
    let streak = 0;
    for (let i = finished.length - 1; i >= 0; i--) {
      const pred = predByKey.get(`${part.id}:${finished[i].id}`);
      if (pred && Number(pred.points ?? 0) > 0) streak += 1;
      else break;
    }
    streaks.set(part.id, streak);
  }

  const max = Math.max(0, ...streaks.values());
  if (max < 2) return null;
  const ids = [...streaks].filter(([, s]) => s === max).map(([id]) => id);
  const entries = toEntries(participants, ids);
  if (entries.length === 0) return null;
  return { entries, value: `${max} partidos seguidos sumando` };
}

// 🤝 Pareja con más pronósticos idénticos.
export function gemelos(
  participants: Participant[],
  predictions: Prediction[]
): Stat | null {
  if (participants.length < 2) return null;
  const byMatch = new Map<number, { pid: number; score: string }[]>();
  for (const p of predictions) {
    const arr = byMatch.get(p.match_id) ?? [];
    arr.push({ pid: p.participant_id, score: `${p.pred_home}-${p.pred_away}` });
    byMatch.set(p.match_id, arr);
  }

  const pairCounts = new Map<string, number>(); // "idMenor|idMayor"
  for (const arr of byMatch.values()) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].score !== arr[j].score) continue;
        const [a, b] = [arr[i].pid, arr[j].pid].sort((x, y) => x - y);
        const k = `${a}|${b}`;
        pairCounts.set(k, (pairCounts.get(k) ?? 0) + 1);
      }
    }
  }
  if (pairCounts.size === 0) return null;

  const max = Math.max(...pairCounts.values());
  const [bestPair] = [...pairCounts]
    .filter(([, c]) => c === max)
    .map(([k]) => k)
    .sort();
  const ids = bestPair.split("|").map(Number);
  const entries = toEntries(participants, ids);
  if (entries.length < 2) return null;
  return { entries, value: `${max} pronósticos idénticos` };
}

// 🦄 Exactos "en solitario": marcadores exactos que nadie más pronosticó.
export function exactoSolitario(
  participants: Participant[],
  predictions: Prediction[]
): Stat | null {
  const byMatch = new Map<number, Prediction[]>();
  for (const p of predictions) {
    const arr = byMatch.get(p.match_id) ?? [];
    arr.push(p);
    byMatch.set(p.match_id, arr);
  }

  const counts = new Map<number, number>();
  for (const arr of byMatch.values()) {
    for (const p of arr) {
      if (Number(p.points) !== 3) continue;
      const score = `${p.pred_home}-${p.pred_away}`;
      const repeated = arr.some(
        (q) =>
          q.participant_id !== p.participant_id &&
          `${q.pred_home}-${q.pred_away}` === score
      );
      if (!repeated) {
        counts.set(p.participant_id, (counts.get(p.participant_id) ?? 0) + 1);
      }
    }
  }
  if (counts.size === 0) return null;

  const max = Math.max(...counts.values());
  const ids = [...counts].filter(([, c]) => c === max).map(([id]) => id);
  const entries = toEntries(participants, ids);
  if (entries.length === 0) return null;
  return {
    entries,
    value: `${max} exacto${max === 1 ? "" : "s"} que nadie más vio`,
  };
}

import { describe, it, expect } from "vitest";
import {
  reyDeExactos,
  mejorJornada,
  cucharaDePalo,
  rachaActual,
  gemelos,
  exactoSolitario,
} from "./stats";
import type { Match, Participant, Prediction } from "./types";

const ana: Participant = { id: 1, display_name: "Ana", avatar_emoji: "🦊" };
const beto: Participant = { id: 2, display_name: "Beto", avatar_emoji: "🐻" };
const cami: Participant = { id: 3, display_name: "Cami", avatar_emoji: "🦉" };
const participants = [ana, beto, cami];

function pred(
  pid: number,
  mid: number,
  home: number,
  away: number,
  points: number | null
): Prediction {
  return { participant_id: pid, match_id: mid, pred_home: home, pred_away: away, points };
}

function makeMatch(id: number, jornada: string, finished: boolean, kickoff = `2026-06-${String(10 + id).padStart(2, "0")}T20:00:00Z`): Match {
  return {
    id,
    code: `M${id}`,
    group_letter: "A",
    jornada,
    kickoff_utc: kickoff,
    home_team: "X",
    away_team: "Y",
    home_goals: finished ? 1 : null,
    away_goals: finished ? 0 : null,
    finished,
  };
}

describe("reyDeExactos", () => {
  it("gana quien más exactos tiene; empates devuelven a todos", () => {
    const stat = reyDeExactos(participants, [
      pred(1, 1, 1, 0, 3),
      pred(1, 2, 2, 0, 3),
      pred(2, 1, 1, 0, 3),
      pred(3, 1, 0, 0, 1),
    ]);
    expect(stat?.entries.map((e) => e.participant.id)).toEqual([1]);
    expect(stat?.value).toBe("2 exactos");
  });

  it("null sin exactos", () => {
    expect(reyDeExactos(participants, [pred(1, 1, 1, 1, 1)])).toBeNull();
  });
});

describe("mejorJornada", () => {
  it("encuentra la mejor jornada individual", () => {
    const matches = [makeMatch(1, "J1", true), makeMatch(2, "J1", true), makeMatch(3, "J2", true)];
    const stat = mejorJornada(participants, [
      pred(1, 1, 1, 0, 3),
      pred(1, 2, 1, 0, 1.5), // Ana J1: 4.5
      pred(2, 3, 1, 0, 3), // Beto J2: 3
    ], matches);
    expect(stat?.entries[0].participant.id).toBe(1);
    expect(stat?.entries[0].label).toBe("J1");
    expect(stat?.value).toBe("4.5 pts");
  });
});

describe("cucharaDePalo", () => {
  it("señala al último cuando hay puntos y no están todos empatados", () => {
    const stat = cucharaDePalo(participants, [
      pred(1, 1, 1, 0, 3),
      pred(2, 1, 2, 0, 1.5),
      // Cami sin puntos
    ]);
    expect(stat?.entries.map((e) => e.participant.id)).toEqual([3]);
  });

  it("null cuando nadie ha puntuado", () => {
    expect(cucharaDePalo(participants, [])).toBeNull();
  });
});

describe("rachaActual", () => {
  const matches = [
    makeMatch(1, "J1", true),
    makeMatch(2, "J1", true),
    makeMatch(3, "J1", true),
  ];

  it("cuenta hacia atrás desde el último partido terminado", () => {
    const stat = rachaActual(participants, [
      pred(1, 1, 1, 0, 0), // Ana falló el 1º
      pred(1, 2, 1, 0, 1.5),
      pred(1, 3, 1, 0, 3), // racha de Ana: 2
      pred(2, 3, 1, 0, 3), // racha de Beto: 1 (no cuenta, mínimo 2)
    ], matches);
    expect(stat?.entries.map((e) => e.participant.id)).toEqual([1]);
    expect(stat?.value).toContain("2");
  });

  it("una racha rota al final da null si nadie llega a 2", () => {
    const stat = rachaActual(participants, [
      pred(1, 1, 1, 0, 3),
      pred(1, 2, 1, 0, 3),
      pred(1, 3, 1, 0, 0), // rompió en el último
    ], matches);
    expect(stat).toBeNull();
  });
});

describe("gemelos", () => {
  it("encuentra la pareja con más pronósticos idénticos", () => {
    const stat = gemelos(participants, [
      pred(1, 1, 1, 0, null),
      pred(2, 1, 1, 0, null), // iguales en M1
      pred(3, 1, 2, 0, null),
      pred(1, 2, 2, 1, null),
      pred(2, 2, 2, 1, null), // iguales en M2
    ]);
    expect(stat?.entries.map((e) => e.participant.id).sort()).toEqual([1, 2]);
    expect(stat?.value).toBe("2 pronósticos idénticos");
  });

  it("null sin coincidencias", () => {
    expect(
      gemelos(participants, [pred(1, 1, 1, 0, null), pred(2, 1, 0, 1, null)])
    ).toBeNull();
  });
});

describe("exactoSolitario", () => {
  it("solo cuenta exactos que nadie más pronosticó", () => {
    const stat = exactoSolitario(participants, [
      // M1: Ana y Beto acertaron exacto con el mismo marcador → no es solitario.
      pred(1, 1, 1, 0, 3),
      pred(2, 1, 1, 0, 3),
      // M2: Ana exacto y nadie más puso 2-1 → solitario.
      pred(1, 2, 2, 1, 3),
      pred(2, 2, 1, 1, 0),
    ]);
    expect(stat?.entries.map((e) => e.participant.id)).toEqual([1]);
    expect(stat?.value).toBe("1 exacto que nadie más vio");
  });
});

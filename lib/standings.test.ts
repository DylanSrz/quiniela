import { describe, it, expect } from "vitest";
import { scoreOf, computeStandings } from "./standings";
import type { Participant, Prediction } from "./types";

describe("scoreOf", () => {
  it("da 3 por marcador exacto (victoria)", () => {
    expect(scoreOf(2, 1, 2, 1)).toBe(3);
  });

  it("da 3 por marcador exacto (empate)", () => {
    expect(scoreOf(1, 1, 1, 1)).toBe(3);
  });

  it("da 1.5 por acertar el ganador sin marcador exacto", () => {
    expect(scoreOf(2, 0, 3, 1)).toBe(1.5);
    expect(scoreOf(0, 1, 1, 3)).toBe(1.5);
  });

  it("da 1 por acertar empate sin marcador exacto", () => {
    expect(scoreOf(0, 0, 2, 2)).toBe(1);
  });

  it("da 0 cuando no acierta nada", () => {
    expect(scoreOf(2, 0, 0, 2)).toBe(0); // ganador equivocado
    expect(scoreOf(1, 1, 2, 0)).toBe(0); // predijo empate, fue victoria
    expect(scoreOf(2, 1, 1, 1)).toBe(0); // predijo victoria, fue empate
  });
});

describe("computeStandings", () => {
  const participants: Participant[] = [
    { id: 1, display_name: "Ana", avatar_emoji: "🦊" },
    { id: 2, display_name: "Beto", avatar_emoji: "🐻" },
  ];

  it("suma puntos e ignora pronósticos sin resultado (points null)", () => {
    const preds: Prediction[] = [
      { participant_id: 1, match_id: 1, pred_home: 1, pred_away: 0, points: 3 },
      { participant_id: 1, match_id: 2, pred_home: 1, pred_away: 1, points: 1 },
      { participant_id: 1, match_id: 3, pred_home: 0, pred_away: 0, points: null },
      { participant_id: 2, match_id: 1, pred_home: 0, pred_away: 0, points: 1.5 },
    ];
    const rows = computeStandings(participants, preds);

    expect(rows[0].participant.id).toBe(1);
    expect(rows[0].points).toBe(4);
    expect(rows[0].exactos).toBe(1);
    expect(rows[0].resultados).toBe(1);
    expect(rows[0].jugados).toBe(2); // el null no cuenta

    expect(rows[1].participant.id).toBe(2);
    expect(rows[1].points).toBe(1.5);
    expect(rows[1].resultados).toBe(1);
  });

  it("desempata por más exactos y luego por más resultados", () => {
    const preds: Prediction[] = [
      // Ambos con 3 pts totales, pero Ana con 1 exacto y Beto con 2 resultados.
      { participant_id: 1, match_id: 1, pred_home: 1, pred_away: 0, points: 3 },
      { participant_id: 2, match_id: 1, pred_home: 1, pred_away: 0, points: 1.5 },
      { participant_id: 2, match_id: 2, pred_home: 1, pred_away: 0, points: 1.5 },
    ];
    const rows = computeStandings(participants, preds);
    expect(rows[0].participant.id).toBe(1); // gana por más exactos
  });
});

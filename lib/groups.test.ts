import { describe, it, expect } from "vitest";
import { computeGroupTables } from "./groups";
import type { Match } from "./types";

let nextId = 1;
function makeMatch(
  group: string,
  home: string,
  away: string,
  score: [number, number] | null
): Match {
  return {
    id: nextId++,
    code: `M${nextId}`,
    group_letter: group,
    jornada: "J1",
    kickoff_utc: "2026-06-11T20:00:00Z",
    home_team: home,
    away_team: away,
    home_goals: score ? score[0] : null,
    away_goals: score ? score[1] : null,
    finished: score !== null,
  };
}

describe("computeGroupTables", () => {
  it("acumula puntos, goles y diferencia (victoria y empate)", () => {
    const tables = computeGroupTables([
      makeMatch("A", "México", "Sudáfrica", [2, 0]),
      makeMatch("A", "Canadá", "Suiza", [1, 1]),
    ]);
    const a = tables.get("A")!;

    expect(a[0]).toMatchObject({ team: "México", pj: 1, g: 1, pts: 3, gf: 2, gc: 0, dif: 2 });
    const canada = a.find((r) => r.team === "Canadá")!;
    expect(canada).toMatchObject({ pj: 1, e: 1, pts: 1, dif: 0 });
    const sud = a.find((r) => r.team === "Sudáfrica")!;
    expect(sud).toMatchObject({ pj: 1, p: 1, pts: 0, dif: -2 });
  });

  it("desempata por diferencia de gol y luego por goles a favor", () => {
    const tables = computeGroupTables([
      // A y B ganan su partido 3 pts cada uno:
      makeMatch("B", "A", "X", [3, 0]), // A: dif +3
      makeMatch("B", "B", "Y", [1, 0]), // B: dif +1
      // C también 3 pts con dif +3 pero menos GF que A:
      makeMatch("B", "C", "Z", [4, 1]),
    ]);
    const b = tables.get("B")!;
    // C (dif+3, gf4) > A (dif+3, gf3) > B (dif+1)
    expect(b.slice(0, 3).map((r) => r.team)).toEqual(["C", "A", "B"]);
  });

  it("los partidos sin terminar no cuentan pero sus equipos aparecen", () => {
    const tables = computeGroupTables([
      makeMatch("C", "Brasil", "Marruecos", null),
    ]);
    const c = tables.get("C")!;
    expect(c).toHaveLength(2);
    expect(c.every((r) => r.pj === 0 && r.pts === 0)).toBe(true);
  });

  it("devuelve los grupos ordenados alfabéticamente", () => {
    const tables = computeGroupTables([
      makeMatch("L", "L1", "L2", null),
      makeMatch("A", "A1", "A2", null),
      makeMatch("D", "D1", "D2", null),
    ]);
    expect([...tables.keys()]).toEqual(["A", "D", "L"]);
  });
});

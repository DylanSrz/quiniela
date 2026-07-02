import { describe, it, expect } from "vitest";
import { upcomingMatches } from "./schedule";
import type { Match } from "./types";

function makeMatch(id: number, kickoffUtc: string, finished: boolean): Match {
  return {
    id,
    code: `M${id}`,
    group_letter: "A",
    jornada: "J1",
    kickoff_utc: kickoffUtc,
    home_team: "X",
    away_team: "Y",
    home_goals: finished ? 1 : null,
    away_goals: finished ? 0 : null,
    finished,
  };
}

// "Hoy" se evalúa en America/Bogota (UTC-5).
describe("upcomingMatches", () => {
  it("lista los partidos de hoy sin terminar, ordenados por hora", () => {
    const now = new Date("2026-06-11T15:00:00Z"); // 11 jun, 10:00 en Bogotá
    const matches = [
      makeMatch(1, "2026-06-11T20:00:00Z", false), // hoy 15:00 Bogotá
      makeMatch(2, "2026-06-11T17:00:00Z", false), // hoy 12:00 Bogotá
      makeMatch(3, "2026-06-11T14:00:00Z", true), // hoy pero ya terminó
      makeMatch(4, "2026-06-12T20:00:00Z", false), // mañana
    ];
    const info = upcomingMatches(matches, now);
    expect(info.kind).toBe("today");
    if (info.kind === "today") {
      expect(info.matches.map((m) => m.id)).toEqual([2, 1]);
    }
  });

  it("respeta el límite de día en Bogotá (kickoff en UTC de madrugada)", () => {
    // 12 jun 01:00 UTC = 11 jun 20:00 en Bogotá → cuenta como "hoy" el día 11.
    const now = new Date("2026-06-11T15:00:00Z");
    const matches = [makeMatch(1, "2026-06-12T01:00:00Z", false)];
    const info = upcomingMatches(matches, now);
    expect(info.kind).toBe("today");
  });

  it("sin partidos hoy, devuelve el próximo por jugarse", () => {
    const now = new Date("2026-06-11T15:00:00Z");
    const matches = [
      makeMatch(1, "2026-06-10T20:00:00Z", true), // ayer, terminado
      makeMatch(2, "2026-06-10T22:00:00Z", false), // ayer sin resultado cargado → no es "próximo"
      makeMatch(3, "2026-06-13T20:00:00Z", false),
      makeMatch(4, "2026-06-12T20:00:00Z", false), // el más cercano
    ];
    const info = upcomingMatches(matches, now);
    expect(info.kind).toBe("next");
    if (info.kind === "next") expect(info.match.id).toBe(4);
  });

  it("devuelve none cuando toda la fase terminó", () => {
    const now = new Date("2026-07-01T15:00:00Z");
    const matches = [
      makeMatch(1, "2026-06-10T20:00:00Z", true),
      makeMatch(2, "2026-06-11T20:00:00Z", true),
    ];
    expect(upcomingMatches(matches, now).kind).toBe("none");
  });
});

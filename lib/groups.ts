import type { Match } from "./types";

export type TeamRow = {
  team: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dif: number;
  pts: number;
};

// Clasificación real de cada grupo del torneo a partir de los resultados
// cargados. Criterio de orden (FIFA básico): puntos → diferencia de gol →
// goles a favor → nombre. Los partidos sin terminar no cuentan, pero sus
// equipos igual aparecen (con todo en cero). Grupos ordenados A→L.
export function computeGroupTables(matches: Match[]): Map<string, TeamRow[]> {
  const groups = new Map<string, Map<string, TeamRow>>();

  const rowOf = (group: string, team: string): TeamRow => {
    let g = groups.get(group);
    if (!g) {
      g = new Map();
      groups.set(group, g);
    }
    let row = g.get(team);
    if (!row) {
      row = { team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0, pts: 0 };
      g.set(team, row);
    }
    return row;
  };

  for (const m of matches) {
    const home = rowOf(m.group_letter, m.home_team);
    const away = rowOf(m.group_letter, m.away_team);
    if (!m.finished || m.home_goals === null || m.away_goals === null) continue;

    home.pj += 1;
    away.pj += 1;
    home.gf += m.home_goals;
    home.gc += m.away_goals;
    away.gf += m.away_goals;
    away.gc += m.home_goals;

    if (m.home_goals > m.away_goals) {
      home.g += 1;
      home.pts += 3;
      away.p += 1;
    } else if (m.home_goals < m.away_goals) {
      away.g += 1;
      away.pts += 3;
      home.p += 1;
    } else {
      home.e += 1;
      away.e += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  const result = new Map<string, TeamRow[]>();
  for (const [letter, teams] of [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const rows = [...teams.values()];
    for (const r of rows) r.dif = r.gf - r.gc;
    rows.sort(
      (a, b) =>
        b.pts - a.pts ||
        b.dif - a.dif ||
        b.gf - a.gf ||
        a.team.localeCompare(b.team)
    );
    result.set(letter, rows);
  }
  return result;
}

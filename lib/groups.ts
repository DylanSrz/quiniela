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

// Acumula pts/gf/gc/dif de un partido terminado sobre las filas home/away.
function applyMatch(home: TeamRow, away: TeamRow, m: Match) {
  if (!m.finished || m.home_goals === null || m.away_goals === null) return;

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

function emptyRow(team: string): TeamRow {
  return { team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0, pts: 0 };
}

// Mini-tabla de enfrentamiento directo entre únicamente los equipos dados,
// usando solo los partidos de ese grupo que jugaron entre sí.
function headToHead(
  teams: string[],
  matches: Match[],
  group: string
): Map<string, TeamRow> {
  const rows = new Map(teams.map((t) => [t, emptyRow(t)]));
  const teamSet = new Set(teams);
  for (const m of matches) {
    if (m.group_letter !== group) continue;
    if (!teamSet.has(m.home_team) || !teamSet.has(m.away_team)) continue;
    applyMatch(rows.get(m.home_team)!, rows.get(m.away_team)!, m);
  }
  for (const r of rows.values()) r.dif = r.gf - r.gc;
  return rows;
}

// Clasificación real de cada grupo del torneo a partir de los resultados
// cargados. Orden: puntos → (entre los empatados en puntos) enfrentamiento
// directo: pts → dif → gf de los partidos jugados solo entre ellos → si el
// empate persiste (o no se enfrentaron), diferencia de gol global → goles a
// favor global → nombre. Los partidos sin terminar no cuentan, pero sus
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
      row = emptyRow(team);
      g.set(team, row);
    }
    return row;
  };

  for (const m of matches) {
    applyMatch(rowOf(m.group_letter, m.home_team), rowOf(m.group_letter, m.away_team), m);
  }

  const result = new Map<string, TeamRow[]>();
  for (const [letter, teams] of [...groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const rows = [...teams.values()];
    for (const r of rows) r.dif = r.gf - r.gc;
    rows.sort((a, b) => b.pts - a.pts);

    // Dentro de cada bloque de puntos empatados, desempatar por
    // enfrentamiento directo antes de caer al criterio global.
    const ordered: TeamRow[] = [];
    let i = 0;
    while (i < rows.length) {
      let j = i + 1;
      while (j < rows.length && rows[j].pts === rows[i].pts) j++;
      const block = rows.slice(i, j);
      if (block.length > 1) {
        const h2h = headToHead(
          block.map((r) => r.team),
          matches,
          letter
        );
        block.sort((a, b) => {
          const ah = h2h.get(a.team)!;
          const bh = h2h.get(b.team)!;
          return (
            bh.pts - ah.pts ||
            bh.dif - ah.dif ||
            bh.gf - ah.gf ||
            b.dif - a.dif ||
            b.gf - a.gf ||
            a.team.localeCompare(b.team)
          );
        });
      }
      ordered.push(...block);
      i = j;
    }
    result.set(letter, ordered);
  }
  return result;
}

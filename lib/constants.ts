// Constantes compartidas de la quiniela (fuente única para evitar duplicados).

export const MEDALS = ["🥇", "🥈", "🥉"] as const;

// Reglas de puntuación. DEBEN coincidir con el trigger SQL en Postgres
// y con scoreOf() en lib/standings.ts.
export const SCORING = { exacto: 3, ganador: 1.5, empate: 1 } as const;

export const JORNADAS = ["J1", "J2", "J3"] as const;
export type Jornada = (typeof JORNADAS)[number];

// Zona horaria de referencia para mostrar horarios (Colombia).
export const TIMEZONE = "America/Bogota";

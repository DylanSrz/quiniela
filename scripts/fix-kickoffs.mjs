// Corrige date + time_local_bogota de los 72 partidos al calendario oficial FIFA 2026.
// Fuente: ESPN + Yahoo (hora ET). Colombia = ET - 1h (en junio ET=UTC-4, Bogotá=UTC-5).
// Actualiza partidos_fase_grupos.json (solo fecha/hora) y genera scripts/update-kickoffs.sql.
import { readFileSync, writeFileSync } from "node:fs";

// id -> [fecha YYYY-MM-DD, hora HH:MM] en hora de Colombia (Bogotá)
const FIX = {
  1: ["2026-06-11", "14:00"],
  2: ["2026-06-11", "16:00"],
  3: ["2026-06-12", "14:00"],
  4: ["2026-06-12", "20:00"],
  5: ["2026-06-13", "14:00"],
  6: ["2026-06-13", "20:00"],
  7: ["2026-06-13", "23:00"],
  8: ["2026-06-14", "12:00"],
  9: ["2026-06-13", "17:00"],
  10: ["2026-06-14", "15:00"],
  11: ["2026-06-14", "18:00"],
  12: ["2026-06-14", "21:00"],
  13: ["2026-06-15", "11:00"],
  14: ["2026-06-15", "14:00"],
  15: ["2026-06-15", "17:00"],
  16: ["2026-06-15", "20:00"],
  17: ["2026-06-16", "14:00"],
  18: ["2026-06-16", "17:00"],
  19: ["2026-06-16", "20:00"],
  20: ["2026-06-16", "23:00"],
  21: ["2026-06-17", "12:00"],
  22: ["2026-06-17", "15:00"],
  23: ["2026-06-17", "18:00"],
  24: ["2026-06-17", "21:00"],
  25: ["2026-06-18", "11:00"],
  26: ["2026-06-18", "14:00"],
  27: ["2026-06-18", "17:00"],
  28: ["2026-06-18", "20:00"],
  29: ["2026-06-19", "14:00"],
  30: ["2026-06-19", "17:00"],
  31: ["2026-06-19", "19:30"],
  32: ["2026-06-19", "23:00"],
  33: ["2026-06-20", "12:00"],
  34: ["2026-06-20", "15:00"],
  35: ["2026-06-20", "19:00"],
  36: ["2026-06-20", "23:00"],
  37: ["2026-06-21", "11:00"],
  38: ["2026-06-21", "14:00"],
  39: ["2026-06-21", "17:00"],
  40: ["2026-06-21", "20:00"],
  41: ["2026-06-22", "12:00"],
  42: ["2026-06-22", "16:00"],
  43: ["2026-06-22", "19:00"],
  44: ["2026-06-22", "22:00"],
  45: ["2026-06-23", "12:00"],
  46: ["2026-06-23", "15:00"],
  47: ["2026-06-23", "18:00"],
  48: ["2026-06-23", "21:00"],
  49: ["2026-06-24", "14:00"],
  50: ["2026-06-24", "14:00"],
  51: ["2026-06-24", "17:00"],
  52: ["2026-06-24", "17:00"],
  53: ["2026-06-24", "20:00"],
  54: ["2026-06-24", "20:00"],
  55: ["2026-06-25", "15:00"],
  56: ["2026-06-25", "15:00"],
  57: ["2026-06-25", "18:00"],
  58: ["2026-06-25", "18:00"],
  59: ["2026-06-25", "21:00"],
  60: ["2026-06-25", "21:00"],
  61: ["2026-06-26", "14:00"],
  62: ["2026-06-26", "14:00"],
  63: ["2026-06-26", "19:00"],
  64: ["2026-06-26", "19:00"],
  65: ["2026-06-26", "22:00"],
  66: ["2026-06-26", "22:00"],
  67: ["2026-06-27", "16:00"],
  68: ["2026-06-27", "16:00"],
  69: ["2026-06-27", "18:30"],
  70: ["2026-06-27", "18:30"],
  71: ["2026-06-27", "21:00"],
  72: ["2026-06-27", "21:00"],
};

const file = "partidos_fase_grupos.json";
const matches = JSON.parse(readFileSync(file, "utf8"));

let changed = 0;
const sqlRows = [];
for (const m of matches) {
  const fix = FIX[m.id];
  if (!fix) throw new Error("Falta corrección para id " + m.id);
  const [date, time] = fix;
  if (m.date !== date || m.time_local_bogota !== time) changed++;
  m.date = date;
  m.time_local_bogota = time;
  sqlRows.push({ id: m.id, date, time });
}

writeFileSync(file, JSON.stringify(matches, null, 2) + "\n", "utf8");

const sql = `-- Corrige kickoff_utc de los 72 partidos (hora Colombia -05:00) al calendario oficial FIFA 2026
update matches m set kickoff_utc = (x.date || ' ' || x."time" || ':00-05:00')::timestamptz
from jsonb_to_recordset($k$${JSON.stringify(sqlRows)}$k$::jsonb)
  as x(id int, date text, "time" text)
where m.id = x.id;`;
writeFileSync("scripts/update-kickoffs.sql", sql, "utf8");

console.log(`OK: ${file} actualizado (${changed}/${matches.length} partidos con cambios)`);
console.log("OK: scripts/update-kickoffs.sql generado");

import { readFileSync, writeFileSync } from "node:fs";

const matches = JSON.parse(readFileSync("partidos_fase_grupos.json", "utf8"));

// Bogota es UTC-5 (sin horario de verano): construimos el timestamptz con offset -05:00
const json = JSON.stringify(
  matches.map((m) => ({
    id: m.id,
    code: m.code,
    group: m.group,
    jornada: m.jornada,
    date: m.date,
    time: m.time_local_bogota,
    home: m.home,
    away: m.away,
  }))
);

const sql = `insert into matches (id, code, group_letter, jornada, kickoff_utc, home_team, away_team)
select id, code, "group", jornada,
       (date || ' ' || "time" || ':00-05:00')::timestamptz,
       home, away
from jsonb_to_recordset($seed$${json}$seed$::jsonb)
as x(id int, code text, "group" text, jornada text, date text, "time" text, home text, away text)
on conflict (id) do nothing;`;

writeFileSync("scripts/seed-matches.sql", sql, "utf8");
console.log("OK: scripts/seed-matches.sql (" + matches.length + " partidos)");

// Carga masiva de pronósticos desde ./pronosticos/*.xlsx hacia Supabase.
// Usa el mismo layout y emparejamiento que el uploader de la web.
// El nombre del archivo (sin extensión) se usa como nombre del participante.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

// --- env ---
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// --- helpers (replicados de lib/teams + uploader) ---
const normalizeName = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const BLOCKS = [
  { start: 2, left: "A", right: "G" },
  { start: 9, left: "B", right: "H" },
  { start: 16, left: "C", right: "I" },
  { start: 23, left: "D", right: "J" },
  { start: 30, left: "E", right: "K" },
  { start: 37, left: "F", right: "L" },
];
const jornadaOf = (raw) => {
  const d = String(raw ?? "").match(/[123]/)?.[0];
  return d ? `J${d}` : "";
};
const num = (raw) => {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
};

function parseWorkbook(buf, matchIndex) {
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets["Hoja1"] ?? wb.Sheets[wb.SheetNames[0]];
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const rows = [];
  const add = (group, jor, home, away, ph, pa) => {
    if (!String(home).trim() && !String(away).trim()) return;
    const key = `${group}|${jor}|${normalizeName(home)}|${normalizeName(away)}`;
    const matchId = matchIndex.get(key) ?? null;
    let status = "ok";
    if (matchId === null) status = "nomatch";
    else if (ph === null || pa === null) status = "badnum";
    rows.push({ group, jor, home: String(home).trim(), away: String(away).trim(), ph, pa, matchId, status });
  };

  for (const b of BLOCKS) {
    for (let r = 1; r <= 6; r++) {
      const row = grid[b.start - 2 + r] ?? [];
      add(b.left, jornadaOf(row[3]), row[4], row[7], num(row[5]), num(row[6]));
      add(b.right, jornadaOf(row[13]), row[14], row[17], num(row[15]), num(row[16]));
    }
  }
  return rows;
}

// --- main ---
const dir = "pronosticos";
const files = readdirSync(dir).filter((f) => /\.xlsx?$/i.test(f));
if (files.length === 0) {
  console.error("No hay archivos .xlsx en ./pronosticos/");
  process.exit(1);
}

const { data: matches, error: me } = await sb
  .from("matches")
  .select("id, group_letter, jornada, home_team, away_team, home_goals, away_goals, finished");
if (me) {
  console.error("Error leyendo matches:", me.message);
  process.exit(1);
}
const matchIndex = new Map();
for (const m of matches) {
  matchIndex.set(
    `${m.group_letter}|${m.jornada}|${normalizeName(m.home_team)}|${normalizeName(m.away_team)}`,
    m.id
  );
}
const finished = new Map(
  matches.filter((m) => m.finished).map((m) => [m.id, m])
);

function pointsFor(ph, pa, m) {
  if (!m || m.home_goals === null || m.away_goals === null) return null;
  if (ph === m.home_goals && pa === m.away_goals) return 3;
  if (Math.sign(ph - pa) === Math.sign(m.home_goals - m.away_goals)) return 1;
  return 0;
}

let totalOk = 0;
const problemas = [];

for (const file of files) {
  const name = file.replace(/\.xlsx?$/i, "").trim();
  const rows = parseWorkbook(readFileSync(join(dir, file)), matchIndex);
  const ok = rows.filter((r) => r.status === "ok");
  const nomatch = rows.filter((r) => r.status === "nomatch");
  const badnum = rows.filter((r) => r.status === "badnum");

  console.log(`\n📄 ${file}  ->  "${name}"`);
  console.log(`   filas: ${rows.length} | ok: ${ok.length} | sin match: ${nomatch.length} | goles inválidos: ${badnum.length}`);

  if (nomatch.length) {
    for (const r of nomatch.slice(0, 5))
      console.log(`   ⚠ sin match: [${r.group}/${r.jor}] ${r.home} vs ${r.away}`);
  }

  // Bloquear solo ante errores estructurales (equipos que no emparejan).
  if (nomatch.length > 0 || ok.length === 0) {
    console.log(`   ✗ NO se carga (hay partidos que no emparejan). Revisa el archivo.`);
    problemas.push(file);
    continue;
  }
  if (badnum.length > 0) {
    console.log(`   ⓘ ${badnum.length} partido(s) sin pronóstico: se omiten, se cargan ${ok.length}.`);
  }

  // upsert participante
  const { data: p, error: pe } = await sb
    .from("participants")
    .upsert({ display_name: name, avatar_emoji: "⚽" }, { onConflict: "display_name" })
    .select()
    .single();
  if (pe) {
    console.log(`   ✗ error creando participante: ${pe.message}`);
    problemas.push(file);
    continue;
  }

  const payload = ok.map((r) => ({
    participant_id: p.id,
    match_id: r.matchId,
    pred_home: r.ph,
    pred_away: r.pa,
    points: pointsFor(r.ph, r.pa, finished.get(r.matchId)),
  }));
  const { error: ue } = await sb
    .from("predictions")
    .upsert(payload, { onConflict: "participant_id,match_id" });
  if (ue) {
    console.log(`   ✗ error guardando pronósticos: ${ue.message}`);
    problemas.push(file);
    continue;
  }
  console.log(`   ✓ cargado: 72 pronósticos para "${name}" (id ${p.id})`);
  totalOk++;
}

console.log(`\n=== Resumen: ${totalOk}/${files.length} archivos cargados ===`);
if (problemas.length) console.log("Con problemas:", problemas.join(", "));

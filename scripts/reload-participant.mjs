// Recarga SEGURA de pronósticos de uno o más participantes desde su .xlsx.
// - NO toca la tabla participants (preserva avatar/nombre).
// - Solo actualiza la tabla predictions del participante (busca su id por nombre).
// - Recalcula points para partidos ya finalizados (misma regla que el trigger).
// - Muestra un diff de lo que cambia y aplica el upsert.
// Uso: node scripts/reload-participant.mjs Jier.xlsx Jesus.xlsx
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: node scripts/reload-participant.mjs <archivo.xlsx> [...]");
  process.exit(1);
}

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

function pointsFor(ph, pa, m) {
  if (!m || m.home_goals === null || m.away_goals === null) return null;
  if (ph === m.home_goals && pa === m.away_goals) return 3;
  if (m.home_goals === m.away_goals && ph === pa) return 1;
  if (m.home_goals !== m.away_goals && Math.sign(ph - pa) === Math.sign(m.home_goals - m.away_goals))
    return 1.5;
  return 0;
}

const { data: matches, error: me } = await sb
  .from("matches")
  .select("id, code, group_letter, jornada, home_team, away_team, home_goals, away_goals, finished");
if (me) throw new Error("matches: " + me.message);
const matchIndex = new Map();
const matchById = new Map();
for (const m of matches) {
  matchIndex.set(
    `${m.group_letter}|${m.jornada}|${normalizeName(m.home_team)}|${normalizeName(m.away_team)}`,
    m.id
  );
  matchById.set(m.id, m);
}
const finished = new Map(matches.filter((m) => m.finished).map((m) => [m.id, m]));

for (const file of args) {
  const name = file.replace(/\.xlsx?$/i, "").trim();
  console.log(`\n=== ${file} -> participante "${name}" ===`);

  // Buscar participante existente (NO crear, para no tocar avatar)
  const { data: part, error: pe } = await sb
    .from("participants")
    .select("id, display_name, avatar_emoji")
    .eq("display_name", name)
    .maybeSingle();
  if (pe) throw new Error("participants: " + pe.message);
  if (!part) {
    console.log(`  ✗ No existe un participante llamado "${name}". Se omite (no se crea).`);
    continue;
  }
  console.log(`  participante id=${part.id}, avatar=${part.avatar_emoji} (se conserva)`);

  // Parsear archivo
  const rows = parseWorkbook(readFileSync(join("pronosticos", file)), matchIndex);
  const ok = rows.filter((r) => r.status === "ok");
  const nomatch = rows.filter((r) => r.status === "nomatch");
  const badnum = rows.filter((r) => r.status === "badnum");
  if (nomatch.length) {
    console.log(`  ✗ ${nomatch.length} fila(s) sin emparejar — NO se carga este archivo. Revisar:`);
    for (const r of nomatch.slice(0, 6)) console.log(`     [${r.group}/${r.jor}] ${r.home} vs ${r.away}`);
    continue;
  }
  if (badnum.length) console.log(`  ⓘ ${badnum.length} partido(s) sin pronóstico (se omiten).`);

  // Pronósticos actuales en BD
  const { data: cur, error: ce } = await sb
    .from("predictions")
    .select("match_id, pred_home, pred_away, points")
    .eq("participant_id", part.id);
  if (ce) throw new Error("predictions: " + ce.message);
  const curByMatch = new Map(cur.map((c) => [c.match_id, c]));

  // Diff
  const changes = [];
  const payload = ok.map((r) => {
    const pts = pointsFor(r.ph, r.pa, finished.get(r.matchId));
    const prev = curByMatch.get(r.matchId);
    const before = prev ? `${prev.pred_home}-${prev.pred_away}` : "(nuevo)";
    const after = `${r.ph}-${r.pa}`;
    if (!prev || prev.pred_home !== r.ph || prev.pred_away !== r.pa) {
      const m = matchById.get(r.matchId);
      changes.push({
        match: `${m.home_team} vs ${m.away_team}`,
        before,
        after,
        finished: finished.has(r.matchId),
        prevPts: prev ? prev.points : null,
        newPts: pts,
      });
    }
    return {
      participant_id: part.id,
      match_id: r.matchId,
      pred_home: r.ph,
      pred_away: r.pa,
      points: pts,
    };
  });

  if (changes.length === 0) {
    console.log("  = Sin cambios respecto a la BD (nada que actualizar).");
  } else {
    console.log(`  Cambios detectados (${changes.length}):`);
    for (const c of changes) {
      const ptInfo = c.finished
        ? ` | puntos: ${c.prevPts ?? "·"} -> ${c.newPts}`
        : " | (partido sin jugar)";
      console.log(`     ${c.match}: ${c.before} -> ${c.after}${ptInfo}`);
    }
  }

  // Aplicar SOLO a predictions (no toca participants)
  const { error: ue } = await sb
    .from("predictions")
    .upsert(payload, { onConflict: "participant_id,match_id" });
  if (ue) throw new Error("upsert predictions: " + ue.message);
  console.log(`  ✓ ${payload.length} pronósticos cargados (avatar y nombre intactos).`);
}

console.log("\nListo.");

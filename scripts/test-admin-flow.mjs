// Prueba del flujo del admin contra la BD usando la service role key (igual que las server actions).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Cargar .env.local
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

const log = (...a) => console.log(...a);
let participantId;

try {
  // 1) Crear participante (createParticipant)
  const { data: p, error: e1 } = await sb
    .from("participants")
    .insert({ display_name: "ZZ Prueba Admin", avatar_emoji: "🧪" })
    .select()
    .single();
  if (e1) throw new Error("crear participante: " + e1.message);
  participantId = p.id;
  log("1) Participante creado:", p.id, p.display_name, p.avatar_emoji);

  // 2) Cargar pronósticos (upsertPredictions): match 1 -> 2-0, match 2 -> 1-1
  const { error: e2 } = await sb.from("predictions").upsert(
    [
      { participant_id: participantId, match_id: 1, pred_home: 2, pred_away: 0 },
      { participant_id: participantId, match_id: 2, pred_home: 1, pred_away: 1 },
    ],
    { onConflict: "participant_id,match_id" }
  );
  if (e2) throw new Error("upsert pronosticos: " + e2.message);
  log("2) Pronósticos cargados: m1=2-0, m2=1-1");

  // 3) Guardar resultados (saveResult): m1 -> 2-0 (exacto => 3), m2 -> 0-0 (empate, pred 1-1 empate => 1)
  const { error: e3a } = await sb
    .from("matches")
    .update({ home_goals: 2, away_goals: 0, finished: true })
    .eq("id", 1);
  const { error: e3b } = await sb
    .from("matches")
    .update({ home_goals: 0, away_goals: 0, finished: true })
    .eq("id", 2);
  if (e3a || e3b) throw new Error("guardar resultados: " + (e3a || e3b).message);
  log("3) Resultados guardados: m1=2-0, m2=0-0 (trigger recalcula)");

  // 4) Verificar puntos calculados por el trigger
  const { data: preds, error: e4 } = await sb
    .from("predictions")
    .select("match_id, pred_home, pred_away, points")
    .eq("participant_id", participantId)
    .order("match_id");
  if (e4) throw new Error("leer puntos: " + e4.message);
  log("4) Puntos calculados:");
  for (const pr of preds)
    log(`   m${pr.match_id}: ${pr.pred_home}-${pr.pred_away} -> ${pr.points} pts`);

  const m1 = preds.find((x) => x.match_id === 1);
  const m2 = preds.find((x) => x.match_id === 2);
  const ok = m1?.points === 3 && m2?.points === 1;
  log(ok ? "   ✓ Puntuación correcta (3 exacto + 1 resultado)" : "   ✗ PUNTUACIÓN INESPERADA");

  if (!ok) process.exitCode = 1;
} catch (err) {
  console.error("ERROR:", err.message);
  process.exitCode = 1;
} finally {
  // 5) Limpieza: borrar participante de prueba (cascade) y revertir resultados
  if (participantId) {
    await sb.from("participants").delete().eq("id", participantId);
  }
  await sb
    .from("matches")
    .update({ home_goals: null, away_goals: null, finished: false })
    .in("id", [1, 2]);
  log("5) Limpieza hecha: participante de prueba borrado, partidos 1 y 2 revertidos.");
}

"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { scoreOf } from "@/lib/standings";

async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado");
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/partidos");
  revalidatePath("/admin");
  revalidatePath("/admin/participantes");
  revalidatePath("/admin/resultados");
  revalidatePath("/admin/pronosticos");
}

// ---- Participantes ----

export async function createParticipant(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("display_name") ?? "").trim();
  const emoji = String(formData.get("avatar_emoji") ?? "").trim() || "⚽";
  if (!name) throw new Error("El nombre es obligatorio");

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("participants")
    .insert({ display_name: name, avatar_emoji: emoji });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateParticipant(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  const name = String(formData.get("display_name") ?? "").trim();
  const emoji = String(formData.get("avatar_emoji") ?? "").trim() || "⚽";
  if (!id || !name) throw new Error("Datos inválidos");

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("participants")
    .update({ display_name: name, avatar_emoji: emoji })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteParticipant(formData: FormData) {
  await assertAdmin();
  const id = Number(formData.get("id"));
  if (!id) throw new Error("Id inválido");

  const sb = supabaseAdmin();
  const { error } = await sb.from("participants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---- Resultados ----

export async function saveResult(formData: FormData) {
  await assertAdmin();
  const matchId = Number(formData.get("match_id"));
  const homeRaw = formData.get("home_goals");
  const awayRaw = formData.get("away_goals");

  if (!matchId) throw new Error("Partido inválido");
  const home = Number(homeRaw);
  const away = Number(awayRaw);
  if (
    homeRaw === null ||
    awayRaw === null ||
    String(homeRaw) === "" ||
    String(awayRaw) === "" ||
    !Number.isInteger(home) ||
    !Number.isInteger(away) ||
    home < 0 ||
    away < 0
  ) {
    throw new Error("Marcador inválido");
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("matches")
    .update({ home_goals: home, away_goals: away, finished: true })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// Revierte un resultado (vuelve a "por jugar"); el trigger pone points = null.
export async function clearResult(formData: FormData) {
  await assertAdmin();
  const matchId = Number(formData.get("match_id"));
  if (!matchId) throw new Error("Partido inválido");

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("matches")
    .update({ home_goals: null, away_goals: null, finished: false })
    .eq("id", matchId);
  if (error) throw new Error(error.message);
  revalidateAll();
}

// ---- Pronósticos (carga desde Excel) ----

export type PredInput = {
  match_id: number;
  pred_home: number;
  pred_away: number;
};

export async function upsertPredictions(
  participantId: number,
  rows: PredInput[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  await assertAdmin();
  if (!participantId) return { ok: false, count: 0, error: "Participante inválido" };
  if (!rows.length) return { ok: false, count: 0, error: "Sin pronósticos" };

  const payload = rows.map((r) => ({
    participant_id: participantId,
    match_id: r.match_id,
    pred_home: r.pred_home,
    pred_away: r.pred_away,
  }));

  const sb = supabaseAdmin();

  // Recalcular puntos para partidos ya finalizados al cargar pronósticos.
  const { data: finishedMatches } = await sb
    .from("matches")
    .select("id, home_goals, away_goals")
    .eq("finished", true);
  const results = new Map(
    (finishedMatches ?? []).map((m) => [m.id, m])
  );

  const withPoints = payload.map((p) => {
    const res = results.get(p.match_id);
    let points: number | null = null;
    if (res && res.home_goals !== null && res.away_goals !== null) {
      points = scoreOf(p.pred_home, p.pred_away, res.home_goals, res.away_goals);
    }
    return { ...p, points };
  });

  const { error } = await sb
    .from("predictions")
    .upsert(withPoints, { onConflict: "participant_id,match_id" });
  if (error) return { ok: false, count: 0, error: error.message };

  revalidateAll();
  revalidatePath(`/participante/${participantId}`);
  return { ok: true, count: withPoints.length };
}

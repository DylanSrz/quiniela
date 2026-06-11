import { supabasePublic } from "./supabase";
import { computeStandings } from "./standings";
import type { Match, Participant, Prediction } from "./types";

export async function getParticipants(): Promise<Participant[]> {
  const sb = supabasePublic();
  const { data, error } = await sb
    .from("participants")
    .select("*")
    .order("display_name");
  if (error) throw error;
  return data ?? [];
}

export async function getMatches(): Promise<Match[]> {
  const sb = supabasePublic();
  const { data, error } = await sb.from("matches").select("*").order("id");
  if (error) throw error;
  return data ?? [];
}

export async function getPredictions(): Promise<Prediction[]> {
  const sb = supabasePublic();
  const { data, error } = await sb.from("predictions").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getStandings() {
  const [participants, predictions] = await Promise.all([
    getParticipants(),
    getPredictions(),
  ]);
  return computeStandings(participants, predictions);
}

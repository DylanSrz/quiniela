export type Participant = {
  id: number;
  display_name: string;
  avatar_emoji: string;
  created_at?: string;
};

export type Match = {
  id: number;
  code: string;
  group_letter: string;
  jornada: string;
  kickoff_utc: string;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
  finished: boolean;
};

export type Prediction = {
  participant_id: number;
  match_id: number;
  pred_home: number;
  pred_away: number;
  points: number | null;
};

export type StandingRow = {
  participant: Participant;
  points: number;
  exactos: number;
  resultados: number;
  jugados: number;
};

// Resultado estándar de una server action (para feedback en la UI con useActionState).
export type ActionResult = { ok: boolean; error?: string; message?: string };

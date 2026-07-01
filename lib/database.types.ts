// Tipos del esquema de Supabase para tipar los clientes y evitar casts manuales.
//
// Idealmente se generan con `supabase gen types typescript` (o el MCP de Supabase).
// Como en este entorno no hay acceso al proyecto, se mantienen a mano y reflejan
// los tipos de dominio de lib/types.ts. Si cambia el esquema, actualizar ambos.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: number;
          display_name: string;
          avatar_emoji: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          display_name: string;
          avatar_emoji?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          display_name?: string;
          avatar_emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
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
        Insert: {
          id?: number;
          code: string;
          group_letter: string;
          jornada: string;
          kickoff_utc: string;
          home_team: string;
          away_team: string;
          home_goals?: number | null;
          away_goals?: number | null;
          finished?: boolean;
        };
        Update: {
          id?: number;
          code?: string;
          group_letter?: string;
          jornada?: string;
          kickoff_utc?: string;
          home_team?: string;
          away_team?: string;
          home_goals?: number | null;
          away_goals?: number | null;
          finished?: boolean;
        };
        Relationships: [];
      };
      predictions: {
        Row: {
          participant_id: number;
          match_id: number;
          pred_home: number;
          pred_away: number;
          points: number | null;
        };
        Insert: {
          participant_id: number;
          match_id: number;
          pred_home: number;
          pred_away: number;
          points?: number | null;
        };
        Update: {
          participant_id?: number;
          match_id?: number;
          pred_home?: number;
          pred_away?: number;
          points?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

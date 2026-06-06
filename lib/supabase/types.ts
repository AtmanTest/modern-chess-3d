// ─── Types Supabase (générés partiellement) ───

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          elo: number;
          games_played: number;
          wins: number;
          losses: number;
          draws: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          elo?: number;
          games_played?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          elo?: number;
          games_played?: number;
          wins?: number;
          losses?: number;
          draws?: number;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          white_id: string;
          black_id: string;
          mode: string;
          time_control: string | null;
          result: string | null;
          end_reason: string | null;
          pgn: string | null;
          fen_final: string | null;
          ai_level: number | null;
          started_at: string;
          ended_at: string | null;
        };
      };
      moves: {
        Row: {
          id: string;
          game_id: string;
          move_number: number;
          notation: string;
          fen: string;
          played_at: string;
        };
      };
    };
  };
}

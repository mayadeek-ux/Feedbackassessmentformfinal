import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Construct Supabase URL from project ID
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'upcoming' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'upcoming' | 'active' | 'completed';
          start_date: string;
          end_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'upcoming' | 'active' | 'completed';
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'judge' | 'admin';
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'judge' | 'admin';
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'judge' | 'admin';
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          email: string | null;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          email?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          email?: string | null;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          event_id: string;
          judge_id: string;
          candidate_id: string | null;
          group_id: string | null;
          type: 'individual' | 'group';
          case_study: string;
          status: 'not_started' | 'in_progress' | 'submitted';
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          judge_id: string;
          candidate_id?: string | null;
          group_id?: string | null;
          type: 'individual' | 'group';
          case_study: string;
          status?: 'not_started' | 'in_progress' | 'submitted';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          judge_id?: string;
          candidate_id?: string | null;
          group_id?: string | null;
          type?: 'individual' | 'group';
          case_study?: string;
          status?: 'not_started' | 'in_progress' | 'submitted';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          assignment_id: string;
          scores: Record<string, boolean[]>;
          notes: string | null;
          total_score: number;
          performance_band: string;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          scores: Record<string, boolean[]>;
          notes?: string | null;
          total_score: number;
          performance_band: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          scores?: Record<string, boolean[]>;
          notes?: string | null;
          total_score?: number;
          performance_band?: string;
          submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
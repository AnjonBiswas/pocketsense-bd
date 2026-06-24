export type Database = {
  public: {
    Tables: {
      budgets: {
        Row: {
          emergency_reserve: number;
          id: string;
          monthly_limit: number;
          savings_goal: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          emergency_reserve?: number;
          id?: string;
          monthly_limit: number;
          savings_goal?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          emergency_reserve?: number;
          id?: string;
          monthly_limit?: number;
          savings_goal?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          date: string;
          id: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category: string;
          created_at?: string;
          date?: string;
          id?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          date?: string;
          id?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      incomes: {
        Row: {
          amount: number;
          created_at: string;
          date: string;
          id: string;
          is_recurring: boolean;
          note: string | null;
          source: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          date?: string;
          id?: string;
          is_recurring?: boolean;
          note?: string | null;
          source: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          date?: string;
          id?: string;
          is_recurring?: boolean;
          note?: string | null;
          source?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          name: string | null;
          university: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          name?: string | null;
          university?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          name?: string | null;
          university?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_challenges: {
        Row: {
          challenge_type: string;
          completed_at: string | null;
          id: string;
          progress: number;
          started_at: string;
          status: string;
          target: number;
          user_id: string;
        };
        Insert: {
          challenge_type: string;
          completed_at?: string | null;
          id?: string;
          progress?: number;
          started_at?: string;
          status?: string;
          target: number;
          user_id: string;
        };
        Update: {
          challenge_type?: string;
          completed_at?: string | null;
          id?: string;
          progress?: number;
          started_at?: string;
          status?: string;
          target?: number;
          user_id?: string;
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

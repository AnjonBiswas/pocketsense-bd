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
      budget_fixed_expenses: {
        Row: {
          amount: number;
          created_at: string;
          due_day: number | null;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          due_day?: number | null;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          due_day?: number | null;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      debts: {
        Row: {
          amount: number;
          created_at: string;
          direction: "owed_to_me" | "i_owe";
          due_date: string | null;
          friend_name: string;
          id: string;
          note: string | null;
          status: "pending" | "settled";
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          direction: "owed_to_me" | "i_owe";
          due_date?: string | null;
          friend_name: string;
          id?: string;
          note?: string | null;
          status?: "pending" | "settled";
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          direction?: "owed_to_me" | "i_owe";
          due_date?: string | null;
          friend_name?: string;
          id?: string;
          note?: string | null;
          status?: "pending" | "settled";
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
      expense_templates: {
        Row: {
          amount: number;
          category: string;
          created_at: string;
          id: string;
          note: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          category: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          title?: string;
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
      notification_preferences: {
        Row: {
          bill_due: boolean;
          challenge_completion: boolean;
          created_at: string;
          daily_budget: boolean;
          email_enabled: boolean;
          friend_owed: boolean;
          frequency: "immediate" | "daily" | "weekly";
          id: string;
          month_end_summary: boolean;
          overspending: boolean;
          push_enabled: boolean;
          sms_enabled: boolean;
          streak_milestone: boolean;
          tuition: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bill_due?: boolean;
          challenge_completion?: boolean;
          created_at?: string;
          daily_budget?: boolean;
          email_enabled?: boolean;
          friend_owed?: boolean;
          frequency?: "immediate" | "daily" | "weekly";
          id?: string;
          month_end_summary?: boolean;
          overspending?: boolean;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          streak_milestone?: boolean;
          tuition?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bill_due?: boolean;
          challenge_completion?: boolean;
          created_at?: string;
          daily_budget?: boolean;
          email_enabled?: boolean;
          friend_owed?: boolean;
          frequency?: "immediate" | "daily" | "weekly";
          id?: string;
          month_end_summary?: boolean;
          overspending?: boolean;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          streak_milestone?: boolean;
          tuition?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          action_url: string | null;
          created_at: string;
          id: string;
          message: string;
          read: boolean;
          title: string;
          type:
            | "daily_budget"
            | "overspending"
            | "bill_due"
            | "tuition"
            | "friend_owed"
            | "challenge_completion"
            | "streak_milestone"
            | "month_end_summary"
            | "sos"
            | "info";
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean;
          title: string;
          type:
            | "daily_budget"
            | "overspending"
            | "bill_due"
            | "tuition"
            | "friend_owed"
            | "challenge_completion"
            | "streak_milestone"
            | "month_end_summary"
            | "sos"
            | "info";
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean;
          title?: string;
          type?:
            | "daily_budget"
            | "overspending"
            | "bill_due"
            | "tuition"
            | "friend_owed"
            | "challenge_completion"
            | "streak_milestone"
            | "month_end_summary"
            | "sos"
            | "info";
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          academic_year: string | null;
          badges: string[] | null;
          id: string;
          current_streak: number | null;
          currency: string;
          deleted_at: string | null;
          first_day_of_month: number;
          phone: string | null;
          is_deleted: boolean;
          level: number | null;
          longest_streak: number | null;
          name: string | null;
          onboarding_completed: boolean;
          onboarding_step: number;
          semester: string | null;
          theme: string;
          university: string | null;
          avatar_url: string | null;
          created_at: string;
          xp: number | null;
        };
        Insert: {
          academic_year?: string | null;
          badges?: string[] | null;
          current_streak?: number | null;
          currency?: string;
          deleted_at?: string | null;
          first_day_of_month?: number;
          id: string;
          is_deleted?: boolean;
          level?: number | null;
          longest_streak?: number | null;
          phone?: string | null;
          name?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          semester?: string | null;
          theme?: string;
          university?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          xp?: number | null;
        };
        Update: {
          academic_year?: string | null;
          badges?: string[] | null;
          current_streak?: number | null;
          currency?: string;
          deleted_at?: string | null;
          first_day_of_month?: number;
          id?: string;
          is_deleted?: boolean;
          level?: number | null;
          longest_streak?: number | null;
          phone?: string | null;
          name?: string | null;
          onboarding_completed?: boolean;
          onboarding_step?: number;
          semester?: string | null;
          theme?: string;
          university?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          xp?: number | null;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          referral_code: string;
          referred_phone: string | null;
          referred_user_id: string | null;
          referrer_user_id: string;
          reward_xp: number;
          status: "pending" | "completed" | "cancelled";
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          referral_code: string;
          referred_phone?: string | null;
          referred_user_id?: string | null;
          referrer_user_id: string;
          reward_xp?: number;
          status?: "pending" | "completed" | "cancelled";
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          referral_code?: string;
          referred_phone?: string | null;
          referred_user_id?: string | null;
          referrer_user_id?: string;
          reward_xp?: number;
          status?: "pending" | "completed" | "cancelled";
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          amount: number | null;
          created_at: string;
          due_date: string;
          id: string;
          kind: "bill" | "tuition" | "budget_reset" | "custom";
          note: string | null;
          status: "pending" | "completed" | "cancelled";
          title: string;
          user_id: string;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          due_date: string;
          id?: string;
          kind: "bill" | "tuition" | "budget_reset" | "custom";
          note?: string | null;
          status?: "pending" | "completed" | "cancelled";
          title: string;
          user_id: string;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          due_date?: string;
          id?: string;
          kind?: "bill" | "tuition" | "budget_reset" | "custom";
          note?: string | null;
          status?: "pending" | "completed" | "cancelled";
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sos_modes: {
        Row: {
          activated_at: string;
          activated_tips: string[];
          compliance_score: number;
          days_remaining: number;
          deactivated_at: string | null;
          id: string;
          is_active: boolean;
          lock_pin_hash: string | null;
          locked_amount: number;
          remaining_budget: number;
          severity: "warning" | "critical";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          activated_at?: string;
          activated_tips?: string[];
          compliance_score?: number;
          days_remaining?: number;
          deactivated_at?: string | null;
          id?: string;
          is_active?: boolean;
          lock_pin_hash?: string | null;
          locked_amount?: number;
          remaining_budget?: number;
          severity?: "warning" | "critical";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          activated_at?: string;
          activated_tips?: string[];
          compliance_score?: number;
          days_remaining?: number;
          deactivated_at?: string | null;
          id?: string;
          is_active?: boolean;
          lock_pin_hash?: string | null;
          locked_amount?: number;
          remaining_budget?: number;
          severity?: "warning" | "critical";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      squad_expenses: {
        Row: {
          amount: number;
          created_at: string;
          custom_split: Json | null;
          date: string;
          description: string;
          id: string;
          paid_by: string;
          split_among: string[];
          split_type: "equal" | "custom";
          squad_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          custom_split?: Json | null;
          date?: string;
          description: string;
          id?: string;
          paid_by: string;
          split_among: string[];
          split_type?: "equal" | "custom";
          squad_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          custom_split?: Json | null;
          date?: string;
          description?: string;
          id?: string;
          paid_by?: string;
          split_among?: string[];
          split_type?: "equal" | "custom";
          squad_id?: string;
        };
        Relationships: [];
      };
      squad_settlements: {
        Row: {
          amount: number;
          created_at: string;
          from_user_id: string;
          id: string;
          note: string | null;
          settled_at: string | null;
          squad_id: string;
          status: "pending" | "paid";
          to_user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          from_user_id: string;
          id?: string;
          note?: string | null;
          settled_at?: string | null;
          squad_id: string;
          status?: "pending" | "paid";
          to_user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          from_user_id?: string;
          id?: string;
          note?: string | null;
          settled_at?: string | null;
          squad_id?: string;
          status?: "pending" | "paid";
          to_user_id?: string;
        };
        Relationships: [];
      };
      squads: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          members: string[];
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          members?: string[];
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          members?: string[];
          name?: string;
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
      user_preferences: {
        Row: {
          created_at: string;
          currency: string;
          first_day_of_month: number;
          id: string;
          language: "bn" | "en";
          theme: "light" | "dark" | "system";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          first_day_of_month?: number;
          id?: string;
          language?: "bn" | "en";
          theme?: "light" | "dark" | "system";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          first_day_of_month?: number;
          id?: string;
          language?: "bn" | "en";
          theme?: "light" | "dark" | "system";
          updated_at?: string;
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

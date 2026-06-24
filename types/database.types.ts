export type Database = {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

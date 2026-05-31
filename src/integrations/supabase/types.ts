export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at: string
          id: string
          ip_address: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          category: Database["public"]["Enums"]["audit_category"]
          created_at?: string
          id?: string
          ip_address?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          category?: Database["public"]["Enums"]["audit_category"]
          created_at?: string
          id?: string
          ip_address?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          pitch_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pitch_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pitch_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      database_backups: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          name: string
          size_bytes: number | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          name: string
          size_bytes?: number | null
          status: string
          type: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          name?: string
          size_bytes?: number | null
          status?: string
          type?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          amount_committed: number | null
          created_at: string
          id: string
          investor_id: string
          pitch_id: string
          platform_commission: number | null
          status: Database["public"]["Enums"]["deal_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_committed?: number | null
          created_at?: string
          id?: string
          investor_id: string
          pitch_id: string
          platform_commission?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_committed?: number | null
          created_at?: string
          id?: string
          investor_id?: string
          pitch_id?: string
          platform_commission?: number | null
          status?: Database["public"]["Enums"]["deal_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          bio: string | null
          city: string
          company_fund_name: string | null
          contact_number: string
          created_at: string | null
          full_name: string
          id: string
          investment_experience: string
          investment_sectors: string[] | null
          linkedin_url: string
          past_investments: string | null
          preferred_sectors: string | null
          preferred_stages: string[] | null
          profile_complete: boolean | null
          profile_photo_url: string | null
          reference_founder_1_email: string | null
          reference_founder_1_name: string | null
          reference_founder_2_email: string | null
          reference_founder_2_name: string | null
          sectors: string[] | null
          ticket_size_max: number | null
          ticket_size_min: number | null
          total_investments_count: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          bio?: string | null
          city: string
          company_fund_name?: string | null
          contact_number: string
          created_at?: string | null
          full_name: string
          id?: string
          investment_experience: string
          investment_sectors?: string[] | null
          linkedin_url: string
          past_investments?: string | null
          preferred_sectors?: string | null
          preferred_stages?: string[] | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          reference_founder_1_email?: string | null
          reference_founder_1_name?: string | null
          reference_founder_2_email?: string | null
          reference_founder_2_name?: string | null
          sectors?: string[] | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          total_investments_count?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          bio?: string | null
          city?: string
          company_fund_name?: string | null
          contact_number?: string
          created_at?: string | null
          full_name?: string
          id?: string
          investment_experience?: string
          investment_sectors?: string[] | null
          linkedin_url?: string
          past_investments?: string | null
          preferred_sectors?: string | null
          preferred_stages?: string[] | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          reference_founder_1_email?: string | null
          reference_founder_1_name?: string | null
          reference_founder_2_email?: string | null
          reference_founder_2_name?: string | null
          sectors?: string[] | null
          ticket_size_max?: number | null
          ticket_size_min?: number | null
          total_investments_count?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          pitch_id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pitch_id: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pitch_id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      pitches: {
        Row: {
          created_at: string
          deck_url: string | null
          funding_ask: string | null
          id: string
          market_size: string | null
          one_liner: string | null
          problem: string | null
          rejection_reason: string | null
          solution: string | null
          stage: Database["public"]["Enums"]["pitch_stage"] | null
          status: Database["public"]["Enums"]["pitch_status"]
          team_members: Json
          thumbnail_url: string | null
          title: string
          traction: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          created_at?: string
          deck_url?: string | null
          funding_ask?: string | null
          id?: string
          market_size?: string | null
          one_liner?: string | null
          problem?: string | null
          rejection_reason?: string | null
          solution?: string | null
          stage?: Database["public"]["Enums"]["pitch_stage"] | null
          status?: Database["public"]["Enums"]["pitch_status"]
          team_members?: Json
          thumbnail_url?: string | null
          title?: string
          traction?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          created_at?: string
          deck_url?: string | null
          funding_ask?: string | null
          id?: string
          market_size?: string | null
          one_liner?: string | null
          problem?: string | null
          rejection_reason?: string | null
          solution?: string | null
          stage?: Database["public"]["Enums"]["pitch_stage"] | null
          status?: Database["public"]["Enums"]["pitch_status"]
          team_members?: Json
          thumbnail_url?: string | null
          title?: string
          traction?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          bio: string | null
          city: string
          college: string
          contact_number: string | null
          cover_photo_url: string | null
          created_at: string | null
          experiences: Json | null
          full_name: string
          id: string
          identity_card_url: string | null
          industries: string | null
          industries_interest: string | null
          interests: string[] | null
          linkedin_url: string | null
          profile_complete: boolean | null
          profile_photo_url: string | null
          skills: string[] | null
          startup_interests: string[] | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          year: string
        }
        Insert: {
          bio?: string | null
          city: string
          college: string
          contact_number?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          experiences?: Json | null
          full_name: string
          id?: string
          identity_card_url?: string | null
          industries?: string | null
          industries_interest?: string | null
          interests?: string[] | null
          linkedin_url?: string | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          skills?: string[] | null
          startup_interests?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          year: string
        }
        Update: {
          bio?: string | null
          city?: string
          college?: string
          contact_number?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          experiences?: Json | null
          full_name?: string
          id?: string
          identity_card_url?: string | null
          industries?: string | null
          industries_interest?: string | null
          interests?: string[] | null
          linkedin_url?: string | null
          profile_complete?: boolean | null
          profile_photo_url?: string | null
          skills?: string[] | null
          startup_interests?: string[] | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          year?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reference_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reference_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "investor" | "admin" | "superadmin"
      audit_category:
        | "AUTH"
        | "PITCH"
        | "USER"
        | "SYSTEM"
        | "SETTINGS"
        | "INVESTOR"
      audit_severity: "INFO" | "WARN" | "ERROR"
      deal_status: "NEGOTIATING" | "SIGNED" | "CLOSED" | "DROPPED"
      pitch_stage: "IDEA" | "MVP" | "REVENUE" | "GROWTH"
      pitch_status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED"
      student_year:
        | "FIRST_YEAR"
        | "SECOND_YEAR"
        | "THIRD_YEAR"
        | "FOURTH_YEAR"
        | "ALUMNI"
      transaction_status: "SUCCESS" | "PENDING" | "FAILED"
      transaction_type: "SUBSCRIPTION" | "COMMISSION" | "OTHER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "investor", "admin", "superadmin"],
      audit_category: [
        "AUTH",
        "PITCH",
        "USER",
        "SYSTEM",
        "SETTINGS",
        "INVESTOR",
      ],
      audit_severity: ["INFO", "WARN", "ERROR"],
      deal_status: ["NEGOTIATING", "SIGNED", "CLOSED", "DROPPED"],
      pitch_stage: ["IDEA", "MVP", "REVENUE", "GROWTH"],
      pitch_status: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
      student_year: [
        "FIRST_YEAR",
        "SECOND_YEAR",
        "THIRD_YEAR",
        "FOURTH_YEAR",
        "ALUMNI",
      ],
      transaction_status: ["SUCCESS", "PENDING", "FAILED"],
      transaction_type: ["SUBSCRIPTION", "COMMISSION", "OTHER"],
    },
  },
} as const

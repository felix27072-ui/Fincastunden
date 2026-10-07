// Generated from the live Supabase schema. Regenerate after schema changes.
// Small domain aliases below preserve the app's stricter role/audit unions.

export type Role = "mitarbeiter" | "chef" | "steuer"
export type AuditEntity = "shift" | "payout" | "employee"
export type AuditAction = "insert" | "update" | "delete"

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
      audit_log: {
        Row: {
          action: AuditAction
          actor: string | null
          after: Json | null
          at: string
          before: Json | null
          entity: AuditEntity
          entity_id: string
          id: number
        }
        Insert: {
          action: AuditAction
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity: AuditEntity
          entity_id: string
          id?: number
        }
        Update: {
          action?: string
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity?: string
          entity_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          logs_hours: boolean
          name: string
          rate_cents: number
          role: Role
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id: string
          logs_hours?: boolean
          name: string
          rate_cents?: number
          role: Role
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          logs_hours?: boolean
          name?: string
          rate_cents?: number
          role?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          confirmed_by: string
          created_at: string
          employee_id: string
          id: string
          minutes: number
          paid_on: string
          signature_path: string | null
          total_cents: number
        }
        Insert: {
          confirmed_by: string
          created_at?: string
          employee_id: string
          id?: string
          minutes: number
          paid_on: string
          signature_path?: string | null
          total_cents: number
        }
        Update: {
          confirmed_by?: string
          created_at?: string
          employee_id?: string
          id?: string
          minutes?: number
          paid_on?: string
          signature_path?: string | null
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "payouts_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          created_by: string
          employee_id: string
          end_time: string
          id: string
          note: string | null
          paid: boolean
          paid_on: string | null
          payout_id: string | null
          start_time: string
          updated_at: string
          work_date: string
        }
        Insert: {
          created_at?: string
          created_by: string
          employee_id: string
          end_time: string
          id?: string
          note?: string | null
          paid?: boolean
          paid_on?: string | null
          payout_id?: string | null
          start_time: string
          updated_at?: string
          work_date: string
        }
        Update: {
          created_at?: string
          created_by?: string
          employee_id?: string
          end_time?: string
          id?: string
          note?: string | null
          paid?: boolean
          paid_on?: string | null
          payout_id?: string | null
          start_time?: string
          updated_at?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      audit_log_view: {
        Row: {
          action: AuditAction | null
          actor: string | null
          actor_name: string | null
          after: Json | null
          at: string | null
          before: Json | null
          entity: AuditEntity | null
          entity_id: string | null
          id: number | null
          subject_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_view: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          id: string | null
          logs_hours: boolean | null
          name: string | null
          rate_cents: number | null
          role: Role | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: never
          id?: string | null
          logs_hours?: boolean | null
          name?: string | null
          rate_cents?: never
          role?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: never
          id?: string | null
          logs_hours?: boolean | null
          name?: string | null
          rate_cents?: never
          role?: string | null
        }
        Relationships: []
      }
      shift_details: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          created_by: string | null
          employee_id: string | null
          employee_name: string | null
          end_time: string | null
          hours: number | null
          id: string | null
          minutes: number | null
          note: string | null
          paid: boolean | null
          paid_on: string | null
          payout_id: string | null
          rate_cents: number | null
          start_time: string | null
          updated_at: string | null
          work_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_employee_role: { Args: never; Returns: string }
      create_payout: {
        Args: {
          p_employee_id: string
          p_id: string
          p_shift_ids: string[]
          p_signature_path: string
        }
        Returns: {
          confirmed_by: string
          created_at: string
          employee_id: string
          id: string
          minutes: number
          paid_on: string
          signature_path: string | null
          total_cents: number
        }
        SetofOptions: {
          from: "*"
          to: "payouts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_privileged: { Args: never; Returns: boolean }
      shift_amount_cents: {
        Args: { p_end: string; p_rate_cents: number; p_start: string }
        Returns: number
      }
      shift_minutes: {
        Args: { p_end: string; p_start: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

export type PayoutRow = Database["public"]["Tables"]["payouts"]["Row"]

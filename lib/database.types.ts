// Handgepflegte Typen passend zu supabase/migrations/0001_init.sql.
// Bei Schemaänderungen hier mitziehen (oder später per
// `supabase gen types typescript` ersetzen).

export type Role = "mitarbeiter" | "chef" | "steuer";
export type AuditEntity = "shift" | "payout" | "employee";
export type AuditAction = "insert" | "update" | "delete";

export type PayoutRow = {
  id: string;
  employee_id: string;
  paid_on: string;
  total_cents: number;
  minutes: number;
  signature_path: string | null;
  confirmed_by: string;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          rate_cents: number;
          role: Role;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          rate_cents?: number;
          role: Role;
          active?: boolean;
        };
        Update: Partial<{
          name: string;
          email: string;
          rate_cents: number;
          role: Role;
          active: boolean;
        }>;
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          employee_id: string;
          work_date: string;
          start_time: string;
          end_time: string;
          note: string | null;
          paid: boolean;
          paid_on: string | null;
          payout_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          work_date: string;
          start_time: string;
          end_time: string;
          note?: string | null;
          paid?: boolean;
          paid_on?: string | null;
          payout_id?: string | null;
          created_by: string;
        };
        Update: Partial<{
          work_date: string;
          start_time: string;
          end_time: string;
          note: string | null;
          paid: boolean;
          paid_on: string | null;
          payout_id: string | null;
        }>;
        Relationships: [];
      };
      payouts: {
        Row: PayoutRow;
        Insert: {
          id?: string;
          employee_id: string;
          paid_on: string;
          total_cents: number;
          minutes: number;
          signature_path?: string | null;
          confirmed_by: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: number;
          entity: AuditEntity;
          entity_id: string;
          action: AuditAction;
          before: Record<string, unknown> | null;
          after: Record<string, unknown> | null;
          actor: string | null;
          at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_fkey";
            columns: ["actor"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      employees_view: {
        Row: {
          id: string;
          name: string;
          role: Role;
          active: boolean;
          created_at: string;
          email: string | null;
          rate_cents: number | null;
        };
        Relationships: [];
      };
      shift_details: {
        Row: {
          id: string;
          employee_id: string;
          employee_name: string;
          work_date: string;
          start_time: string;
          end_time: string;
          minutes: number;
          hours: number;
          note: string | null;
          paid: boolean;
          paid_on: string | null;
          payout_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          rate_cents: number | null;
          amount_cents: number | null;
        };
        Relationships: [];
      };
      audit_log_view: {
        Row: {
          id: number;
          entity: AuditEntity;
          entity_id: string;
          action: AuditAction;
          before: Record<string, unknown> | null;
          after: Record<string, unknown> | null;
          actor: string | null;
          actor_name: string | null;
          at: string;
          subject_name: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      shift_minutes: {
        Args: { p_start: string; p_end: string };
        Returns: number;
      };
      shift_amount_cents: {
        Args: { p_start: string; p_end: string; p_rate_cents: number };
        Returns: number;
      };
      create_payout: {
        Args: {
          p_id: string;
          p_employee_id: string;
          p_shift_ids: string[];
          p_signature_path: string | null;
        };
        Returns: PayoutRow;
      };
    };
  };
}

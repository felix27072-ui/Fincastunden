import type { Role } from "@/lib/database.types";

export type StaffMember = {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  rate_cents: number | null;
};

export type ShiftDetail = {
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
  rate_cents: number | null;
  amount_cents: number | null;
};

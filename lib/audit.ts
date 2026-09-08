import type { AuditAction, AuditEntity } from "@/lib/database.types";
import { dLabel, eur } from "@/lib/format";

export type AuditLogEntry = {
  id: number;
  entity: AuditEntity;
  action: AuditAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  actor_name: string | null;
  at: string;
  subject_name: string | null;
};

const ACTION_LABEL: Record<AuditEntity, Record<AuditAction, string>> = {
  shift: { insert: "Schicht angelegt", update: "Schicht geändert", delete: "Schicht gelöscht" },
  payout: {
    insert: "Auszahlung gebucht",
    update: "Auszahlung geändert",
    delete: "Auszahlung gelöscht",
  },
  employee: {
    insert: "Mitarbeiter angelegt",
    update: "Mitarbeiter geändert",
    delete: "Mitarbeiter gelöscht",
  },
};

export function auditTitle(row: Pick<AuditLogEntry, "entity" | "action">): string {
  return ACTION_LABEL[row.entity][row.action];
}

export function auditDetail(row: AuditLogEntry): string {
  const data = (row.after ?? row.before) as Record<string, unknown> | null;
  const who = row.subject_name ?? "—";

  if (row.entity === "shift" && data) {
    const start = typeof data.start_time === "string" ? data.start_time.slice(0, 5) : "?";
    const end = typeof data.end_time === "string" ? data.end_time.slice(0, 5) : "?";
    const date = typeof data.work_date === "string" ? dLabel(data.work_date) : "?";
    return `${who} · ${date} · ${start}–${end}`;
  }
  if (row.entity === "payout" && data) {
    const amount = typeof data.total_cents === "number" ? eur(data.total_cents / 100) : "?";
    const date = typeof data.paid_on === "string" ? dLabel(data.paid_on) : "?";
    return `${who} · ${amount} · ${date}`;
  }
  if (row.entity === "employee" && data) {
    return `${who} · ${typeof data.role === "string" ? data.role : ""}`;
  }
  return who;
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PayoutRow } from "@/lib/database.types";
import type { AuditLogEntry } from "@/lib/audit";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type CreatePayoutInput = {
  employeeId: string;
  shiftIds: string[];
  signatureDataUrl: string | null;
};

// Next.js redigiert Fehlermeldungen aus geworfenen Errors in Server Actions
// im Produktions-Build (nur ein "digest" kommt beim Client an) — erwartbare
// Fehler deshalb als Rückgabewert modellieren statt zu werfen, wie von
// Next.js empfohlen.
export type CreatePayoutResult =
  | { ok: false; error: string }
  | { ok: true; payout: PayoutRow };

export async function createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht angemeldet." };
  if (!input.shiftIds.length) return { ok: false, error: "Keine Schichten ausgewählt." };

  const payoutId = crypto.randomUUID();
  let signaturePath: string | null = null;

  if (input.signatureDataUrl) {
    const base64 = input.signatureDataUrl.split(",")[1] ?? "";
    signaturePath = `${input.employeeId}/${payoutId}.png`;
    const { error: uploadError } = await supabase.storage
      .from("signatures")
      .upload(signaturePath, Buffer.from(base64, "base64"), { contentType: "image/png" });
    if (uploadError) return { ok: false, error: uploadError.message };
  }

  const { data, error } = await supabase.rpc("create_payout", {
    p_id: payoutId,
    p_employee_id: input.employeeId,
    p_shift_ids: input.shiftIds,
    p_signature_path: signaturePath,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/woche");
  revalidatePath("/meine");
  revalidatePath("/abrechnung");

  return { ok: true, payout: data };
}

export type PayoutShiftLine = {
  id: string;
  work_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  amount_cents: number | null;
};

export async function getPayoutShifts(payoutId: string): Promise<PayoutShiftLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shift_details")
    .select("id, work_date, start_time, end_time, hours, amount_cents")
    .eq("payout_id", payoutId)
    .order("work_date");
  if (error || !data) return [];
  return data;
}

export async function getSignatureUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("signatures")
    .createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}

export async function getOpenShiftsForEmployee(
  employeeId: string
): Promise<PayoutShiftLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shift_details")
    .select("id, work_date, start_time, end_time, hours, amount_cents")
    .eq("employee_id", employeeId)
    .eq("paid", false)
    .order("work_date", { ascending: false });
  if (error || !data) return [];
  return data;
}

export async function getAuditLog(limit = 300): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log_view")
    .select("id, entity, action, before, after, actor_name, at, subject_name")
    .order("at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

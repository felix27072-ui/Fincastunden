"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PayoutRow } from "@/lib/database.types";

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

export async function createPayout(input: CreatePayoutInput): Promise<PayoutRow> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");
  if (!input.shiftIds.length) throw new Error("Keine Schichten ausgewählt.");

  const payoutId = crypto.randomUUID();
  let signaturePath: string | null = null;

  if (input.signatureDataUrl) {
    const base64 = input.signatureDataUrl.split(",")[1] ?? "";
    signaturePath = `${input.employeeId}/${payoutId}.png`;
    const { error: uploadError } = await supabase.storage
      .from("signatures")
      .upload(signaturePath, Buffer.from(base64, "base64"), { contentType: "image/png" });
    if (uploadError) throw new Error(uploadError.message);
  }

  const { data, error } = await supabase.rpc("create_payout", {
    p_id: payoutId,
    p_employee_id: input.employeeId,
    p_shift_ids: input.shiftIds,
    p_signature_path: signaturePath,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/woche");
  revalidatePath("/meine");

  return data;
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

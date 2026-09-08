"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ShiftInput = {
  id?: string;
  employee_id: string;
  work_date: string;
  start_time: string;
  end_time: string;
  note: string | null;
};

export async function saveShift(input: ShiftInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");

  if (input.id) {
    const { error } = await supabase
      .from("shifts")
      .update({
        work_date: input.work_date,
        start_time: input.start_time,
        end_time: input.end_time,
        note: input.note,
      })
      .eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("shifts").insert({
      employee_id: input.employee_id,
      work_date: input.work_date,
      start_time: input.start_time,
      end_time: input.end_time,
      note: input.note,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/woche");
  revalidatePath("/meine");
}

export async function deleteShift(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/woche");
  revalidatePath("/meine");
}

export type HistoryEntry = { at: string; action: string; who: string };

const ACTION_LABEL: Record<string, string> = {
  insert: "Schicht angelegt",
  update: "Schicht geändert",
  delete: "Schicht gelöscht",
};

export async function getShiftHistory(shiftId: string): Promise<HistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("at, action, actor:employees!audit_log_actor_fkey(name)")
    .eq("entity", "shift")
    .eq("entity_id", shiftId)
    .order("at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    at: row.at,
    action: ACTION_LABEL[row.action] ?? row.action,
    who: (row.actor as { name: string } | null)?.name ?? "—",
  }));
}

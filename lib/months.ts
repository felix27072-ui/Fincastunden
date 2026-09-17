import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { addMonths, monthKey, today } from "@/lib/format";

/**
 * Alle Monate mit mindestens einer Schicht, plus immer der aktuelle und der
 * nächste Monat — auch ohne Schichten wählbar, damit sich z. B. schon jetzt
 * eine Schicht für Anfang nächsten Monats eintragen lässt.
 */
export async function getAvailableMonths(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data } = await supabase
    .from("shifts")
    .select("work_date")
    .order("work_date", { ascending: false });

  const monthSet = new Set((data ?? []).map((r) => monthKey(r.work_date)));
  monthSet.add(monthKey(today()));
  monthSet.add(addMonths(monthKey(today()), 1));
  return [...monthSet].sort().reverse();
}

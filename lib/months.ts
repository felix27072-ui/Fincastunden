import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { addMonths, monthKey, today } from "@/lib/format";

/**
 * Jeder Monat des laufenden Kalenderjahres (zum Zurückblättern bei
 * Differenzen, auch ohne Schichten), plus der nächste Monat, plus jeder
 * Monat mit tatsächlichen Schichten (deckt auch frühere Jahre ab).
 */
export async function getAvailableMonths(
  supabase: SupabaseClient<Database>
): Promise<string[]> {
  const { data } = await supabase
    .from("shifts")
    .select("work_date")
    .order("work_date", { ascending: false });

  const monthSet = new Set((data ?? []).map((r) => monthKey(r.work_date)));
  const year = Number(monthKey(today()).slice(0, 4));
  for (let m = 1; m <= 12; m++) {
    monthSet.add(`${year}-${String(m).padStart(2, "0")}`);
  }
  monthSet.add(addMonths(monthKey(today()), 1));
  return [...monthSet].sort().reverse();
}

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import MeineClient from "./MeineClient";
import type { ShiftDetail } from "@/app/(app)/woche/types";

export default async function MeinePage() {
  const me = await getCurrentEmployee();
  if (!me) return null; // Layout leitet bereits um.

  if (me.role !== "mitarbeiter") {
    return (
      <p className="mt-4 text-sm text-muted">
        Für dieses Konto sind keine eigenen Schichten hinterlegt. Nutze die Woche oder die
        Abrechnung.
      </p>
    );
  }

  const supabase = await createClient();
  const { data: shiftRows } = await supabase
    .from("shift_details")
    .select(
      "id, employee_id, employee_name, work_date, start_time, end_time, minutes, hours, note, paid, paid_on, rate_cents, amount_cents"
    )
    .eq("employee_id", me.id)
    .order("work_date", { ascending: false });

  const shifts: ShiftDetail[] = shiftRows ?? [];

  return (
    <MeineClient me={{ id: me.id, name: me.name, rate_cents: me.rate_cents }} shifts={shifts} />
  );
}

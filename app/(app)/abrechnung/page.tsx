import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import { getAvailableMonths } from "@/lib/months";
import { monthLabel, monthRange } from "@/lib/format";
import MonthSelect from "@/components/MonthSelect";
import AbrechnungClient from "./AbrechnungClient";
import type { ShiftDetail } from "@/app/(app)/woche/types";
import type { PayoutRow } from "@/lib/database.types";

export default async function AbrechnungPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const me = await getCurrentEmployee();
  if (!me) return null; // Layout leitet bereits um.
  if (me.role === "mitarbeiter") redirect("/woche");

  const supabase = await createClient();
  const months = await getAvailableMonths(supabase);
  const mk = month && months.includes(month) ? month : months[0];
  const [first, last] = monthRange(mk);

  const [{ data: staffRows }, { data: shiftRows }, { data: payoutRows }, { data: openRows }] =
    await Promise.all([
      supabase.from("employees_view").select("id, name, active").eq("role", "mitarbeiter").order("name"),
      supabase
        .from("shift_details")
        .select(
          "id, employee_id, employee_name, work_date, start_time, end_time, minutes, hours, note, paid, paid_on, rate_cents, amount_cents"
        )
        .gte("work_date", first)
        .lte("work_date", last)
        .order("work_date"),
      supabase.from("payouts").select("*").order("paid_on", { ascending: false }).limit(200),
      supabase.from("shift_details").select("employee_id, amount_cents").eq("paid", false),
    ]);

  const staff: { id: string; name: string; active: boolean }[] = staffRows ?? [];
  const monthShifts: ShiftDetail[] = shiftRows ?? [];
  const payouts: PayoutRow[] = payoutRows ?? [];

  const openSumByEmployee = new Map<string, number>();
  for (const row of openRows ?? []) {
    openSumByEmployee.set(
      row.employee_id,
      (openSumByEmployee.get(row.employee_id) ?? 0) + (row.amount_cents ?? 0)
    );
  }

  return (
    <>
      <MonthSelect months={months} value={mk} monthLabel={monthLabel} basePath="/abrechnung" />
      <AbrechnungClient
        canPayout={me.role === "chef"}
        mk={mk}
        staff={staff}
        monthShifts={monthShifts}
        payouts={payouts}
        openSumByEmployee={Object.fromEntries(openSumByEmployee)}
      />
    </>
  );
}

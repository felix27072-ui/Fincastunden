import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import { addDays, isoWeek, monthKey, monthLabel, mondayOf, today, weeksOfMonth, dShort } from "@/lib/format";
import MonthSelect from "@/components/MonthSelect";
import WeekGrid from "./WeekGrid";
import type { ShiftDetail, StaffMember } from "./types";

export default async function WochePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; week?: string }>;
}) {
  const { month, week } = await searchParams;
  const me = await getCurrentEmployee();
  if (!me) return null; // Layout leitet bereits um.

  const supabase = await createClient();

  const [{ data: dateRows }, { data: staffRows }] = await Promise.all([
    supabase.from("shifts").select("work_date").order("work_date", { ascending: false }),
    supabase
      .from("employees_view")
      .select("id, name, role, active, rate_cents")
      .eq("role", "mitarbeiter")
      .eq("active", true)
      .order("name"),
  ]);

  const monthSet = new Set((dateRows ?? []).map((r) => monthKey(r.work_date)));
  monthSet.add(monthKey(today()));
  const months = [...monthSet].sort().reverse();

  const mk = month && months.includes(month) ? month : months[0];
  const weeks = weeksOfMonth(mk);
  const wantedWeek = week && weeks.includes(week) ? week : mondayOf(today());
  const monday = weeks.includes(wantedWeek) ? wantedWeek : weeks[0];
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const { data: shiftRows } = await supabase
    .from("shift_details")
    .select(
      "id, employee_id, employee_name, work_date, start_time, end_time, minutes, hours, note, paid, paid_on, rate_cents, amount_cents"
    )
    .gte("work_date", days[0])
    .lte("work_date", days[6])
    .order("work_date")
    .order("start_time");

  const staff: StaffMember[] = staffRows ?? [];
  const shifts: ShiftDetail[] = shiftRows ?? [];

  return (
    <>
      <MonthSelect months={months} value={mk} monthLabel={monthLabel} />

      <div className="flex gap-1.5 overflow-x-auto pb-1 pt-2.5">
        {weeks.map((m) => (
          <Link
            key={m}
            href={`/woche?month=${mk}&week=${m}`}
            className={`shrink-0 border px-[11px] py-2 text-xs ${
              m === monday
                ? "border-naranja bg-naranja text-white"
                : "border-line text-muted"
            }`}
          >
            KW {isoWeek(m)} · {dShort(m)}
          </Link>
        ))}
      </div>

      <WeekGrid me={me} staff={staff} shifts={shifts} days={days} monday={monday} />
    </>
  );
}

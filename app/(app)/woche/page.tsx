import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import { addDays, isoWeek, monthLabel, mondayOf, today, weeksOfMonth, dShort } from "@/lib/format";
import { getAvailableMonths } from "@/lib/months";
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

  const [months, { data: staffRows }] = await Promise.all([
    getAvailableMonths(supabase),
    supabase
      .from("employees_view")
      .select("id, name, role, active, rate_cents")
      .eq("role", "mitarbeiter")
      .eq("active", true)
      .order("name"),
  ]);

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

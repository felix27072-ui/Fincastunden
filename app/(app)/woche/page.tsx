import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee } from "@/lib/auth";
import { isoWeek, mondayOf, monthKey, today, weeksOfMonth, weekDaysInMonth, dShort } from "@/lib/format";
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
      .or("role.eq.mitarbeiter,and(role.eq.chef,logs_hours.eq.true)")
      .eq("active", true)
      .order("name"),
  ]);

  const currentMonth = monthKey(today());
  const mk = month && months.includes(month) ? month : currentMonth;
  const weeks = weeksOfMonth(mk);
  const wantedWeek = week && weeks.includes(week) ? week : mondayOf(today());
  const monday = weeks.includes(wantedWeek) ? wantedWeek : weeks[0];
  const days = weekDaysInMonth(monday, mk);

  const { data: shiftRows } = await supabase
    .from("shift_details")
    .select(
      "id, employee_id, employee_name, work_date, start_time, end_time, minutes, hours, note, paid, paid_on, rate_cents, amount_cents"
    )
    .gte("work_date", days[0])
    .lte("work_date", days[days.length - 1])
    .order("work_date")
    .order("start_time");

  const staff: StaffMember[] = staffRows ?? [];
  const shifts: ShiftDetail[] = shiftRows ?? [];

  return (
    <>
      <MonthSelect months={months} value={mk} />

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-line bg-surface p-2">
        <Link aria-label="Vorherige Woche" href={(() => { const i = weeks.indexOf(monday); const previousMonth = new Date(mk + "-01T12:00:00"); previousMonth.setMonth(previousMonth.getMonth() - 1); const pm = monthKey(previousMonth.toISOString().slice(0, 10)); const pw = weeksOfMonth(pm); return i > 0 ? `/woche?month=${mk}&week=${weeks[i-1]}` : `/woche?month=${pm}&week=${pw[pw.length-1]}`; })()} className="rounded-lg border border-line px-4 py-3 text-sm font-bold" >←</Link>
        <div className="min-w-0 text-center"><div className="text-sm font-bold">KW {isoWeek(monday)} · {dShort(days[0])} – {dShort(days[days.length - 1])}</div><Link href="/woche" className="text-xs font-semibold text-naranja">Heute / aktuelle Woche</Link></div>
        <Link aria-label="Nächste Woche" href={(() => { const i = weeks.indexOf(monday); const nextMonth = new Date(mk + "-01T12:00:00"); nextMonth.setMonth(nextMonth.getMonth() + 1); const nm = monthKey(nextMonth.toISOString().slice(0, 10)); const nw = weeksOfMonth(nm); return i < weeks.length-1 ? `/woche?month=${mk}&week=${weeks[i+1]}` : `/woche?month=${nm}&week=${nw[0]}`; })()} className="rounded-lg border border-line px-4 py-3 text-sm font-bold">→</Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 pt-3 lg:flex-wrap">
        {weeks.map((m) => (
          <Link key={m} href={`/woche?month=${mk}&week=${m}`} className={`shrink-0 rounded-lg border px-3 py-2.5 text-xs font-semibold ${m === monday ? "border-naranja bg-naranja text-white" : "border-line text-muted"}`}>
            KW {isoWeek(m)} · {dShort(weekDaysInMonth(m, mk)[0])}
          </Link>
        ))}
      </div>

      <WeekGrid me={me} staff={staff} shifts={shifts} days={days} monday={monday} />
    </>
  );
}

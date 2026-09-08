"use client";

import { useState } from "react";
import { DAYS, dShort, eur, hrs, isoWeek } from "@/lib/format";
import DaySheet from "./DaySheet";
import ShiftSheet, { type EditableShift } from "./ShiftSheet";
import { getShiftHistory, type HistoryEntry } from "./actions";
import type { ShiftDetail, StaffMember } from "./types";

type SheetState =
  | { kind: "day"; empId: string; empName: string; date: string }
  | { kind: "edit"; isNew: boolean; shift: EditableShift };

export default function WeekGrid({
  me,
  staff,
  shifts,
  days,
  monday,
}: {
  me: { id: string; role: "mitarbeiter" | "chef" | "steuer" };
  staff: StaffMember[];
  shifts: ShiftDetail[];
  days: string[];
  monday: string;
}) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const canEdit = me.role !== "steuer";
  const seesMoneyOfAll = me.role !== "mitarbeiter";

  const cell = (empId: string, date: string) =>
    shifts
      .filter((s) => s.employee_id === empId && s.work_date === date)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const weekHours = shifts.reduce((n, s) => n + s.hours, 0);
  const weekAmount = shifts.reduce((n, s) => n + (s.amount_cents ?? 0), 0) / 100;

  function openDay(emp: StaffMember, date: string) {
    const editable = canEdit && (me.role === "chef" || emp.id === me.id);
    if (!editable) return;
    setSheet({ kind: "day", empId: emp.id, empName: emp.name, date });
  }

  function openEdit(s: ShiftDetail) {
    setSheet({
      kind: "edit",
      isNew: false,
      shift: {
        id: s.id,
        employee_id: s.employee_id,
        employee_name: s.employee_name,
        work_date: s.work_date,
        start_time: s.start_time,
        end_time: s.end_time,
        note: s.note ?? "",
        paid: s.paid,
        paid_on: s.paid_on,
        rate_cents: s.rate_cents ?? 0,
      },
    });
    getShiftHistory(s.id).then(setHistory);
  }

  function openNew(empId: string, empName: string, date: string, rateCents: number) {
    setSheet({
      kind: "edit",
      isNew: true,
      shift: {
        employee_id: empId,
        employee_name: empName,
        work_date: date,
        start_time: "18:00",
        end_time: "23:30",
        note: "",
        paid: false,
        paid_on: null,
        rate_cents: rateCents,
      },
    });
    setHistory([]);
  }

  return (
    <>
      <div className="mt-3 border border-line">
        <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))] bg-naranja">
          <div className="self-center px-1.5 py-1.5 text-[10px] font-bold tracking-[0.1em] text-white">
            NAME
          </div>
          {days.map((iso, i) => (
            <div key={iso} className="border-l border-white/25 px-0.5 py-1.5 text-center">
              <div className="text-xs font-bold text-white">{DAYS[i]}</div>
              <div className="tabular-nums text-[9px] text-white/85">{dShort(iso)}</div>
            </div>
          ))}
        </div>

        {staff.map((emp) => {
          const rowHours = days.reduce(
            (n, iso) => n + cell(emp.id, iso).reduce((m, s) => m + s.hours, 0),
            0
          );
          return (
            <div
              key={emp.id}
              className={`grid grid-cols-[58px_repeat(7,minmax(0,1fr))] border-t border-line ${
                emp.id === me.id ? "bg-naranja/10" : ""
              }`}
            >
              <div className="self-center overflow-hidden px-1.5 py-2">
                <div
                  className={`truncate text-xs ${emp.id === me.id ? "font-bold" : "font-medium"}`}
                >
                  {emp.name.split(" ")[0]}
                </div>
                <div className="tabular-nums text-[10px] text-muted">
                  {rowHours ? `${hrs(rowHours)} h` : "—"}
                </div>
              </div>
              {days.map((iso) => {
                const list = cell(emp.id, iso);
                const h = list.reduce((n, s) => n + s.hours, 0);
                const open = list.some((s) => !s.paid);
                const editable = canEdit && (me.role === "chef" || emp.id === me.id);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => openDay(emp, iso)}
                    className={`week-cell min-h-[48px] border-l border-line px-px py-2 text-center text-crema ${
                      editable ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    {h > 0 ? (
                      <>
                        <div
                          className="tabular-nums text-[15px] font-bold"
                          style={{ color: open ? "var(--color-naranja)" : "var(--color-verde)" }}
                        >
                          {hrs(h)}
                        </div>
                        <div className="week-cell-times tabular-nums text-[9px] leading-tight text-muted">
                          {list[0].start_time.slice(0, 5)}–{list[list.length - 1].end_time.slice(0, 5)}
                        </div>
                      </>
                    ) : (
                      <span className={`text-[17px] ${editable ? "text-line" : "text-transparent"}`}>
                        +
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="tabular-nums mt-2.5 flex justify-between text-[13px] text-muted">
        <span>KW {isoWeek(monday)} gesamt</span>
        <span className="font-bold text-crema">
          {hrs(weekHours)} h{seesMoneyOfAll && ` · ${eur(weekAmount)}`}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Orange heißt offen, grün heißt ausbezahlt. Tippe auf einen Tag, um einzutragen.
      </p>

      {sheet?.kind === "day" && (
        <DaySheet
          empName={sheet.empName}
          date={sheet.date}
          shifts={cell(sheet.empId, sheet.date)}
          onClose={() => setSheet(null)}
          onEdit={openEdit}
          onNew={() => {
            const emp = staff.find((e) => e.id === sheet.empId);
            openNew(sheet.empId, sheet.empName, sheet.date, emp?.rate_cents ?? 0);
          }}
        />
      )}
      {sheet?.kind === "edit" && (
        <ShiftSheet
          shift={sheet.shift}
          isNew={sheet.isNew}
          history={history}
          onClose={() => setSheet(null)}
          onSaved={() => setSheet(null)}
        />
      )}
    </>
  );
}

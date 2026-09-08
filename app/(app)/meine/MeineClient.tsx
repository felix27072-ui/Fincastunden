"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ShiftRow from "@/components/ui/ShiftRow";
import PayoutSheet, { type OpenShift } from "@/components/payout/PayoutSheet";
import ReceiptView from "@/components/payout/ReceiptView";
import ShiftSheet, { type EditableShift } from "@/app/(app)/woche/ShiftSheet";
import { getShiftHistory, type HistoryEntry } from "@/app/(app)/woche/actions";
import { eur, hrs, today } from "@/lib/format";
import type { PayoutRow } from "@/lib/database.types";
import type { ShiftDetail } from "@/app/(app)/woche/types";

type SheetState =
  | { kind: "edit"; isNew: boolean; shift: EditableShift }
  | { kind: "payout" }
  | { kind: "receipt"; payout: PayoutRow };

export default function MeineClient({
  me,
  shifts,
}: {
  me: { id: string; name: string; rate_cents: number };
  shifts: ShiftDetail[];
}) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const open = shifts.filter((s) => !s.paid);
  const openSum = open.reduce((n, s) => n + (s.amount_cents ?? 0), 0) / 100;
  const openHours = open.reduce((n, s) => n + s.hours, 0);

  const openShifts: OpenShift[] = open.map((s) => ({
    id: s.id,
    work_date: s.work_date,
    start_time: s.start_time,
    end_time: s.end_time,
    hours: s.hours,
    amount_cents: s.amount_cents,
  }));

  function openNew() {
    setSheet({
      kind: "edit",
      isNew: true,
      shift: {
        employee_id: me.id,
        employee_name: me.name,
        work_date: today(),
        start_time: "18:00",
        end_time: "23:30",
        note: "",
        paid: false,
        paid_on: null,
        rate_cents: me.rate_cents,
      },
    });
    setHistory([]);
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
        rate_cents: s.rate_cents ?? me.rate_cents,
      },
    });
    getShiftHistory(s.id).then(setHistory);
  }

  return (
    <>
      <div className="border border-line bg-surface p-4">
        <div className="text-[11px] tracking-[0.14em] text-muted">OFFEN | PENDIENTE</div>
        <div className="tabular-nums mt-1 text-[38px] font-bold leading-tight tracking-tight text-naranja">
          {eur(openSum)}
        </div>
        <div className="tabular-nums text-[13px] text-muted">
          {hrs(openHours)} h aus {open.length} Schicht{open.length === 1 ? "" : "en"} ·{" "}
          {eur(me.rate_cents / 100)} pro Stunde
        </div>
        <div className="mt-3.5 flex gap-2">
          <Button onClick={openNew} className="flex-1">
            Schicht eintragen
          </Button>
          <Button
            variant="outline"
            onClick={() => setSheet({ kind: "payout" })}
            disabled={!open.length}
          >
            Auszahlen
          </Button>
        </div>
      </div>

      <div className="mt-5 border-t border-line">
        {shifts.map((s) => (
          <ShiftRow
            key={s.id}
            date={s.work_date}
            start={s.start_time.slice(0, 5)}
            end={s.end_time.slice(0, 5)}
            hours={s.hours}
            note={s.note}
            paid={s.paid}
            paidOn={s.paid_on}
            amountCents={s.amount_cents}
            onClick={() => openEdit(s)}
          />
        ))}
        {!shifts.length && <p className="pt-3.5 text-sm text-muted">Noch nichts eingetragen.</p>}
      </div>

      {sheet?.kind === "edit" && (
        <ShiftSheet
          shift={sheet.shift}
          isNew={sheet.isNew}
          history={history}
          onClose={() => setSheet(null)}
          onSaved={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "payout" && (
        <PayoutSheet
          employeeId={me.id}
          employeeName={me.name}
          openShifts={openShifts}
          onClose={() => setSheet(null)}
          onConfirm={(payout) => setSheet({ kind: "receipt", payout })}
        />
      )}
      {sheet?.kind === "receipt" && (
        <ReceiptView payout={sheet.payout} employeeName={me.name} onClose={() => setSheet(null)} />
      )}
    </>
  );
}

"use client";

import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import ShiftRow from "@/components/ui/ShiftRow";
import { dLabel } from "@/lib/format";
import type { ShiftDetail } from "./types";

export default function DaySheet({
  empName,
  date,
  shifts,
  onClose,
  onEdit,
  onNew,
}: {
  empName: string;
  date: string;
  shifts: ShiftDetail[];
  onClose: () => void;
  onEdit: (shift: ShiftDetail) => void;
  onNew: () => void;
}) {
  return (
    <Sheet title={`${empName} · ${dLabel(date)}`} onClose={onClose}>
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
          onClick={() => onEdit(s)}
        />
      ))}
      {!shifts.length && (
        <p className="py-1.5 text-sm text-muted">Für diesen Tag ist nichts eingetragen.</p>
      )}
      <Button onClick={onNew} className="mt-3 w-full">
        Schicht hinzufügen
      </Button>
    </Sheet>
  );
}

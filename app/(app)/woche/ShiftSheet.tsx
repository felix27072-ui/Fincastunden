"use client";

import { useState, useTransition } from "react";
import Sheet from "@/components/ui/Sheet";
import Field, { inputClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { dLabel, eur, hoursBetween, hrs } from "@/lib/format";
import { saveShift, deleteShift } from "./actions";

const toHM = (t: string) => t.slice(0, 5);

export type EditableShift = {
  id?: string;
  employee_id: string;
  employee_name: string;
  work_date: string;
  start_time: string;
  end_time: string;
  note: string;
  paid: boolean;
  paid_on: string | null;
  rate_cents: number;
};

export default function ShiftSheet({
  shift,
  isNew,
  history,
  onClose,
  onSaved,
}: {
  shift: EditableShift;
  isNew: boolean;
  history: { at: string; action: string; who: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(shift.work_date);
  const [start, setStart] = useState(toHM(shift.start_time));
  const [end, setEnd] = useState(toHM(shift.end_time));
  const [note, setNote] = useState(shift.note ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const hours = hoursBetween(start, end);
  const amount = (hours * shift.rate_cents) / 100;

  function submit() {
    setError("");
    startTransition(async () => {
      try {
        await saveShift({
          id: shift.id,
          employee_id: shift.employee_id,
          work_date: date,
          start_time: start,
          end_time: end,
          note: note.trim() ? note.trim() : null,
        });
        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
      }
    });
  }

  function remove() {
    if (!shift.id) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteShift(shift.id!);
        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen.");
      }
    });
  }

  return (
    <Sheet title={isNew ? "Neue Schicht" : "Schicht bearbeiten"} onClose={onClose}>
      <Field label="Datum">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="flex gap-2.5">
        <Field label="Von">
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Bis">
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Notiz (optional)">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="z. B. Küche, Theke"
          className={inputClass}
        />
      </Field>

      <div className="border border-line bg-carbon p-3">
        <div className="tabular-nums text-[22px] font-bold">
          {hrs(hours)} h · {eur(amount)}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {shift.employee_name} · {eur(shift.rate_cents / 100)} pro Stunde · über Mitternacht wird
          mitgezählt
        </div>
      </div>
      {shift.paid && (
        <div className="mt-2.5 text-xs text-verde">
          {shift.paid_on ? `Am ${dLabel(shift.paid_on)} ausbezahlt.` : "Bereits ausbezahlt."}{" "}
          Änderungen werden protokolliert.
        </div>
      )}

      {error && <p className="mt-3 text-sm text-naranja-dark">{error}</p>}

      <div className="mt-4 flex gap-2">
        <Button onClick={submit} disabled={isPending} className="flex-1">
          Speichern
        </Button>
        <Button variant="outline" onClick={onClose} disabled={isPending} type="button">
          Abbrechen
        </Button>
      </div>
      {!isNew && (
        <Button
          variant="outline-warn"
          onClick={remove}
          disabled={isPending}
          className="mt-2 w-full"
        >
          Schicht löschen
        </Button>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] tracking-[0.14em] text-muted">VERLAUF</div>
          {history.map((h, i) => (
            <div key={i} className="tabular-nums py-0.5 text-[11px] text-muted">
              {new Date(h.at).toLocaleString("de-DE")} · {h.action} · {h.who}
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}

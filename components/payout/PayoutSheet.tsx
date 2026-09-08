"use client";

import { useRef, useState, useTransition } from "react";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { dLabel, eur, hrs } from "@/lib/format";
import { createPayout } from "@/app/(app)/actions";
import type { PayoutRow } from "@/lib/database.types";
import SignaturePad, { type SignaturePadHandle } from "./SignaturePad";

export type OpenShift = {
  id: string;
  work_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  amount_cents: number | null;
};

export default function PayoutSheet({
  employeeId,
  employeeName,
  openShifts,
  onClose,
  onConfirm,
}: {
  employeeId: string;
  employeeName: string;
  openShifts: OpenShift[];
  onClose: () => void;
  onConfirm: (payout: PayoutRow) => void;
}) {
  const [selected, setSelected] = useState<string[]>(openShifts.map((s) => s.id));
  const [signOnDevice, setSignOnDevice] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const padRef = useRef<SignaturePadHandle>(null);

  const toggle = (id: string) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const total =
    openShifts
      .filter((s) => selected.includes(s.id))
      .reduce((n, s) => n + (s.amount_cents ?? 0), 0) / 100;

  function confirm() {
    setError("");
    startTransition(async () => {
      try {
        const payout = await createPayout({
          employeeId,
          shiftIds: selected,
          signatureDataUrl: signOnDevice ? (padRef.current?.get() ?? null) : null,
        });
        onConfirm(payout);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Auszahlung fehlgeschlagen.");
      }
    });
  }

  return (
    <Sheet title={`Auszahlen · ${employeeName}`} onClose={onClose}>
      <p className="mb-2 text-[13px] text-muted">
        Wähle die Schichten, die jetzt ausbezahlt werden. Der Rest bleibt offen stehen.
      </p>
      {openShifts.map((s) => {
        const on = selected.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className="flex w-full items-center gap-2.5 border-b border-line py-2.5 text-left text-crema"
          >
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center border text-xs text-white ${
                on ? "border-naranja bg-naranja" : "border-line bg-transparent"
              }`}
            >
              {on ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="tabular-nums">{dLabel(s.work_date)}</span>
              <span className="tabular-nums text-xs text-muted">
                {" "}
                · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)} · {hrs(s.hours)} h
              </span>
            </span>
            <span className="tabular-nums font-bold">{eur((s.amount_cents ?? 0) / 100)}</span>
          </button>
        );
      })}

      <div className="mt-3.5 flex justify-between">
        <span className="text-sm">Auszahlungsbetrag</span>
        <span className="tabular-nums text-[22px] font-bold text-naranja">{eur(total)}</span>
      </div>

      <label className="mt-3.5 flex items-center gap-2 text-[13px] text-muted">
        <input
          type="checkbox"
          checked={signOnDevice}
          onChange={(e) => setSignOnDevice(e.target.checked)}
        />
        Unterschrift auf dem Gerät leisten
      </label>
      {signOnDevice && <SignaturePad ref={padRef} />}

      {error && <p className="mt-3 text-sm text-naranja-dark">{error}</p>}

      <Button
        onClick={confirm}
        disabled={!selected.length || isPending}
        className="mt-4 w-full"
      >
        {isPending ? "Wird gebucht …" : `${eur(total)} als ausbezahlt buchen`}
      </Button>
    </Sheet>
  );
}

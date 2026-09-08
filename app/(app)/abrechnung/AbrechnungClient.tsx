"use client";

import { useMemo, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import ShiftRow from "@/components/ui/ShiftRow";
import PayoutSheet, { type OpenShift } from "@/components/payout/PayoutSheet";
import ReceiptView from "@/components/payout/ReceiptView";
import { getOpenShiftsForEmployee, getAuditLog } from "@/app/(app)/actions";
import { auditDetail, auditTitle, type AuditLogEntry } from "@/lib/audit";
import { DAYS, de, dLabel, eur, hrs } from "@/lib/format";
import { download } from "@/lib/download";
import type { PayoutRow } from "@/lib/database.types";
import type { ShiftDetail } from "@/app/(app)/woche/types";

type Staff = { id: string; name: string; active: boolean };

type SheetState =
  | { kind: "payout"; employeeId: string; employeeName: string; openShifts: OpenShift[] }
  | { kind: "receipt"; payout: PayoutRow; employeeName: string };

export default function AbrechnungClient({
  canPayout,
  mk,
  staff,
  monthShifts,
  payouts,
  openSumByEmployee,
}: {
  canPayout: boolean;
  mk: string;
  staff: Staff[];
  monthShifts: ShiftDetail[];
  payouts: PayoutRow[];
  openSumByEmployee: Record<string, number>;
}) {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [loadingPayoutFor, setLoadingPayoutFor] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [log, setLog] = useState<AuditLogEntry[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const nameOf = useMemo(() => {
    const map = new Map(staff.map((e) => [e.id, e.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [staff]);

  const monthTotalCents = monthShifts.reduce((n, s) => n + (s.amount_cents ?? 0), 0);

  async function openPayout(emp: Staff) {
    setLoadingPayoutFor(emp.id);
    const openShifts = await getOpenShiftsForEmployee(emp.id);
    setLoadingPayoutFor(null);
    setSheet({ kind: "payout", employeeId: emp.id, employeeName: emp.name, openShifts });
  }

  function toggleLog() {
    if (!showLog && log === null) {
      startTransition(async () => {
        setLog(await getAuditLog());
      });
    }
    setShowLog(!showLog);
  }

  function exportCSV() {
    const head = [
      "Mitarbeiter",
      "Datum",
      "Wochentag",
      "Beginn",
      "Ende",
      "Stunden",
      "Stundensatz",
      "Betrag",
      "Status",
      "Ausbezahlt am",
      "Notiz",
    ];
    const rows = monthShifts.map((s) => {
      const weekday = DAYS[(new Date(s.work_date + "T12:00:00").getDay() + 6) % 7];
      return [
        s.employee_name,
        dLabel(s.work_date),
        weekday,
        s.start_time.slice(0, 5),
        s.end_time.slice(0, 5),
        de(s.hours),
        de((s.rate_cents ?? 0) / 100),
        de((s.amount_cents ?? 0) / 100),
        s.paid ? "ausbezahlt" : "offen",
        s.paid_on ? dLabel(s.paid_on) : "",
        s.note ?? "",
      ];
    });
    download(
      `Stunden_LaFinca_${mk}.csv`,
      "﻿" + [head, ...rows].map((r) => r.join(";")).join("\r\n"),
      "text/csv;charset=utf-8;"
    );
  }

  return (
    <>
      <div className="mt-3 border border-line bg-surface p-3.5">
        {staff.map((emp) => {
          const rows = monthShifts.filter((s) => s.employee_id === emp.id);
          const monthHours = rows.reduce((n, s) => n + s.hours, 0);
          const monthAmount = rows.reduce((n, s) => n + (s.amount_cents ?? 0), 0) / 100;
          const openSum = (openSumByEmployee[emp.id] ?? 0) / 100;
          return (
            <div
              key={emp.id}
              className="flex items-center justify-between gap-2 border-b border-line py-2.5"
            >
              <div className="min-w-0">
                <div className="text-[15px]">{emp.name}</div>
                <div className="tabular-nums text-xs text-muted">
                  {hrs(monthHours)} h · {eur(monthAmount)}
                  {openSum > 0 && <span className="text-naranja"> · offen {eur(openSum)}</span>}
                </div>
              </div>
              {canPayout && (
                <Button
                  variant="outline"
                  onClick={() => openPayout(emp)}
                  disabled={!openSum || loadingPayoutFor === emp.id}
                  className="shrink-0 !px-3 !py-2 !text-xs"
                >
                  {loadingPayoutFor === emp.id ? "…" : "Auszahlen"}
                </Button>
              )}
            </div>
          );
        })}
        <div className="mt-3 flex justify-between">
          <span className="text-sm font-semibold">Monat gesamt</span>
          <span className="tabular-nums text-xl font-bold">{eur(monthTotalCents / 100)}</span>
        </div>
        <Button onClick={exportCSV} className="mt-3 w-full">
          Monat als CSV exportieren
        </Button>
      </div>

      {payouts.length > 0 && (
        <div className="mt-5">
          <div className="mb-1.5 text-[11px] tracking-[0.14em] text-muted">
            AUSZAHLUNGEN | PAGOS
          </div>
          {payouts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setSheet({ kind: "receipt", payout: p, employeeName: nameOf(p.employee_id) })
              }
              className="flex w-full items-center justify-between border-b border-line py-2.5 text-left text-crema"
            >
              <span className="text-sm">
                {nameOf(p.employee_id)} <span className="text-xs text-muted">· {dLabel(p.paid_on)}</span>
              </span>
              <span className="tabular-nums font-bold">{eur(p.total_cents / 100)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5">
        <div className="mb-1.5 text-[11px] tracking-[0.14em] text-muted">ALLE SCHICHTEN</div>
        {monthShifts.map((s) => (
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
            who={s.employee_name}
          />
        ))}
        {!monthShifts.length && <p className="pt-2 text-sm text-muted">Für diesen Monat nichts eingetragen.</p>}
      </div>

      <Button variant="outline" onClick={toggleLog} className="mt-[18px] w-full !text-xs">
        Änderungsprotokoll {showLog ? "ausblenden" : "anzeigen"}
        {log !== null ? ` (${log.length})` : ""}
      </Button>
      {showLog && (
        <div className="mt-1">
          {isPending && <p className="py-2 text-xs text-muted">Wird geladen …</p>}
          {log?.map((entry) => (
            <div key={entry.id} className="border-b border-line py-1.5 text-xs text-muted">
              <span className="text-crema">{auditTitle(entry)}</span> · {auditDetail(entry)}
              <div className="tabular-nums text-[11px]">
                {new Date(entry.at).toLocaleString("de-DE")} · {entry.actor_name ?? "—"}
              </div>
            </div>
          ))}
          {log?.length === 0 && <p className="py-2 text-xs text-muted">Noch keine Einträge.</p>}
        </div>
      )}

      {sheet?.kind === "payout" && (
        <PayoutSheet
          employeeId={sheet.employeeId}
          employeeName={sheet.employeeName}
          openShifts={sheet.openShifts}
          onClose={() => setSheet(null)}
          onConfirm={(payout) =>
            setSheet({ kind: "receipt", payout, employeeName: sheet.employeeName })
          }
        />
      )}
      {sheet?.kind === "receipt" && (
        <ReceiptView
          payout={sheet.payout}
          employeeName={sheet.employeeName}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}

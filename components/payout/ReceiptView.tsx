"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { dLabel, de, eur } from "@/lib/format";
import { getPayoutShifts, getSignatureUrl, type PayoutShiftLine } from "@/app/(app)/actions";
import { buildReceiptHtml } from "@/lib/receiptHtml";
import type { PayoutRow } from "@/lib/database.types";
import { download } from "@/lib/download";

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ReceiptView({
  payout,
  employeeName,
  onClose,
}: {
  payout: PayoutRow;
  employeeName: string;
  onClose: () => void;
}) {
  const [lines, setLines] = useState<PayoutShiftLine[]>([]);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getPayoutShifts(payout.id).then(setLines);
    if (payout.signature_path) {
      getSignatureUrl(payout.signature_path).then(setSignatureUrl);
    }
  }, [payout.id, payout.signature_path]);

  async function downloadReceipt() {
    setIsDownloading(true);
    try {
      // Logo und Unterschrift als data:-URI einbetten statt als Link, sonst
      // zeigt die heruntergeladene Datei nach Ablauf des signierten
      // Storage-Links (10 Min.) irgendwann ein kaputtes Bild.
      const [logoDataUrl, signatureDataUrl] = await Promise.all([
        urlToDataUrl("/logo.png"),
        signatureUrl ? urlToDataUrl(signatureUrl) : Promise.resolve(null),
      ]);
      const html = buildReceiptHtml({
        employeeName,
        paidOn: payout.paid_on,
        minutes: payout.minutes,
        totalCents: payout.total_cents,
        lines,
        logoDataUrl,
        signatureDataUrl,
      });
      download(
        `Quittung_${employeeName.split(" ")[0]}_${payout.paid_on}.html`,
        html,
        "text/html;charset=utf-8;"
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Sheet title="Quittung | Recibo" onClose={onClose}>
      <div className="bg-white p-4 text-carbon">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-naranja">
            <Image src="/logo.png" alt="" width={38} height={38} />
          </div>
          <div className="text-[11px] font-bold underline">
            Minijobber Restaurant la finca, Stadtstrasse 50, 79104 Freiburg
          </div>
        </div>
        <RLine k="Name" v={employeeName} />
        <RLine k="Ausbezahlt am" v={dLabel(payout.paid_on)} />
        <RLine k="Stunden" v={de(payout.minutes / 60) + " h"} />
        <RLine k="Betrag" v={eur(payout.total_cents / 100)} />
        <div className="mt-2.5">
          {lines.map((s) => (
            <div key={s.id} className="tabular-nums flex justify-between py-0.5 text-xs text-[#555]">
              <span>
                {dLabel(s.work_date)} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
              </span>
              <span>{eur((s.amount_cents ?? 0) / 100)}</span>
            </div>
          ))}
        </div>
        {signatureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Unterschrift" src={signatureUrl} className="mt-3.5 h-[60px]" />
        ) : (
          <div className="mt-6 w-[220px] border-t border-[#333] pt-1 text-[11px] text-[#666]">
            Erhalten von — Unterschrift
          </div>
        )}
      </div>
      <Button onClick={downloadReceipt} disabled={isDownloading} className="mt-3 w-full">
        {isDownloading ? "Wird vorbereitet …" : "Quittung herunterladen"}
      </Button>
      <div className="mt-1.5 text-[11px] text-muted">
        Öffnet im Browser und lässt sich dort drucken oder als PDF sichern.
      </div>
      <Button variant="outline" onClick={onClose} className="mt-2 w-full">
        Schließen
      </Button>
    </Sheet>
  );
}

const RLine = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between border-b border-[#ddd] py-1.5 text-sm">
    <span className="text-[#666]">{k}</span>
    <span className="tabular-nums font-bold">{v}</span>
  </div>
);

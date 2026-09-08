"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sheet from "@/components/ui/Sheet";
import Button from "@/components/ui/Button";
import { dLabel, de, eur } from "@/lib/format";
import { getPayoutShifts, getSignatureUrl, type PayoutShiftLine } from "@/app/(app)/actions";
import type { PayoutRow } from "@/lib/database.types";
import { download } from "@/lib/download";

async function logoAsDataUrl(): Promise<string> {
  const res = await fetch("/logo.png");
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

  useEffect(() => {
    getPayoutShifts(payout.id).then(setLines);
    if (payout.signature_path) {
      getSignatureUrl(payout.signature_path).then(setSignatureUrl);
    }
  }, [payout.id, payout.signature_path]);

  async function downloadReceipt() {
    const logo = await logoAsDataUrl();
    const rows = lines
      .map(
        (s) =>
          `<tr><td>${dLabel(s.work_date)}</td><td>${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}</td><td class="r">${de(s.hours)}</td><td class="r">${eur((s.amount_cents ?? 0) / 100)}</td></tr>`
      )
      .join("");
    const html = `<!doctype html><meta charset="utf-8"><title>Quittung ${employeeName} ${dLabel(payout.paid_on)}</title>
<style>body{font-family:Helvetica,Arial,sans-serif;color:#1C1917;max-width:640px;margin:36px auto;padding:0 24px}
.head{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.tile{background:#E07C24;width:64px;height:64px;display:flex;align-items:center;justify-content:center}
h1{font-size:13px;text-decoration:underline;margin:0}
table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #ccc;padding:7px 0;text-align:left;font-size:13px}
th{color:#666;font-weight:600}.r{text-align:right}.big{font-size:19px;font-weight:700}
.sig{margin-top:30px;border-top:1px solid #333;padding-top:6px;font-size:12px;color:#666;width:280px}</style>
<div class="head"><div class="tile"><img src="${logo}" style="width:56px;height:56px"></div>
<h1>Minijobber Restaurant la finca, Stadtstrasse 50, 79104 Freiburg</h1></div>
<p><b>Name</b> ${employeeName}<br><b>Ausbezahlt am</b> ${dLabel(payout.paid_on)}<br><b>Rentenbefreit</b> ______________________</p>
<table><tr><th>Datum</th><th>Stunden von bis</th><th class="r">Stunden</th><th class="r">Betrag</th></tr>
${rows}
<tr><td colspan="2"><b>Betrag in Euro ausbezahlt</b></td><td class="r"><b>${de(payout.minutes / 60)}</b></td><td class="r big">${eur(payout.total_cents / 100)}</td></tr></table>
${
  signatureUrl
    ? `<p style="margin-top:24px"><img src="${signatureUrl}" style="height:70px"></p><div class="sig">Erhalten von ${employeeName} · digital unterschrieben am ${dLabel(payout.paid_on)}</div>`
    : `<div class="sig">Erhalten von ${employeeName} — Unterschrift</div>`
}
<p style="font-size:11px;color:#888;margin-top:24px">Digitaler Stundenzettel la Finca · gebucht von ${employeeName}</p>`;
    download(`Quittung_${employeeName.split(" ")[0]}_${payout.paid_on}.html`, html, "text/html;charset=utf-8;");
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
      <Button onClick={downloadReceipt} className="mt-3 w-full">
        Quittung herunterladen
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

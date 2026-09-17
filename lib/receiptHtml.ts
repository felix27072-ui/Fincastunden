import { dLabel, de, eur } from "@/lib/format";

export type ReceiptLine = {
  work_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  amount_cents: number | null;
};

/**
 * Baut die eigenständige, druckbare Quittungs-HTML — Logo und Unterschrift
 * werden als data:-URIs übergeben (nicht als Link), damit die Datei auch
 * offline und nach Ablauf eines signierten Storage-Links noch funktioniert.
 */
export function buildReceiptHtml(input: {
  employeeName: string;
  paidOn: string;
  minutes: number;
  totalCents: number;
  lines: ReceiptLine[];
  logoDataUrl: string;
  signatureDataUrl: string | null;
}): string {
  const { employeeName, paidOn, minutes, totalCents, lines, logoDataUrl, signatureDataUrl } =
    input;

  const rows = lines
    .map(
      (s) =>
        `<tr><td>${dLabel(s.work_date)}</td><td>${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}</td><td class="r">${de(s.hours)}</td><td class="r">${eur((s.amount_cents ?? 0) / 100)}</td></tr>`
    )
    .join("");

  return `<!doctype html><meta charset="utf-8"><title>Quittung ${employeeName} ${dLabel(paidOn)}</title>
<style>body{font-family:Helvetica,Arial,sans-serif;color:#1C1917;max-width:640px;margin:36px auto;padding:0 24px}
.head{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.tile{background:#E07C24;width:64px;height:64px;display:flex;align-items:center;justify-content:center}
h1{font-size:13px;text-decoration:underline;margin:0}
table{width:100%;border-collapse:collapse;margin:16px 0}td,th{border-bottom:1px solid #ccc;padding:7px 0;text-align:left;font-size:13px}
th{color:#666;font-weight:600}.r{text-align:right}.big{font-size:19px;font-weight:700}
.sig{margin-top:30px;border-top:1px solid #333;padding-top:6px;font-size:12px;color:#666;width:280px}</style>
<div class="head"><div class="tile"><img src="${logoDataUrl}" style="width:56px;height:56px"></div>
<h1>Minijobber Restaurant la finca, Stadtstrasse 50, 79104 Freiburg</h1></div>
<p><b>Name</b> ${employeeName}<br><b>Ausbezahlt am</b> ${dLabel(paidOn)}<br><b>Rentenbefreit</b> ______________________</p>
<table><tr><th>Datum</th><th>Stunden von bis</th><th class="r">Stunden</th><th class="r">Betrag</th></tr>
${rows}
<tr><td colspan="2"><b>Betrag in Euro ausbezahlt</b></td><td class="r"><b>${de(minutes / 60)}</b></td><td class="r big">${eur(totalCents / 100)}</td></tr></table>
${
  signatureDataUrl
    ? `<p style="margin-top:24px"><img src="${signatureDataUrl}" style="height:70px"></p><div class="sig">Erhalten von ${employeeName} · digital unterschrieben am ${dLabel(paidOn)}</div>`
    : `<div class="sig">Erhalten von ${employeeName} — Unterschrift</div>`
}
<p style="font-size:11px;color:#888;margin-top:24px">Digitaler Stundenzettel la Finca · gebucht von ${employeeName}</p>`;
}

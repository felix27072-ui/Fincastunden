import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildReceiptHtml, type ReceiptLine } from "@/lib/receiptHtml";

export const maxDuration = 60;

// Sammel-Export für die Steuerberatung: ein ZIP mit einem Ordner
// "Stundenzettel", darin ein Unterordner je Mitarbeiter:in, darin je
// Auszahlung eine eigenständige, druckbare Quittungs-HTML mit Unterschrift.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Nicht angemeldet.", { status: 401 });

  const { data: me } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || (me.role !== "chef" && me.role !== "steuer")) {
    return new Response("Kein Zugriff.", { status: 403 });
  }

  const [{ data: payouts }, { data: employeesData }] = await Promise.all([
    supabase
      .from("payouts")
      .select("id, employee_id, paid_on, total_cents, minutes, signature_path")
      .order("paid_on", { ascending: false }),
    supabase.from("employees").select("id, name"),
  ]);

  if (!payouts || payouts.length === 0) {
    return new Response("Noch keine Auszahlungen vorhanden.", { status: 404 });
  }

  const nameOf = new Map((employeesData ?? []).map((e) => [e.id, e.name]));

  const { data: allLines } = await supabase
    .from("shift_details")
    .select("payout_id, work_date, start_time, end_time, hours, amount_cents")
    .in(
      "payout_id",
      payouts.map((p) => p.id)
    )
    .order("work_date");

  const linesByPayout = new Map<string, ReceiptLine[]>();
  for (const line of allLines ?? []) {
    if (!line.payout_id) continue;
    const list = linesByPayout.get(line.payout_id) ?? [];
    list.push(line);
    linesByPayout.set(line.payout_id, list);
  }

  const logoBuffer = await fs.readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const admin = createAdminClient();
  const signaturePaths = [...new Set(payouts.map((p) => p.signature_path).filter(Boolean))] as string[];
  const signatureEntries = await Promise.all(
    signaturePaths.map(async (signaturePath) => {
      const { data: file } = await admin.storage.from("signatures").download(signaturePath);
      if (!file) return [signaturePath, null] as const;
      const buffer = Buffer.from(await file.arrayBuffer());
      return [signaturePath, `data:image/png;base64,${buffer.toString("base64")}`] as const;
    })
  );
  const signatureByPath = new Map(signatureEntries);

  const zip = new JSZip();
  const root = zip.folder("Stundenzettel")!;

  for (const payout of payouts) {
    const employeeName = nameOf.get(payout.employee_id) ?? "Unbekannt";
    const html = buildReceiptHtml({
      employeeName,
      paidOn: payout.paid_on,
      minutes: payout.minutes,
      totalCents: payout.total_cents,
      lines: linesByPayout.get(payout.id) ?? [],
      logoDataUrl,
      signatureDataUrl: payout.signature_path
        ? (signatureByPath.get(payout.signature_path) ?? null)
        : null,
    });
    root.folder(employeeName)!.file(`Quittung_${payout.paid_on}.html`, html);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="Stundenzettel.zip"',
    },
  });
}

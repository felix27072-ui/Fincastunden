import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getCurrentEmployee } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonFile(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export async function GET() {
  const me = await getCurrentEmployee();
  if (!me) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  if (me.role !== "chef") {
    return NextResponse.json({ error: "Nur der Chef kann ein Backup herunterladen." }, { status: 403 });
  }

  const supabase = await createClient();
  const [employees, shifts, payouts, auditLog] = await Promise.all([
    supabase.from("employees").select("*").order("name"),
    supabase.from("shifts").select("*").order("work_date").order("start_time"),
    supabase.from("payouts").select("*").order("paid_on"),
    supabase.from("audit_log").select("*").order("at"),
  ]);

  const queryError = employees.error ?? shifts.error ?? payouts.error ?? auditLog.error;
  if (queryError) {
    return NextResponse.json(
      { error: `Backup konnte nicht erstellt werden: ${queryError.message}` },
      { status: 500 }
    );
  }

  const zip = new JSZip();
  const generatedAt = new Date().toISOString();
  const dataFolder = zip.folder("data");
  const signatureFolder = zip.folder("signatures");

  dataFolder?.file("employees.json", jsonFile(employees.data ?? []));
  dataFolder?.file("shifts.json", jsonFile(shifts.data ?? []));
  dataFolder?.file("payouts.json", jsonFile(payouts.data ?? []));
  dataFolder?.file("audit_log.json", jsonFile(auditLog.data ?? []));

  const signaturePaths = [
    ...new Set(
      (payouts.data ?? [])
        .map((payout) => payout.signature_path)
        .filter((path): path is string => Boolean(path))
    ),
  ];

  const missingSignatures: { path: string; error: string }[] = [];
  let downloadedSignatures = 0;

  for (const path of signaturePaths) {
    const { data, error } = await supabase.storage.from("signatures").download(path);
    if (error || !data) {
      missingSignatures.push({ path, error: error?.message ?? "Datei nicht gefunden." });
      continue;
    }
    signatureFolder?.file(path, await data.arrayBuffer());
    downloadedSignatures += 1;
  }

  zip.file(
    "manifest.json",
    jsonFile({
      format: "la-finca-stunden-backup",
      version: 1,
      generated_at: generatedAt,
      generated_by: me.id,
      counts: {
        employees: employees.data?.length ?? 0,
        shifts: shifts.data?.length ?? 0,
        payouts: payouts.data?.length ?? 0,
        audit_log: auditLog.data?.length ?? 0,
        signatures: downloadedSignatures,
      },
      missing_signatures: missingSignatures,
    })
  );

  zip.file(
    "README.txt",
    [
      "la Finca · Stunden – manuelles Backup",
      "",
      `Erstellt: ${generatedAt}`,
      "",
      "Enthalten sind Mitarbeiter, Schichten, Auszahlungen, Audit-Protokoll und",
      "alle zu Auszahlungen referenzierten Unterschriften. Auth-Passwörter,",
      "Sessions und geheime Supabase-Schlüssel sind ausdrücklich nicht enthalten.",
      "",
      "Die JSON-Dateien sind als Wiederherstellungs-/Prüfkopie gedacht.",
    ].join("\n")
  );

  const archive = await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const day = generatedAt.slice(0, 10);
  return new Response(archive, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="LaFinca_Backup_${day}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}

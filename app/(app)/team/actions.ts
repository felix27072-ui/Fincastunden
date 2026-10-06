"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/database.types";

// Next.js redigiert Fehlermeldungen aus geworfenen Errors in Server Actions
// im Produktions-Build (nur ein "digest" kommt beim Client an) — erwartbare
// Fehler (Validierung, "schon angelegt" etc.) deshalb als Rückgabewert
// modellieren statt zu werfen, wie von Next.js empfohlen. throw bleibt nur
// für echte Ausnahmefälle (keine Session, keine Chef-Rolle).
export type ActionResult = { error: string | null };

async function requireChef() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet.");

  const { data: me } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (me?.role !== "chef") throw new Error("Nur der Chef kann Mitarbeiter verwalten.");

  return supabase;
}

export type CreateEmployeeInput = {
  name: string;
  email: string;
  role: Role;
  rateEuros: number;
};

export async function createEmployee(input: CreateEmployeeInput): Promise<ActionResult> {
  const supabase = await requireChef();
  const admin = createAdminClient();
  const email = input.email.trim();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  let userId: string;
  if (createError || !created.user) {
    if (!createError?.message.includes("already been registered")) {
      return { error: createError?.message ?? "Nutzer konnte nicht angelegt werden." };
    }
    // E-Mail hat schon einen Auth-Nutzer, aber keine employees-Zeile — z. B.
    // weil jemand vor dem Anlegen schon "Mit Google anmelden" probiert hat.
    // Bestehenden Nutzer wiederverwenden statt zu scheitern.
    const { data: list, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (listError || !existing) {
      return { error: "Diese E-Mail-Adresse ist schon angelegt, aber der Nutzer wurde nicht gefunden." };
    }
    userId = existing.id;
  } else {
    userId = created.user.id;
  }

  const { error: insertError } = await supabase.from("employees").insert({
    id: userId,
    name: input.name.trim(),
    email,
    role: input.role,
    rate_cents: Math.round(input.rateEuros * 100),
  });
  if (insertError) {
    // Nur einen gerade neu erstellten Auth-Nutzer wieder löschen — einen
    // bereits vorher bestehenden (z. B. durch Google-Login) nicht anfassen.
    if (!createError) {
      await admin.auth.admin.deleteUser(userId);
    }
    return { error: insertError.message };
  }

  revalidatePath("/team");
  revalidatePath("/woche");
  revalidatePath("/abrechnung");
  return { error: null };
}

export type EmployeeListItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  rate_cents: number;
  logs_hours: boolean;
};

export async function getEmployees(): Promise<EmployeeListItem[]> {
  const supabase = await requireChef();
  const { data } = await supabase
    .from("employees")
    .select("id, name, email, role, active, rate_cents, logs_hours")
    .order("name");
  return data ?? [];
}

export async function setEmployeeActive(id: string, active: boolean): Promise<ActionResult> {
  const supabase = await requireChef();
  const { error } = await supabase.from("employees").update({ active }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/team");
  revalidatePath("/woche");
  return { error: null };
}

export type UpdateEmployeeInput = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rateEuros: number;
  logsHours: boolean;
};

export async function updateEmployee(input: UpdateEmployeeInput): Promise<ActionResult> {
  const supabase = await requireChef();
  const email = input.email.trim();

  const { data: current, error: currentError } = await supabase
    .from("employees")
    .select("email, active")
    .eq("id", input.id)
    .maybeSingle();

  if (currentError) return { error: currentError.message };
  if (!current) return { error: "Mitarbeiter wurde nicht gefunden." };

  if (current.email.toLowerCase() !== email.toLowerCase()) {
    const admin = createAdminClient();

    // Vor dem Ändern der Auth-E-Mail prüfen, ob die Zieladresse bereits zu
    // einem anderen Supabase-Login gehört. Supabase liefert bei diesem Fall
    // je nach Provider nur das wenig hilfreiche "Error updating user".
    const { data: list, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) {
      return { error: `Anmeldekonten konnten nicht geprüft werden: ${listError.message}` };
    }

    const existingAuthUser = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingAuthUser && existingAuthUser.id !== input.id) {
      const { data: linkedEmployee, error: linkedEmployeeError } = await admin
        .from("employees")
        .select("id")
        .eq("id", existingAuthUser.id)
        .maybeSingle();

      if (linkedEmployeeError) return { error: linkedEmployeeError.message };
      if (linkedEmployee) {
        return { error: "Diese E-Mail-Adresse ist bereits einem anderen Mitarbeiter zugeordnet." };
      }

      // Ein bestehender Login (typisch: vorheriger Google-Login) kann bei
      // frisch angelegten Mitarbeitern direkt übernommen werden. Sobald
      // historische Daten an der alten User-ID hängen, brechen wir bewusst
      // ab, statt Schichten oder Auszahlungen zu verlieren.
      const [shiftRefs, payoutRefs, auditRefs] = await Promise.all([
        admin
          .from("shifts")
          .select("id")
          .or(`employee_id.eq.${input.id},created_by.eq.${input.id}`)
          .limit(1),
        admin
          .from("payouts")
          .select("id")
          .or(`employee_id.eq.${input.id},confirmed_by.eq.${input.id}`)
          .limit(1),
        admin.from("audit_log").select("id").eq("actor", input.id).limit(1),
      ]);

      const dependencyError = shiftRefs.error ?? payoutRefs.error ?? auditRefs.error;
      if (dependencyError) {
        return { error: `Kontoverknüpfung konnte nicht geprüft werden: ${dependencyError.message}` };
      }

      const hasDependencies =
        (shiftRefs.data?.length ?? 0) > 0 ||
        (payoutRefs.data?.length ?? 0) > 0 ||
        (auditRefs.data?.length ?? 0) > 0;

      if (hasDependencies) {
        return {
          error:
            "Diese E-Mail-Adresse gehört bereits zu einem bestehenden Login. Für diesen Mitarbeiter gibt es bereits Schichten, Auszahlungen oder Protokolleinträge, daher wird das Konto aus Sicherheitsgründen nicht automatisch zusammengeführt.",
        };
      }

      const { error: linkError } = await admin.from("employees").insert({
        id: existingAuthUser.id,
        name: input.name.trim(),
        email,
        role: input.role,
        rate_cents: Math.round(input.rateEuros * 100),
        active: current.active,
        logs_hours: input.role === "chef" ? input.logsHours : false,
      });
      if (linkError) return { error: linkError.message };

      const { error: deleteOldAuthError } = await admin.auth.admin.deleteUser(input.id);
      if (deleteOldAuthError) {
        // Best effort rollback: der bestehende Login bleibt erhalten und die
        // bisherige Mitarbeiter-Zeile wird nicht durch einen halben Wechsel
        // ersetzt.
        await admin.from("employees").delete().eq("id", existingAuthUser.id);
        return {
          error: `Der bestehende Login wurde gefunden, der alte Zugang konnte aber nicht entfernt werden: ${deleteOldAuthError.message}`,
        };
      }

      revalidatePath("/team");
      revalidatePath("/woche");
      revalidatePath("/abrechnung");
      revalidatePath("/meine");
      return { error: null };
    }

    const { error: authError } = await admin.auth.admin.updateUserById(input.id, {
      email,
      email_confirm: true,
    });
    if (authError) {
      return {
        error: authError.message.includes("already been registered")
          ? "Diese E-Mail-Adresse wird schon von einem anderen Konto verwendet."
          : authError.message === "Error updating user"
            ? "Anmeldeadresse konnte nicht geändert werden. Bitte prüfe, ob die E-Mail bereits zu einem bestehenden Konto gehört."
            : authError.message,
      };
    }
  }

  const { error } = await supabase
    .from("employees")
    .update({
      name: input.name.trim(),
      email,
      role: input.role,
      rate_cents: Math.round(input.rateEuros * 100),
      logs_hours: input.role === "chef" ? input.logsHours : false,
    })
    .eq("id", input.id);
  if (error) return { error: error.message };

  revalidatePath("/team");
  revalidatePath("/woche");
  revalidatePath("/abrechnung");
  revalidatePath("/meine");
  return { error: null };
}

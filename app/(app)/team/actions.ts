"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/database.types";

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

export async function createEmployee(input: CreateEmployeeInput) {
  const supabase = await requireChef();
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    email_confirm: true,
  });
  if (createError || !created.user) {
    throw new Error(
      createError?.message.includes("already been registered")
        ? "Diese E-Mail-Adresse ist schon angelegt."
        : (createError?.message ?? "Nutzer konnte nicht angelegt werden.")
    );
  }

  const { error: insertError } = await supabase.from("employees").insert({
    id: created.user.id,
    name: input.name.trim(),
    email: input.email.trim(),
    role: input.role,
    rate_cents: Math.round(input.rateEuros * 100),
  });
  if (insertError) {
    // Keinen Auth-Nutzer ohne employees-Zeile stehen lassen.
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error(insertError.message);
  }

  revalidatePath("/team");
  revalidatePath("/woche");
  revalidatePath("/abrechnung");
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

export async function setEmployeeActive(id: string, active: boolean) {
  const supabase = await requireChef();
  const { error } = await supabase.from("employees").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/team");
  revalidatePath("/woche");
}

export type UpdateEmployeeInput = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rateEuros: number;
  logsHours: boolean;
};

export async function updateEmployee(input: UpdateEmployeeInput) {
  const supabase = await requireChef();
  const email = input.email.trim();

  const { data: current } = await supabase
    .from("employees")
    .select("email")
    .eq("id", input.id)
    .maybeSingle();

  if (current && current.email !== email) {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(input.id, {
      email,
      email_confirm: true,
    });
    if (authError) {
      throw new Error(
        authError.message.includes("already been registered")
          ? "Diese E-Mail-Adresse wird schon von einem anderen Konto verwendet."
          : authError.message
      );
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
  if (error) throw new Error(error.message);

  revalidatePath("/team");
  revalidatePath("/woche");
  revalidatePath("/abrechnung");
  revalidatePath("/meine");
}

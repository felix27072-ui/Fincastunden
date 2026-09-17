import { createClient } from "@/lib/supabase/server";
import { isEndOfMonth } from "@/lib/format";
import type { Role } from "@/lib/database.types";

/**
 * Hinweis-Banner in den letzten Tagen des Monats: Joe (chef) soll offene
 * Auszahlungen nicht vergessen, Mitarbeiter:innen sollen offene Stunden bei
 * ihm ansprechen. Läuft nur über bereits eingeloggte Nutzer:innen — kein
 * E-Mail-Versand, also kein Risiko fürs enge Magic-Link-Kontingent.
 */
export async function getReminderBanner(
  employeeId: string,
  role: Role
): Promise<string | null> {
  if (role === "steuer" || !isEndOfMonth()) return null;

  const supabase = await createClient();
  const query = supabase.from("shift_details").select("amount_cents").eq("paid", false);
  const { data } =
    role === "chef" ? await query : await query.eq("employee_id", employeeId);

  const openCents = (data ?? []).reduce((n, s) => n + (s.amount_cents ?? 0), 0);
  if (openCents <= 0) return null;

  return role === "chef"
    ? "Es gibt noch offene Stunden, die vor Monatsende ausgezahlt werden sollten."
    : "Du hast noch offene Stunden diesen Monat — sprich Joe auf die Auszahlung an.";
}

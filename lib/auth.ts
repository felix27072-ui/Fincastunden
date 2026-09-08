import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type Employee = Database["public"]["Tables"]["employees"]["Row"];

/**
 * Lädt den employees-Datensatz des eingeloggten Nutzers. `null`, wenn kein
 * Zugang besteht (kein Eintrag in der Mitarbeitertabelle oder deaktiviert) —
 * per RLS sieht jede/r nur die eigene Zeile, chef/steuer zusätzlich alle.
 * Mit React `cache()` einmal pro Request, auch wenn Layout und Page beide
 * danach fragen.
 */
export const getCurrentEmployee = cache(async (): Promise<Employee | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.active) return null;
  return data;
});

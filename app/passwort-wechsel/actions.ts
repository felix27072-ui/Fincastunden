"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function finishPasswordChange(password: string): Promise<{ error: string | null }> {
  if (password.length < 12) return { error: "Mindestens 12 Zeichen erforderlich." };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Bitte erneut anmelden." };
  if (!user.app_metadata?.must_change_password) return { error: "Keine Passwortänderung erforderlich." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  const admin = createAdminClient();
  const { error: clearError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, must_change_password: false },
  });
  if (clearError) return { error: "Passwort geändert, aber Freigabe fehlgeschlagen. Bitte den Administrator kontaktieren." };
  await supabase.auth.refreshSession();
  return { error: null };
}

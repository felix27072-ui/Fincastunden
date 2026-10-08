import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PasswordChangeForm from "./PasswordChangeForm";

export default async function PasswordChangePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!user.app_metadata?.must_change_password) redirect("/woche");
  return <main className="mx-auto w-full max-w-sm px-4 py-10"><h1 className="mb-3 text-lg font-semibold">Passwort ändern</h1><p className="mb-5 text-sm text-muted">Bitte ersetze dein vorläufiges Passwort durch ein persönliches Passwort.</p><PasswordChangeForm /></main>;
}

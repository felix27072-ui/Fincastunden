import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Aufgerufen, wenn ein eingeloggter Auth-Nutzer keinen (aktiven) Eintrag in
// der Mitarbeitertabelle hat — meldet ab und schickt zurück zur Anmeldung.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?error=no-access`);
}

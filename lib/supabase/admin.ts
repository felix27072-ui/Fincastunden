import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Admin-Client mit Service-Role-Key — umgeht RLS vollständig. Nur
 * server-seitig verwenden (Server Actions/Route Handler), nie in Client
 * Components importieren. Ausschließlich für das, was der normale Client
 * nicht kann: Auth-Nutzer anlegen/löschen.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

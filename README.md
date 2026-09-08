# la Finca · Stunden

Digitaler Stundenzettel für Restaurant la Finca, Freiburg. Next.js (App Router,
TypeScript) + Supabase (Postgres, Auth, RLS). Siehe `SPEC-finca-stunden.md`
für die volle Spezifikation und `finca-stundenzettel-v3.jsx` für die
Design-/Logikvorlage.

## Stand

Gebaut: Projekt-Setup, SQL-Migration (Schema, berechnete Stunden, RLS,
Audit-Trigger), Magic-Link-Login, Wochenplan.

Noch offen (nächste Schritte): "Meine Schichten", Auszahlen mit Unterschrift
(Supabase Storage), Abrechnung/CSV-Export, Mitarbeiter-Verwaltung für Joe
(Supabase Auth Admin API, service role).

## Setup

1. Supabase-Projekt anlegen.
2. `.env.local.example` nach `.env.local` kopieren und mit den Werten aus
   *Project Settings → API* füllen (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Migration einspielen — entweder im Supabase Dashboard unter *SQL Editor*
   den Inhalt von `supabase/migrations/0001_init.sql` ausführen, oder mit der
   Supabase CLI: `supabase link` und `supabase db push`.
4. In Supabase unter *Authentication → Providers* sicherstellen, dass "Email
   OTP" (Magic Link) aktiv ist, und unter *Authentication → URL Configuration*
   die Redirect-URL `<deine-domain>/auth/callback` eintragen (für lokale
   Entwicklung zusätzlich `http://localhost:3000/auth/callback`).
5. Ersten Mitarbeiter (Joe, Rolle `chef`) anlegen: In Supabase unter
   *Authentication → Users* per "Invite user" oder "Add user" einen Nutzer
   mit Joes E-Mail-Adresse erstellen, dann im SQL Editor:

   ```sql
   insert into employees (id, name, email, role, rate_cents)
   values ('<user-id-aus-auth.users>', 'Joe', 'joe@example.com', 'chef', 0);
   ```

   Weitere Mitarbeiter kann Joe später über die App anlegen, sobald die
   Mitarbeiter-Verwaltung gebaut ist; bis dahin genauso über Supabase Studio.
6. `npm install`, dann `npm run dev` und `http://localhost:3000` öffnen.

## Entwicklung

```bash
npm run dev     # Dev-Server
npm run build   # Produktionsbuild
npm run lint    # ESLint
```

## Struktur

```
app/woche/        Wochenplan (Startseite) — Grid, Tages- und Schichtansicht
app/login/         Magic-Link-Anmeldung
app/auth/           OAuth-Callback, Fehlerseiten, Abmeldung ohne Zugang
lib/supabase/       Browser-/Server-/Proxy-Clients
lib/format.ts        Formatierung & Datumslogik (Dezimalkomma, KW, Monat)
lib/database.types.ts Handgepflegte Supabase-Typen passend zur Migration
supabase/migrations/  SQL: Schema, RLS, Audit-Trigger
```

`proxy.ts` (Next.js 16 hat `middleware.ts` in `proxy.ts` umbenannt) hält die
Session aktuell und schützt alle Routen außer `/login` und `/auth/*`.

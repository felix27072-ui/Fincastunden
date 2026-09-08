# la Finca · Stunden

Digitaler Stundenzettel für Restaurant la Finca, Freiburg. Next.js (App Router,
TypeScript) + Supabase (Postgres, Auth, RLS). Siehe `SPEC-finca-stunden.md`
für die volle Spezifikation und `finca-stundenzettel-v3.jsx` für die
Design-/Logikvorlage.

## Stand

Gebaut: Projekt-Setup, SQL-Migration (Schema, berechnete Stunden, RLS,
Audit-Trigger), Magic-Link-Login, Wochenplan, Meine Schichten, Auszahlen mit
Unterschrift (Supabase Storage) und Quittung, Abrechnung (Summen je
Mitarbeiter, CSV-Export, Auszahlungsliste, Änderungsprotokoll).

Noch offen (nächster Schritt): Mitarbeiter-Verwaltung für Joe (Supabase Auth
Admin API, service role) — bis dahin Mitarbeiter wie unten beschrieben über
Supabase Studio anlegen.

## Setup

1. Supabase-Projekt anlegen.
2. `.env.local.example` nach `.env.local` kopieren und mit den Werten aus
   *Project Settings → API* füllen (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Migrationen einspielen — entweder im Supabase Dashboard unter *SQL Editor*
   die Dateien aus `supabase/migrations/` der Reihe nach ausführen
   (`0001_init.sql`, `0002_payouts.sql`, `0003_audit_log_view.sql`), oder mit
   der Supabase CLI: `supabase link` und `supabase db push`.
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

   Weitere Mitarbeiter genauso über Supabase Studio anlegen, bis Joe das
   selbst in der App erledigen kann (Rolle `mitarbeiter`, `steuer` für die
   Steuerberatung).
6. `npm install`, dann `npm run dev` und `http://localhost:3000` öffnen.

## Entwicklung

```bash
npm run dev     # Dev-Server
npm run build   # Produktionsbuild
npm run lint    # ESLint
```

## Struktur

```
app/(app)/           Gemeinsames Layout (TopBar, Tabs) für alle angemeldeten Seiten
app/(app)/woche/      Wochenplan (Startseite) — Grid, Tages- und Schichtansicht
app/(app)/meine/      Meine Schichten — offener Betrag, eigene Liste, Auszahlen
app/(app)/abrechnung/ Abrechnung (chef/steuer) — Summen, CSV-Export, Protokoll
app/login/            Magic-Link-Anmeldung
app/auth/             OAuth-Callback, Fehlerseiten, Abmeldung ohne Zugang
components/payout/    Auszahlen: Schichtauswahl, Unterschrift-Canvas, Quittung
lib/supabase/         Browser-/Server-/Proxy-Clients
lib/format.ts          Formatierung & Datumslogik (Dezimalkomma, KW, Monat)
lib/audit.ts            Änderungsprotokoll: Titel/Detailtext je Eintrag
lib/database.types.ts  Handgepflegte Supabase-Typen passend zur Migration
supabase/migrations/   SQL: Schema, RLS, Audit-Trigger, Auszahlen-Funktion, Protokoll-View
```

`proxy.ts` (Next.js 16 hat `middleware.ts` in `proxy.ts` umbenannt) hält die
Session aktuell und schützt alle Routen außer `/login` und `/auth/*`.

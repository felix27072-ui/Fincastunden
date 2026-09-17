# la Finca · Stunden

Digitaler Stundenzettel für Restaurant la Finca, Freiburg. Next.js (App Router,
TypeScript) + Supabase (Postgres, Auth, RLS). Siehe `SPEC-finca-stunden.md`
für die volle Spezifikation und `finca-stundenzettel-v3.jsx` für die
Design-/Logikvorlage.

## Stand

Gebaut: Projekt-Setup, SQL-Migration (Schema, berechnete Stunden, RLS,
Audit-Trigger), Magic-Link-Login, Wochenplan, Meine Schichten, Auszahlen mit
Unterschrift (Supabase Storage) und Quittung, Abrechnung (Summen je
Mitarbeiter, CSV-Export, Auszahlungsliste, Änderungsprotokoll), Team
(Mitarbeiter-Verwaltung für den Chef — anlegen/deaktivieren, ohne
Supabase Studio).

## Setup

1. Supabase-Projekt anlegen.
2. `.env.local.example` nach `.env.local` kopieren und mit den Werten aus
   *Project Settings → API* füllen (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Letzterer
   ist geheim, nie committen, wird für „Team" gebraucht).
3. Migrationen einspielen — entweder im Supabase Dashboard unter *SQL Editor*
   die Dateien aus `supabase/migrations/` der Reihe nach ausführen
   (`0001_init.sql`, `0002_payouts.sql`, `0003_audit_log_view.sql`), oder mit
   der Supabase CLI: `supabase link` und `supabase db push`.
4. In Supabase unter *Authentication → Providers* sicherstellen, dass "Email
   OTP" (Magic Link) aktiv ist, und unter *Authentication → URL Configuration*
   die Redirect-URL `<deine-domain>/auth/callback` eintragen (für lokale
   Entwicklung zusätzlich `http://localhost:3000/auth/callback`).
5. Ersten Mitarbeiter (Joe, Rolle `chef`) anlegen — **einmalig** noch per Hand,
   weil "Team" selbst schon einen `chef` braucht, der es benutzt: In Supabase
   unter *Authentication → Users* per "Add user" einen Nutzer mit Joes
   E-Mail-Adresse erstellen (Haken bei "Auto Confirm User"), dann im SQL
   Editor:

   ```sql
   insert into employees (id, name, email, role, rate_cents)
   values ('<user-id-aus-auth.users>', 'Joe', 'joe@example.com', 'chef', 0);
   ```

   Alle weiteren Mitarbeiter kann Joe danach selbst über den Tab **„Team"**
   in der App anlegen (Name, E-Mail, Rolle, Stundensatz) — kein Supabase
   Studio mehr nötig.
6. `npm install`, dann `npm run dev` und `http://localhost:3000` öffnen.

## Deployment (Vercel)

Kein lokaler Rechner nötig — geht komplett über die Vercel-Weboberfläche:

1. Auf [vercel.com](https://vercel.com) mit demselben GitHub-Account einloggen,
   unter dem das Repo liegt, und das Repo importieren.
2. Beim Import unter **Environment Variables** dieselben drei Werte wie in
   `.env.local` eintragen (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), Umgebung
   „Production and Preview".
3. Deployen. Danach die zugewiesene Adresse (`https://<projekt>.vercel.app`)
   in Supabase unter *Authentication → URL Configuration* als zusätzliche
   Redirect-URL eintragen: `https://<projekt>.vercel.app/auth/callback`.
4. Jeder Push auf den verbundenen Branch löst automatisch ein neues
   Deployment aus.

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
app/(app)/team/       Team (chef) — Mitarbeiter anlegen/deaktivieren
app/login/            Magic-Link-Anmeldung
app/auth/             OAuth-Callback, Fehlerseiten, Abmeldung ohne Zugang
components/payout/    Auszahlen: Schichtauswahl, Unterschrift-Canvas, Quittung
lib/supabase/         Browser-/Server-/Proxy-Clients
lib/supabase/admin.ts  Service-Role-Client (nur "Team", nie im Browser)
lib/format.ts          Formatierung & Datumslogik (Dezimalkomma, KW, Monat)
lib/audit.ts            Änderungsprotokoll: Titel/Detailtext je Eintrag
lib/database.types.ts  Handgepflegte Supabase-Typen passend zur Migration
supabase/migrations/   SQL: Schema, RLS, Audit-Trigger, Auszahlen-Funktion, Protokoll-View
```

`proxy.ts` (Next.js 16 hat `middleware.ts` in `proxy.ts` umbenannt) hält die
Session aktuell und schützt alle Routen außer `/login` und `/auth/*`.

# Digitaler Stundenzettel – Restaurant la Finca, Freiburg

Spezifikation für den Bau der produktiven App. Der Prototyp
`finca-stundenzettel-v3.jsx` zeigt UI, Datenmodell und Abläufe und gilt als
verbindliche Vorlage für Aussehen und Logik.

## 1. Was die App ersetzt

Heute hängt in der Küche ein Wochenzettel, in den nach der Schicht handschriftlich
die Stunden eingetragen werden. Der Zettel geht an die Steuerberaterin. Parallel
führt jeder Mitarbeiter eine eigene Liste und füllt beim Auszahlen einen
Quittungszettel mit Unterschrift aus. Die App bildet alle drei Dinge in einem
System ab: Wochenzettel, persönliche Liste, Auszahlungsquittung.

Rund 10 Mitarbeiter, Bedienung fast ausschließlich am Handy, meist spät abends
nach der Schicht. Der Chef heißt Joe.

## 2. Stack

- **Next.js** (App Router, TypeScript) als PWA, mobile-first
- **Supabase**: Postgres, Auth, Row Level Security, Storage für Unterschriftsbilder
- **Vercel** fürs Hosting
- Deutsch als einzige Sprache, Zeitzone Europe/Berlin, Dezimalkomma

Begründung: Supabase liefert Login und Rechte fertig mit, in dieser Größenordnung
kostenlos. Kein eigenes Backend nötig.

## 3. Login

Magic Link per E-Mail. Kein Passwort, weil zehn Aushilfen sonst zehnmal das
Passwort vergessen. Ablauf: E-Mail eingeben, Link antippen, dauerhaft eingeloggt.
Joe legt neue Mitarbeiter mit E-Mail und Stundensatz an; ohne Eintrag in der
Mitarbeitertabelle kein Zugang.

## 4. Rollen

| | Mitarbeiter | Chef (Joe) | Steuerberatung |
|---|---|---|---|
| Eigene Schichten eintragen/ändern | ja | ja | nein |
| Fremde Schichten ändern | nein | ja | nein |
| Wochenplan: Stunden aller sehen | ja | ja | ja |
| Beträge aller sehen | nein | ja | ja |
| Abrechnung, Export, Protokoll | nein | ja | ja (lesen) |
| Auszahlung buchen | nur für sich | für alle | nein |

Mitarbeiter sehen im Wochenplan also die Stunden der Kollegen wie auf dem Zettel
in der Küche, aber keine Euro-Beträge außer den eigenen.

## 5. Datenmodell

```sql
create table employees (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null unique,
  rate_cents int not null default 1390,      -- 13,90 €
  role text not null check (role in ('mitarbeiter','chef','steuer')),
  active boolean not null default true,
  created_at timestamptz default now()
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees,
  work_date date not null,
  start_time time not null,
  end_time time not null,                    -- über Mitternacht erlaubt
  note text,
  paid boolean not null default false,
  paid_on date,
  payout_id uuid references payouts,
  created_by uuid not null references employees,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees,
  paid_on date not null,
  total_cents int not null,
  minutes int not null,
  signature_path text,                       -- Supabase Storage
  confirmed_by uuid not null references employees,
  created_at timestamptz default now()
);

create table audit_log (
  id bigserial primary key,
  entity text not null,                      -- 'shift' | 'payout' | 'employee'
  entity_id uuid not null,
  action text not null,                      -- 'insert' | 'update' | 'delete'
  before jsonb,
  after jsonb,
  actor uuid references employees,
  at timestamptz default now()
);
```

Wichtig: Stunden werden **nie** gespeichert, sondern immer aus Start und Ende
berechnet — Endzeit kleiner oder gleich Startzeit heißt plus 24 Stunden. Beträge
in Cent rechnen, nicht in Fließkomma.

Das Protokoll läuft über Postgres-Trigger auf `shifts` und `payouts`, nicht über
Anwendungscode. In der Oberfläche steht immer nur der aktuelle Stand; der Verlauf
ist ausklappbar in der Schichtansicht und vollständig in der Abrechnung.

## 6. RLS-Politik

- `shifts` SELECT: alle eingeloggten Nutzer (für den Wochenplan)
- `shifts` INSERT/UPDATE/DELETE: `employee_id = auth.uid()` oder Rolle `chef`
- Beträge nicht in der Datenbank filtern, sondern über eine View ausliefern, die
  `rate_cents` nur für die eigene Zeile oder für `chef`/`steuer` mitgibt
- `payouts`, `audit_log` SELECT: eigene Zeilen, `chef`, `steuer`
- `employees` UPDATE: nur `chef`

## 7. Funktionen

**Wochenplan** (Startseite): Monat wählen, dann Kalenderwoche, dann Gitter mit
Namen links und Wochentagen samt Datum oben. Eine Zeile pro aktivem Mitarbeiter,
wächst automatisch mit. Zelle zeigt die Stundenzahl, orange wenn offen, grün wenn
ausbezahlt. Tippen öffnet den Tag, dort Schicht anlegen oder ändern. Auf schmalen
Handys nur die Stundenzahl, ab 480 px zusätzlich die Uhrzeiten.

**Meine Schichten**: offener Gesamtbetrag groß oben, darunter die eigene Liste
absteigend nach Datum. Nachtragen über die freie Datumswahl.

**Auszahlen**: Liste der offenen Schichten mit Einzelauswahl, Summe rechnet live
mit, nicht gewählte Schichten bleiben offen. Optional Unterschrift auf dem
Display (Canvas, als PNG in Storage). Danach Quittung im Layout des bisherigen
Zettels, herunterladbar und druckbar.

**Abrechnung** (Chef und Steuerberatung): Monatsauswahl, Summen je Mitarbeiter,
CSV-Export mit Semikolon und Komma-Dezimalzeichen, Liste aller Auszahlungen,
Änderungsprotokoll.

## 8. Rechtlicher Rahmen

Nach MiLoG müssen bei Minijobbern Beginn, Ende und Dauer der Arbeitszeit
innerhalb von sieben Tagen erfasst und zwei Jahre aufbewahrt werden. Digitale
Erfassung ist zulässig, Änderungen müssen aber nachvollziehbar bleiben — deshalb
das Protokoll und deshalb kein hartes Löschen von Auszahlungen. Ob die
Steuerberaterin die Unterschrift auf dem Display akzeptiert oder weiter Papier
will, ist offen; die Quittung ist deshalb in beiden Varianten druckbar.

## 9. Offene Punkte vor dem Bau

1. Welches Format will die Steuerberaterin — CSV, PDF, DATEV, wöchentlich oder monatlich?
2. Muss Joe Einträge freigeben, bevor sie in den Export gehen?
3. Bleibt der Stundensatz pro Person konstant, oder gibt es Zuschläge?
4. Sollen Mitarbeiter die Stunden der Kollegen wirklich sehen?

## 10. Startprompt für Claude Code

> Lies SPEC-finca-stunden.md und finca-stundenzettel-v3.jsx. Der JSX-Prototyp ist
> die Design- und Logikvorlage, die Spec ist verbindlich. Baue daraus eine
> Next.js-App mit Supabase. Fang an mit: Projekt aufsetzen, SQL-Migration für
> Schema, RLS und Audit-Trigger, Magic-Link-Login, danach der Wochenplan. Zeig
> mir nach jedem Schritt, was du gebaut hast, bevor du weitermachst.

## 11. Ablauf zum Übertragen

1. Node.js installieren, dann `npm install -g @anthropic-ai/claude-code`
2. Ordner `finca-stunden` anlegen, beide Dateien hineinlegen
3. Supabase-Projekt anlegen, URL und Keys notieren
4. Im Ordner `claude` starten und den Prompt aus Abschnitt 10 einsetzen
5. Nach dem ersten lauffähigen Stand auf Vercel deployen, Testlogin für Joe anlegen

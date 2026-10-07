-- Digitaler Stundenzettel · Restaurant la Finca
-- Schema, berechnete Stunden, RLS und Audit-Trigger.
--
-- Tabellenreihenfolge weicht von SPEC-finca-stunden.md #5 ab, weil "shifts"
-- dort per Fremdschlüssel auf "payouts" zeigt, das erst danach angelegt wird.
-- Hier: employees -> payouts -> shifts -> audit_log, Spalten unverändert.

create extension if not exists pgcrypto;

-- =========================================================================
-- 1. Tabellen
-- =========================================================================

create table employees (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  email text not null unique,
  rate_cents int not null default 1390,      -- 13,90 €
  role text not null check (role in ('mitarbeiter','chef','steuer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees,
  paid_on date not null,
  total_cents int not null,
  minutes int not null,
  signature_path text,                       -- Supabase Storage
  confirmed_by uuid not null references employees,
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  entity text not null check (entity in ('shift','payout','employee')),
  entity_id uuid not null,
  action text not null check (action in ('insert','update','delete')),
  before jsonb,
  after jsonb,
  actor uuid references employees,
  at timestamptz not null default now()
);

create index shifts_employee_date_idx on shifts (employee_id, work_date);
create index shifts_work_date_idx on shifts (work_date);
create index payouts_employee_idx on payouts (employee_id);
create index audit_log_entity_idx on audit_log (entity, entity_id);

-- =========================================================================
-- 2. Stunden & Beträge — nie gespeichert, immer berechnet
--    Endzeit <= Startzeit heißt: Schicht geht über Mitternacht (+24h).
--    Beträge werden in Cent gerundet, nie als Fließkomma-Euro.
-- =========================================================================

create or replace function shift_minutes(p_start time, p_end time)
returns integer
language sql
immutable
as $$
  select case
    when p_end <= p_start
      then (extract(epoch from (p_end - p_start)) / 60)::int + 1440
    else (extract(epoch from (p_end - p_start)) / 60)::int
  end
$$;

create or replace function shift_amount_cents(p_start time, p_end time, p_rate_cents int)
returns integer
language sql
immutable
as $$
  select round(shift_minutes(p_start, p_end)::numeric * p_rate_cents / 60.0)::int
$$;

-- =========================================================================
-- 3. Rollen-Helfer (security definer, damit RLS-Policies sich nicht selbst
--    blockieren, wenn sie die Rolle des aktuellen Nutzers nachschlagen)
-- =========================================================================

create or replace function auth_employee_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from employees where id = auth.uid();
$$;

create or replace function is_privileged()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_employee_role() in ('chef','steuer'), false);
$$;

-- =========================================================================
-- 4. updated_at automatisch pflegen
-- =========================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shifts_set_updated_at
before update on shifts
for each row execute function set_updated_at();

-- =========================================================================
-- 5. Audit-Trigger — das Protokoll läuft über die Datenbank, nicht über
--    Anwendungscode. security definer, weil normale Nutzer laut RLS unten
--    nicht direkt in audit_log schreiben dürfen.
-- =========================================================================

create or replace function audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity text := TG_ARGV[0];
begin
  if TG_OP = 'INSERT' then
    insert into audit_log (entity, entity_id, action, before, after, actor)
    values (v_entity, new.id, 'insert', null, to_jsonb(new), auth.uid());
    return new;
  elsif TG_OP = 'UPDATE' then
    insert into audit_log (entity, entity_id, action, before, after, actor)
    values (v_entity, new.id, 'update', to_jsonb(old), to_jsonb(new), auth.uid());
    return new;
  elsif TG_OP = 'DELETE' then
    insert into audit_log (entity, entity_id, action, before, after, actor)
    values (v_entity, old.id, 'delete', to_jsonb(old), null, auth.uid());
    return old;
  end if;
  return null;
end;
$$;

create trigger shifts_audit
after insert or update or delete on shifts
for each row execute function audit_trigger_fn('shift');

create trigger payouts_audit
after insert or update or delete on payouts
for each row execute function audit_trigger_fn('payout');

create trigger employees_audit
after insert or update or delete on employees
for each row execute function audit_trigger_fn('employee');

-- =========================================================================
-- 6. Row Level Security
-- =========================================================================

alter table employees enable row level security;
alter table shifts enable row level security;
alter table payouts enable row level security;
alter table audit_log enable row level security;

-- employees: jeder sieht seine eigene Zeile, chef/steuer sehen alle.
-- Namen für alle Mitarbeiter im Wochenplan liefert die View employees_view
-- unten (die bewusst RLS umgeht, aber rate_cents/email selbst maskiert).
create policy employees_select on employees
  for select
  using (id = auth.uid() or is_privileged());

create policy employees_insert on employees
  for insert
  with check (auth_employee_role() = 'chef');

create policy employees_update on employees
  for update
  using (auth_employee_role() = 'chef')
  with check (auth_employee_role() = 'chef');

-- shifts: alle eingeloggten Nutzer sehen alle Schichten (Wochenplan).
-- Ändern darf nur der/die Mitarbeiter:in selbst oder der Chef.
create policy shifts_select on shifts
  for select
  using (true);

create policy shifts_insert on shifts
  for insert
  with check (employee_id = auth.uid() or auth_employee_role() = 'chef');

create policy shifts_update on shifts
  for update
  using (employee_id = auth.uid() or auth_employee_role() = 'chef')
  with check (employee_id = auth.uid() or auth_employee_role() = 'chef');

create policy shifts_delete on shifts
  for delete
  using (employee_id = auth.uid() or auth_employee_role() = 'chef');

-- payouts: eigene Zeilen, chef, steuer. Auszahlung buchen darf man für sich
-- selbst oder (als chef) für alle. Kein Update/Delete — Auszahlungen sind
-- nach MiLoG nicht rückwirkend zu verändern oder hart zu löschen.
create policy payouts_select on payouts
  for select
  using (employee_id = auth.uid() or is_privileged());

create policy payouts_insert on payouts
  for insert
  with check (employee_id = auth.uid() or auth_employee_role() = 'chef');

-- audit_log: chef/steuer sehen alles, Mitarbeiter sehen das Protokoll der
-- eigenen Schichten, Auszahlungen und des eigenen Employee-Datensatzes
-- (z. B. Verlauf einer eigenen Schicht in der Schichtansicht).
create policy audit_log_select on audit_log
  for select
  using (
    is_privileged()
    or (entity = 'shift' and exists (
          select 1 from shifts s where s.id = audit_log.entity_id and s.employee_id = auth.uid()))
    or (entity = 'payout' and exists (
          select 1 from payouts p where p.id = audit_log.entity_id and p.employee_id = auth.uid()))
    or (entity = 'employee' and audit_log.entity_id = auth.uid())
  );

-- =========================================================================
-- 7. Views für Beträge — Filterung nicht in der RLS, sondern in der View
--    (Views laufen unter den Rechten der/des Erstellenden und umgehen RLS
--    auf den Basistabellen, deshalb wird die Sichtbarkeit hier explizit
--    per CASE WHEN nachgebildet statt Zeilen einfach durchzureichen).
-- =========================================================================

create view employees_view
with (security_invoker = false)
as
select
  e.id,
  e.name,
  e.role,
  e.active,
  e.created_at,
  case when e.id = auth.uid() or is_privileged() then e.email else null end as email,
  case when e.id = auth.uid() or is_privileged() then e.rate_cents else null end as rate_cents
from employees e;

grant select on employees_view to authenticated;

create view shift_details
with (security_invoker = false)
as
select
  s.id,
  s.employee_id,
  e.name as employee_name,
  s.work_date,
  s.start_time,
  s.end_time,
  shift_minutes(s.start_time, s.end_time) as minutes,
  round(shift_minutes(s.start_time, s.end_time) / 60.0, 2) as hours,
  s.note,
  s.paid,
  s.paid_on,
  s.payout_id,
  s.created_by,
  s.created_at,
  s.updated_at,
  case when s.employee_id = auth.uid() or is_privileged() then e.rate_cents else null end as rate_cents,
  case when s.employee_id = auth.uid() or is_privileged()
    then shift_amount_cents(s.start_time, s.end_time, e.rate_cents)
    else null end as amount_cents
from shifts s
join employees e on e.id = s.employee_id;

grant select on shift_details to authenticated;

-- Basistabellen bleiben per Grant zusätzlich zur RLS zugänglich, damit
-- Inserts/Updates/Deletes (die über die Tabelle, nicht die View laufen)
-- funktionieren; Leserechte auf employees.rate_cents/email direkt auf der
-- Tabelle sind für "mitarbeiter" durch employees_select (Zeile 1) auf die
-- eigene Zeile begrenzt.
grant select, insert, update, delete on shifts to authenticated;
grant select, insert on payouts to authenticated;
grant select, insert, update on employees to authenticated;
grant select on audit_log to authenticated;

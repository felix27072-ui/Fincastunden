-- Chef-Konten (z. B. Joe) sollen standardmäßig NICHT im Wochenplan und der
-- Abrechnung als Mitarbeiter auftauchen — nur wer explizit eigene Stunden
-- erfasst (z. B. Felix), bekommt logs_hours über die Team-Bearbeiten-
-- Funktion auf true gesetzt.

alter table employees add column if not exists logs_hours boolean not null default false;

create or replace view employees_view
with (security_invoker = false)
as
select
  e.id,
  e.name,
  e.role,
  e.active,
  e.created_at,
  case when e.id = auth.uid() or is_privileged() then e.email else null end as email,
  case when e.id = auth.uid() or is_privileged() then e.rate_cents else null end as rate_cents,
  e.logs_hours
from employees e;

grant select on employees_view to authenticated;

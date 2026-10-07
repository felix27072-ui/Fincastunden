-- Lesbares Änderungsprotokoll für die Abrechnung: löst Actor- und
-- Betroffene-Person-Namen auf. Wie employees_view/shift_details umgeht
-- diese View RLS auf der Basistabelle, deshalb wird dieselbe Sichtbarkeit
-- wie in der audit_log-Policy (0001_init.sql) hier erneut per WHERE
-- nachgebildet statt einfach durchgereicht.

create view audit_log_view
with (security_invoker = false)
as
select
  a.id,
  a.entity,
  a.entity_id,
  a.action,
  a.before,
  a.after,
  a.actor,
  actor_emp.name as actor_name,
  a.at,
  case
    when a.entity = 'employee' then coalesce(a.after, a.before) ->> 'name'
    else subject_emp.name
  end as subject_name
from audit_log a
left join employees actor_emp on actor_emp.id = a.actor
left join employees subject_emp
  on a.entity in ('shift', 'payout')
  and subject_emp.id = (coalesce(a.after, a.before) ->> 'employee_id')::uuid
where
  public.is_privileged()
  or (a.entity = 'shift' and exists (
        select 1 from shifts s where s.id = a.entity_id and s.employee_id = auth.uid()))
  or (a.entity = 'payout' and exists (
        select 1 from payouts p where p.id = a.entity_id and p.employee_id = auth.uid()))
  or (a.entity = 'employee' and a.entity_id = auth.uid());

grant select on audit_log_view to authenticated;

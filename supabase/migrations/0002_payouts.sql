-- Auszahlen: eine atomare Funktion statt zweier getrennter Schreibzugriffe
-- aus dem Client, damit nie ein Payout ohne die zugehörigen "paid"-Flags auf
-- den Schichten entstehen kann (oder umgekehrt). security invoker (Standard)
-- — die Funktion läuft mit den Rechten der aufrufenden Person, RLS auf
-- payouts/shifts greift also unverändert.
--
-- Storage-Bucket "signatures" für die Unterschriftsbilder aus der
-- Auszahlungsquittung (Canvas als PNG), privat mit RLS wie die Tabellen.

create or replace function create_payout(
  p_id uuid,
  p_employee_id uuid,
  p_shift_ids uuid[],
  p_signature_path text
)
returns payouts
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_total_cents int;
  v_minutes int;
  v_found_count int;
  v_payout payouts;
begin
  if p_shift_ids is null or array_length(p_shift_ids, 1) is null then
    raise exception 'Keine Schichten ausgewählt.';
  end if;

  select count(*) into v_found_count from shifts where id = any(p_shift_ids);
  if v_found_count <> array_length(p_shift_ids, 1) then
    raise exception 'Eine oder mehrere Schichten wurden nicht gefunden.';
  end if;

  if exists (
    select 1 from shifts
    where id = any(p_shift_ids)
      and (employee_id <> p_employee_id or paid)
  ) then
    raise exception 'Nur eigene, noch offene Schichten können ausgezahlt werden.';
  end if;

  select
    coalesce(sum(shift_amount_cents(s.start_time, s.end_time, e.rate_cents)), 0),
    coalesce(sum(shift_minutes(s.start_time, s.end_time)), 0)
  into v_total_cents, v_minutes
  from shifts s
  join employees e on e.id = s.employee_id
  where s.id = any(p_shift_ids);

  insert into payouts (id, employee_id, paid_on, total_cents, minutes, signature_path, confirmed_by)
  values (p_id, p_employee_id, current_date, v_total_cents, v_minutes, p_signature_path, auth.uid())
  returning * into v_payout;

  update shifts
  set paid = true, paid_on = v_payout.paid_on, payout_id = v_payout.id
  where id = any(p_shift_ids);

  return v_payout;
end;
$$;

grant execute on function create_payout(uuid, uuid, uuid[], text) to authenticated;

-- Unterschriften: privater Bucket, Pfad "<employee_id>/<payout_id>.png".
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

create policy "signatures_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'signatures'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.auth_employee_role() = 'chef'
  )
);

create policy "signatures_select" on storage.objects
for select to authenticated
using (
  bucket_id = 'signatures'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_privileged()
  )
);

-- Harden helper functions against search_path manipulation.
alter function public.shift_minutes(time without time zone, time without time zone)
  set search_path = public, pg_temp;

alter function public.shift_amount_cents(time without time zone, time without time zone, integer)
  set search_path = public, pg_temp;

alter function public.set_updated_at()
  set search_path = public, pg_temp;

-- The audit trigger is invoked by table triggers only; clients do not need
-- to call it directly through PostgREST/RPC.
revoke execute on function public.audit_trigger_fn() from public, anon, authenticated;

-- Cover foreign keys used for joins/deletes.
create index if not exists audit_log_actor_idx on public.audit_log(actor);
create index if not exists payouts_confirmed_by_idx on public.payouts(confirmed_by);
create index if not exists shifts_created_by_idx on public.shifts(created_by);
create index if not exists shifts_payout_id_idx on public.shifts(payout_id);

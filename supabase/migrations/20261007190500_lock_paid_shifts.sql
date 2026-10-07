-- Keep confirmed payouts consistent with their underlying shifts.
-- A shift may transition from unpaid -> paid during payout creation, but once
-- OLD.paid is true it becomes immutable.

create or replace function public.prevent_paid_shift_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.paid then
    raise exception 'Ausgezahlte Schichten sind gesperrt und können nicht mehr geändert oder gelöscht werden.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_paid_shift_mutation() from public, anon, authenticated;

drop trigger if exists shifts_lock_paid on public.shifts;

create trigger shifts_lock_paid
before update or delete on public.shifts
for each row
execute function public.prevent_paid_shift_mutation();

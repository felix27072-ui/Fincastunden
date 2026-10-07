-- Cache auth/helper lookups once per statement instead of once per row.
alter policy employees_select on public.employees
  using (
    id = (select auth.uid())
    or (select public.is_privileged())
  );

alter policy employees_insert on public.employees
  with check ((select public.auth_employee_role()) = 'chef');

alter policy employees_update on public.employees
  using ((select public.auth_employee_role()) = 'chef')
  with check ((select public.auth_employee_role()) = 'chef');

alter policy shifts_insert on public.shifts
  with check (
    employee_id = (select auth.uid())
    or (select public.auth_employee_role()) = 'chef'
  );

alter policy shifts_update on public.shifts
  using (
    employee_id = (select auth.uid())
    or (select public.auth_employee_role()) = 'chef'
  )
  with check (
    employee_id = (select auth.uid())
    or (select public.auth_employee_role()) = 'chef'
  );

alter policy shifts_delete on public.shifts
  using (
    employee_id = (select auth.uid())
    or (select public.auth_employee_role()) = 'chef'
  );

alter policy payouts_select on public.payouts
  using (
    employee_id = (select auth.uid())
    or (select public.is_privileged())
  );

alter policy payouts_insert on public.payouts
  with check (
    employee_id = (select auth.uid())
    or (select public.auth_employee_role()) = 'chef'
  );

alter policy audit_log_select on public.audit_log
  using (
    (select public.is_privileged())
    or (
      entity = 'shift'
      and exists (
        select 1
        from public.shifts s
        where s.id = audit_log.entity_id
          and s.employee_id = (select auth.uid())
      )
    )
    or (
      entity = 'payout'
      and exists (
        select 1
        from public.payouts p
        where p.id = audit_log.entity_id
          and p.employee_id = (select auth.uid())
      )
    )
    or (
      entity = 'employee'
      and entity_id = (select auth.uid())
    )
  );

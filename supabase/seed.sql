-- Preview/local test data only. Never run against production.
-- Placeholder auth users intentionally have no login password/identity.
-- They exist only so FKs and UI data can be exercised safely.

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated',
   'chef.preview@fincastunden.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated',
   'luca.preview@fincastunden.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated',
   'maria.preview@fincastunden.invalid', '', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
on conflict (id) do nothing;

insert into public.employees (id, name, email, rate_cents, role, active, logs_hours)
values
  ('11111111-1111-4111-8111-111111111111', 'Test Chef', 'chef.preview@fincastunden.invalid', 1600, 'chef', true, true),
  ('22222222-2222-4222-8222-222222222222', 'Luca Test', 'luca.preview@fincastunden.invalid', 1390, 'mitarbeiter', true, false),
  ('33333333-3333-4333-8333-333333333333', 'Maria Test', 'maria.preview@fincastunden.invalid', 1450, 'mitarbeiter', true, false)
on conflict (id) do nothing;

insert into public.shifts (
  id, employee_id, work_date, start_time, end_time, note,
  paid, paid_on, payout_id, created_by
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '22222222-2222-4222-8222-222222222222', '2026-10-05', '10:00', '16:30', 'Test · bereits ausgezahlt', true, '2026-10-06', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', '2026-10-06', '17:00', '23:15', 'Test · offen', false, null, null, '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '33333333-3333-4333-8333-333333333333', '2026-10-05', '18:00', '00:30', 'Test · über Mitternacht', false, null, null, '11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '11111111-1111-4111-8111-111111111111', '2026-10-07', '12:00', '15:00', 'Test Chef-Schicht', false, null, null, '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into public.payouts (
  id, employee_id, paid_on, total_cents, minutes, signature_path, confirmed_by
) values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  '22222222-2222-4222-8222-222222222222',
  '2026-10-06', 9035, 390, null,
  '11111111-1111-4111-8111-111111111111'
)
on conflict (id) do nothing;

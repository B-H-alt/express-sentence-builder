-- Rollback-only verification for Expressly account isolation.
-- This creates temporary synthetic users and leaves no records behind.

begin;

create temporary table security_test_results (
  test text primary key,
  passed boolean not null
) on commit drop;

grant select, insert on table pg_temp.security_test_results to authenticated;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'security-a@invalid.example',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'security-b@invalid.example',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

insert into public.learner_profiles (
  id,
  owner_user_id,
  display_name
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-4111-8111-111111111111',
  'Synthetic learner A'
);

insert into pg_temp.security_test_results (test, passed)
select
  'user_a_reads_own_profile',
  count(*) = 1
from public.learner_profiles;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);

insert into pg_temp.security_test_results (test, passed)
select
  'user_b_cannot_read_user_a_profile',
  count(*) = 0
from public.learner_profiles;

insert into public.learner_profiles (
  id,
  owner_user_id,
  display_name
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '22222222-2222-4222-8222-222222222222',
  'Synthetic learner B'
);

insert into pg_temp.security_test_results (test, passed)
select
  'user_b_reads_only_own_profile',
  count(*) = 1
from public.learner_profiles;

insert into pg_temp.security_test_results (test, passed)
select
  'signed_in_usage_meter_is_identity_bound',
  (public.consume_feature_usage('grammar', 1)->>'allowed')::boolean;

reset role;

insert into pg_temp.security_test_results (test, passed)
select
  'anonymous_cannot_call_usage_meter',
  not has_function_privilege(
    'anon',
    'public.consume_feature_usage(text, integer)',
    'execute'
  ) as passed
union all
select
  'signed_in_user_can_call_usage_meter',
  has_function_privilege(
    'authenticated',
    'public.consume_feature_usage(text, integer)',
    'execute'
  )
union all
select
  'all_private_tables_force_rls',
  bool_and(relrowsecurity and relforcerowsecurity)
from pg_class
where oid in (
  'public.learner_profiles'::regclass,
  'public.custom_cards'::regclass,
  'public.sentence_events'::regclass,
  'public.account_entitlements'::regclass,
  'public.feature_usage'::regclass
);

select test, passed
from pg_temp.security_test_results
order by test;

rollback;

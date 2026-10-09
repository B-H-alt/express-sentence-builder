-- Server-authoritative access and usage controls for paid API features.

-- Supabase's security advisor flags this helper when dashboard tooling has
-- installed it with default PUBLIC execution rights. It is an administrative
-- function and must never be callable through the public API.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

create table if not exists public.account_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'preview'
    check (plan in ('preview', 'free', 'plus', 'care_team', 'internal_team')),
  access_source text not null default 'trial'
    check (access_source in ('default', 'paid', 'trial', 'complimentary', 'internal')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('grammar', 'voice', 'image_generation')),
  period_start date not null,
  used bigint not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, feature, period_start)
);

alter table public.account_entitlements enable row level security;
alter table public.feature_usage enable row level security;
alter table public.account_entitlements force row level security;
alter table public.feature_usage force row level security;
alter table public.learner_profiles force row level security;
alter table public.custom_cards force row level security;
alter table public.sentence_events force row level security;

create index if not exists custom_cards_owner_idx on public.custom_cards(owner_user_id);
create index if not exists sentence_events_owner_idx on public.sentence_events(owner_user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sentence_events_card_labels_size'
  ) then
    alter table public.sentence_events
      add constraint sentence_events_card_labels_size
      check (jsonb_array_length(card_labels) between 1 and 100 and octet_length(card_labels::text) <= 10000)
      not valid;
  end if;
end;
$$;

revoke all on table public.account_entitlements from anon, authenticated;
revoke all on table public.feature_usage from anon, authenticated;
grant select on table public.account_entitlements to authenticated;
grant select on table public.feature_usage to authenticated;

drop policy if exists "Users read their own entitlement" on public.account_entitlements;
create policy "Users read their own entitlement"
on public.account_entitlements for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users read their own usage" on public.feature_usage;
create policy "Users read their own usage"
on public.feature_usage for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.create_default_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.account_entitlements (user_id, plan, access_source, status)
  values (new.id, 'preview', 'trial', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_default_entitlement_after_signup on auth.users;
create trigger create_default_entitlement_after_signup
after insert on auth.users
for each row execute function public.create_default_entitlement();

-- Preserve access for accounts that existed before this migration. Preview is
-- temporary and can be converted to free, paid, complimentary, or internal.
insert into public.account_entitlements (user_id, plan, access_source, status)
select id, 'preview', 'trial', 'active' from auth.users
on conflict (user_id) do nothing;

create or replace function public.consume_feature_usage(
  p_feature text,
  p_amount integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan text;
  v_status text;
  v_valid_until timestamptz;
  v_limit bigint;
  v_used bigint;
  v_period date := date_trunc('month', now())::date;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;
  if p_feature not in ('grammar', 'voice', 'image_generation') then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_feature');
  end if;
  if p_amount is null or p_amount < 1 or p_amount > 10000 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_amount');
  end if;

  select plan, status, valid_until
  into v_plan, v_status, v_valid_until
  from public.account_entitlements
  where user_id = v_user_id;

  if v_plan is null or v_status not in ('active', 'trialing')
     or (v_valid_until is not null and v_valid_until <= now()) then
    return jsonb_build_object('allowed', false, 'reason', 'no_access');
  end if;

  if v_plan = 'internal_team' then
    return jsonb_build_object('allowed', true, 'remaining', null, 'plan', v_plan);
  end if;

  v_limit := case
    when v_plan = 'free' then 0
    when v_plan in ('preview', 'plus') and p_feature = 'grammar' then 1000
    when v_plan in ('preview', 'plus') and p_feature = 'voice' then 100000
    when v_plan in ('preview', 'plus') and p_feature = 'image_generation' then 20
    when v_plan = 'care_team' and p_feature = 'grammar' then 5000
    when v_plan = 'care_team' and p_feature = 'voice' then 500000
    when v_plan = 'care_team' and p_feature = 'image_generation' then 75
    else 0
  end;

  if v_limit = 0 or p_amount > v_limit then
    return jsonb_build_object('allowed', false, 'reason', 'plan_not_included', 'plan', v_plan);
  end if;

  insert into public.feature_usage (user_id, feature, period_start, used)
  values (v_user_id, p_feature, v_period, p_amount)
  on conflict (user_id, feature, period_start)
  do update set
    used = public.feature_usage.used + excluded.used,
    updated_at = now()
  where public.feature_usage.used + excluded.used <= v_limit
  returning used into v_used;

  if v_used is null then
    return jsonb_build_object('allowed', false, 'reason', 'limit_reached', 'plan', v_plan);
  end if;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(v_limit - v_used, 0),
    'plan', v_plan
  );
end;
$$;

revoke all on function public.consume_feature_usage(text, integer) from public, anon;
grant execute on function public.consume_feature_usage(text, integer) to authenticated;

revoke all on function public.create_default_entitlement() from public, anon, authenticated;

create or replace function public.enforce_account_data_quota()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_plan text;
  v_limit integer;
  v_count bigint;
begin
  if auth.uid() is null or new.owner_user_id <> auth.uid() then
    raise insufficient_privilege using message = 'Invalid account owner';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.owner_user_id::text, 0));
  select plan into v_plan from public.account_entitlements where user_id = new.owner_user_id;
  v_plan := coalesce(v_plan, 'free');

  if tg_table_name = 'learner_profiles' then
    v_limit := case when v_plan = 'care_team' then 3 when v_plan = 'internal_team' then 100 else 1 end;
    select count(*) into v_count from public.learner_profiles where owner_user_id = new.owner_user_id;
  elsif tg_table_name = 'custom_cards' then
    v_limit := case when v_plan = 'free' then 5 when v_plan in ('preview', 'plus') then 500
                    when v_plan = 'care_team' then 2000 else 10000 end;
    select count(*) into v_count from public.custom_cards where owner_user_id = new.owner_user_id;
  elsif tg_table_name = 'sentence_events' then
    v_limit := case when v_plan = 'free' then 500 when v_plan in ('preview', 'plus') then 10000
                    when v_plan = 'care_team' then 50000 else 250000 end;
    select count(*) into v_count from public.sentence_events where owner_user_id = new.owner_user_id;
  else
    raise exception 'Unsupported quota table';
  end if;

  if v_count >= v_limit then
    raise check_violation using message = 'Account data limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists learner_profiles_enforce_quota on public.learner_profiles;
create trigger learner_profiles_enforce_quota
before insert on public.learner_profiles
for each row execute function public.enforce_account_data_quota();

drop trigger if exists custom_cards_enforce_quota on public.custom_cards;
create trigger custom_cards_enforce_quota
before insert on public.custom_cards
for each row execute function public.enforce_account_data_quota();

drop trigger if exists sentence_events_enforce_quota on public.sentence_events;
create trigger sentence_events_enforce_quota
before insert on public.sentence_events
for each row execute function public.enforce_account_data_quota();

revoke all on function public.enforce_account_data_quota() from public, anon, authenticated;

-- Stop rapid paid-feature requests before they reach external providers.

create table if not exists public.feature_rate_windows (
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('grammar', 'voice', 'image_generation')),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, feature)
);

alter table public.feature_rate_windows enable row level security;
alter table public.feature_rate_windows force row level security;
revoke all on table public.feature_rate_windows from public, anon, authenticated;

create or replace function public.enforce_feature_rate_limit(p_feature text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_count integer;
  v_window_started_at timestamptz;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  v_limit := case p_feature
    when 'grammar' then 10
    when 'voice' then 5
    when 'image_generation' then 2
    else null
  end;

  if v_limit is null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_feature');
  end if;

  insert into public.feature_rate_windows (
    user_id,
    feature,
    window_started_at,
    request_count
  )
  values (v_user_id, p_feature, now(), 1)
  on conflict (user_id, feature)
  do update set
    window_started_at = case
      when public.feature_rate_windows.window_started_at <= now() - interval '1 minute'
        then now()
      else public.feature_rate_windows.window_started_at
    end,
    request_count = case
      when public.feature_rate_windows.window_started_at <= now() - interval '1 minute'
        then 1
      else public.feature_rate_windows.request_count + 1
    end
  where public.feature_rate_windows.window_started_at <= now() - interval '1 minute'
     or public.feature_rate_windows.request_count < v_limit
  returning request_count, window_started_at
  into v_count, v_window_started_at;

  if v_count is null then
    select request_count, window_started_at
    into v_count, v_window_started_at
    from public.feature_rate_windows
    where user_id = v_user_id and feature = p_feature;

    return jsonb_build_object(
      'allowed', false,
      'reason', 'rate_limit_reached',
      'retry_after', greatest(
        1,
        ceil(extract(epoch from (v_window_started_at + interval '1 minute' - now())))::integer
      )
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'remaining_in_window', greatest(v_limit - v_count, 0)
  );
end;
$$;

revoke all on function public.enforce_feature_rate_limit(text) from public, anon, authenticated;

do $$
begin
  if to_regprocedure('public.consume_feature_usage_monthly(text,integer)') is null then
    alter function public.consume_feature_usage(text, integer)
    rename to consume_feature_usage_monthly;
  end if;
end;
$$;

revoke all on function public.consume_feature_usage_monthly(text, integer)
from public, anon, authenticated;

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
  v_rate_decision jsonb;
begin
  v_rate_decision := public.enforce_feature_rate_limit(p_feature);

  if not coalesce((v_rate_decision ->> 'allowed')::boolean, false) then
    return v_rate_decision;
  end if;

  return public.consume_feature_usage_monthly(p_feature, p_amount);
end;
$$;

revoke all on function public.consume_feature_usage(text, integer) from public, anon;
grant execute on function public.consume_feature_usage(text, integer) to authenticated;

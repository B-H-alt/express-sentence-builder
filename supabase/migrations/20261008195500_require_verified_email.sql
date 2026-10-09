-- Paid features require a confirmed email, even if a session is obtained by
-- another authentication flow.

create or replace function public.current_user_email_is_verified()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from auth.users
    where id = auth.uid()
      and email_confirmed_at is not null
  );
$$;

revoke all on function public.current_user_email_is_verified()
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
  if not public.current_user_email_is_verified() then
    return jsonb_build_object('allowed', false, 'reason', 'email_not_confirmed');
  end if;

  v_rate_decision := public.enforce_feature_rate_limit(p_feature);

  if not coalesce((v_rate_decision ->> 'allowed')::boolean, false) then
    return v_rate_decision;
  end if;

  return public.consume_feature_usage_monthly(p_feature, p_amount);
end;
$$;

revoke all on function public.consume_feature_usage(text, integer) from public, anon;
grant execute on function public.consume_feature_usage(text, integer) to authenticated;


-- Owner-managed free team access. This is not database administrator access.
begin;

create table if not exists public.internal_team_emails (
  email text primary key check (email = lower(btrim(email))),
  created_at timestamptz not null default now()
);
alter table public.internal_team_emails enable row level security;
alter table public.internal_team_emails force row level security;
revoke all on public.internal_team_emails from public, anon, authenticated;

insert into public.internal_team_emails (email)
values ('choudhrydawud@gmail.com') on conflict do nothing;

create or replace function public.create_default_entitlement()
returns trigger language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  is_team boolean;
begin
  select exists(select 1 from public.internal_team_emails
    where email = lower(btrim(new.email))) into is_team;
  insert into public.account_entitlements (user_id, plan, access_source, status)
  values (new.id, case when is_team then 'internal_team' else 'preview' end,
    case when is_team then 'internal' else 'trial' end, 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_default_entitlement() from public, anon, authenticated;

-- Also cover existing accounts. Never trust browser-supplied metadata for this.
insert into public.account_entitlements (user_id, plan, access_source, status, valid_until)
select u.id, 'internal_team', 'internal', 'active', null
from auth.users u join public.internal_team_emails t on t.email = lower(btrim(u.email))
on conflict (user_id) do update set plan = 'internal_team', access_source = 'internal',
  status = 'active', valid_until = null, updated_at = now();

commit;

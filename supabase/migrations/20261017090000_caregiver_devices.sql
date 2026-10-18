-- Development first. This migration does not enable cloud sync by itself.
begin;
create table public.caregiver_devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50),
  code_hash text unique not null check (code_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null default now() + interval '10 minutes',
  paired boolean not null default false,
  settings jsonb not null,
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index caregiver_devices_owner on public.caregiver_devices(owner_id);
alter table public.caregiver_devices enable row level security;
-- No direct table privileges or policies: every operation goes through the RPC.
revoke all on public.caregiver_devices from public, anon, authenticated;

create function public.caregiver_device_action(p_action text, p_data jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  device public.caregiver_devices;
  target uuid;
  prefs jsonb;
begin
  if uid is null or not exists(select 1 from auth.users where id = uid and email_confirmed_at is not null) then
    raise exception 'Verified account required' using errcode = '42501';
  end if;
  if p_action not in ('register','pair','list','update','poll','revoke') then raise exception 'Invalid operation'; end if;
  -- Serialize writes per account to enforce quotas and revisions across requests.
  if p_action not in ('list','poll') then perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text, 0)); end if;
  if p_action = 'register' then
    delete from public.caregiver_devices where owner_id = uid and not paired and expires_at < now();
    if (select count(*) from public.caregiver_devices where owner_id = uid) >= 5 then raise exception 'Device limit reached'; end if;
    if exists(select 1 from public.caregiver_devices where owner_id = uid and created_at > now() - interval '30 seconds') then raise exception 'Please wait before creating another code'; end if;
    prefs := p_data->'settings';
  elsif p_action = 'update' then
    prefs := p_data->'settings';
  end if;
  if p_action in ('register','update') then
    if prefs is null or jsonb_typeof(prefs) <> 'object' then raise exception 'Invalid settings'; end if;
    if (select count(*) from jsonb_object_keys(prefs)) <> 3
       or jsonb_typeof(prefs->'calm') is distinct from 'boolean'
       or jsonb_typeof(prefs->'volume') is distinct from 'number'
       or jsonb_typeof(prefs->'level') is distinct from 'number'
       or (prefs->>'volume')::numeric not between 0.1 and 1
       or (prefs->>'level')::numeric not in (1,2,3,4,5) then raise exception 'Invalid settings'; end if;
  end if;
  if p_action = 'register' then
    if coalesce(p_data->>'code_hash','') !~ '^[a-f0-9]{64}$' then raise exception 'Invalid pairing code'; end if;
    insert into public.caregiver_devices(owner_id,name,code_hash,settings)
      values(uid,trim(p_data->>'name'),p_data->>'code_hash',prefs) returning * into device;
  elsif p_action = 'pair' then
    update public.caregiver_devices set paired = true
      where owner_id = uid and code_hash = p_data->>'code_hash' and not paired and expires_at > now()
      returning * into device;
    if device.id is null then raise exception 'Code invalid or expired'; end if;
  elsif p_action = 'list' then
    return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'settings',settings,'revision',revision,'updated_at',updated_at) order by name)
      from public.caregiver_devices where owner_id = uid and paired), '[]'::jsonb);
  else
    target := (p_data->>'id')::uuid;
    select * into device from public.caregiver_devices where id = target and owner_id = uid;
    if device.id is null then raise exception 'Device unavailable'; end if;
    if p_action = 'revoke' then
      delete from public.caregiver_devices where id = target and owner_id = uid;
      return jsonb_build_object('ok',true);
    elsif p_action = 'update' then
      if not device.paired then raise exception 'Pair this device first'; end if;
      if device.revision <> (p_data->>'revision')::integer or p_data->>'revision' is null then raise exception 'Settings changed; refresh before saving'; end if;
      if device.revision > 0 and device.updated_at > now() - interval '2 seconds' then raise exception 'Please wait before saving again'; end if;
      update public.caregiver_devices set settings = prefs, revision = revision + 1, updated_at = now()
        where id = target and owner_id = uid returning * into device;
    end if;
  end if;
  return jsonb_build_object('id',device.id,'name',device.name,'settings',device.settings,'revision',device.revision,'paired',device.paired,'updated_at',device.updated_at);
end;
$$;
revoke all on function public.caregiver_device_action(text,jsonb) from public, anon;
grant execute on function public.caregiver_device_action(text,jsonb) to authenticated;
commit;

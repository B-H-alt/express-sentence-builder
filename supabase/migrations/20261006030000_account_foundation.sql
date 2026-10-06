-- Expressly account foundation
-- Apply to a development Supabase project first. Do not run directly in production.

create extension if not exists pgcrypto;

create table public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_path text check (avatar_path is null or char_length(avatar_path) <= 500),
  character_gender text not null default 'girl' check (character_gender in ('girl', 'boy')),
  vocabulary_level smallint not null default 1 check (vocabulary_level between 1 and 3),
  cards_per_page text not null default 'all' check (cards_per_page in ('4', '8', '12', 'all')),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_user_id)
);

create table public.custom_cards (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 80),
  category text not null check (char_length(category) between 1 and 50),
  image_path text check (image_path is null or char_length(image_path) <= 500),
  vocabulary_level smallint not null check (vocabulary_level between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (learner_id, owner_user_id)
    references public.learner_profiles(id, owner_user_id)
    on delete cascade
);

create table public.sentence_events (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  word_count smallint not null check (word_count between 1 and 100),
  card_labels jsonb not null check (jsonb_typeof(card_labels) = 'array'),
  sentence_text text not null check (char_length(sentence_text) between 1 and 500),
  foreign key (learner_id, owner_user_id)
    references public.learner_profiles(id, owner_user_id)
    on delete cascade
);

create index learner_profiles_owner_idx on public.learner_profiles(owner_user_id);
create index custom_cards_learner_idx on public.custom_cards(learner_id);
create index sentence_events_learner_date_idx
  on public.sentence_events(learner_id, completed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row execute function public.set_updated_at();

create trigger custom_cards_set_updated_at
before update on public.custom_cards
for each row execute function public.set_updated_at();

alter table public.learner_profiles enable row level security;
alter table public.custom_cards enable row level security;
alter table public.sentence_events enable row level security;

revoke all on table public.learner_profiles from anon, authenticated;
revoke all on table public.custom_cards from anon, authenticated;
revoke all on table public.sentence_events from anon, authenticated;

grant select, insert, update, delete on table public.learner_profiles to authenticated;
grant select, insert, update, delete on table public.custom_cards to authenticated;
grant select, insert, delete on table public.sentence_events to authenticated;

create policy "Parents select their learner profiles"
on public.learner_profiles for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents create their learner profiles"
on public.learner_profiles for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents update their learner profiles"
on public.learner_profiles for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents delete their learner profiles"
on public.learner_profiles for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents select their custom cards"
on public.custom_cards for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents create their custom cards"
on public.custom_cards for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents update their custom cards"
on public.custom_cards for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents delete their custom cards"
on public.custom_cards for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents select their sentence events"
on public.sentence_events for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents create their sentence events"
on public.sentence_events for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

create policy "Parents delete their sentence events"
on public.sentence_events for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = owner_user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expressly-private',
  'expressly-private',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Parents read their private images"
on storage.objects for select to authenticated
using (
  bucket_id = 'expressly-private'
  and (select auth.uid())::text = split_part(name, '/', 1)
);

create policy "Parents upload their private images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'expressly-private'
  and (select auth.uid())::text = split_part(name, '/', 1)
);

create policy "Parents update their private images"
on storage.objects for update to authenticated
using (
  bucket_id = 'expressly-private'
  and (select auth.uid())::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'expressly-private'
  and (select auth.uid())::text = split_part(name, '/', 1)
);

create policy "Parents delete their private images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'expressly-private'
  and (select auth.uid())::text = split_part(name, '/', 1)
);

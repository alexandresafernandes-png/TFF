-- ─────────────────────────────────────────────────────────────────────────────
-- TFF — Phase 1 Initial Schema
-- Migration: 001_initial_tff_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own row only"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── user_settings ───────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  key         text not null,
  value       jsonb,
  updated_at  timestamptz default now(),
  unique(user_id, key)
);

alter table public.user_settings enable row level security;

create policy "user_settings: own rows only"
  on public.user_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── checklist_completions ───────────────────────────────────────────────────
create table if not exists public.checklist_completions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  checklist_item_id text not null,  -- references /data/checklist_items.json id
  completed_date  date not null default current_date,
  notes           text,
  created_at      timestamptz default now(),
  unique(user_id, checklist_item_id, completed_date)
);

alter table public.checklist_completions enable row level security;

create policy "checklist_completions: own rows only"
  on public.checklist_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── shopping_status ─────────────────────────────────────────────────────────
create table if not exists public.shopping_status (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  shopping_item_id text not null,  -- references /data/shopping_items.json id
  status          text not null default 'pending', -- pending | purchased | skipped
  updated_at      timestamptz default now(),
  unique(user_id, shopping_item_id)
);

alter table public.shopping_status enable row level security;

create policy "shopping_status: own rows only"
  on public.shopping_status
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── active_protocols ────────────────────────────────────────────────────────
create table if not exists public.active_protocols (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  protocol_id text not null,  -- references /data/protocols.json id
  started_at  timestamptz default now(),
  ended_at    timestamptz,
  active      boolean default true,
  unique(user_id, protocol_id)
);

alter table public.active_protocols enable row level security;

create policy "active_protocols: own rows only"
  on public.active_protocols
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── personal_notes ──────────────────────────────────────────────────────────
create table if not exists public.personal_notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,  -- food | supplement | protocol | blood_marker | general
  entity_id   text,           -- references the id in the relevant JSON file
  content     text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.personal_notes enable row level security;

create policy "personal_notes: own rows only"
  on public.personal_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── user_day_state ──────────────────────────────────────────────────────────
create table if not exists public.user_day_state (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null default current_date,
  state       jsonb default '{}'::jsonb,  -- flexible daily state blob
  updated_at  timestamptz default now(),
  unique(user_id, date)
);

alter table public.user_day_state enable row level security;

create policy "user_day_state: own rows only"
  on public.user_day_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (create via Supabase dashboard or CLI — not in migration)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Required private buckets:
--
--   bloodwork       — user bloodwork PDF uploads
--   progress-photos — user progress photo uploads
--   backups         — user data export backups
--   references      — user-uploaded reference documents
--
-- All buckets MUST be private (public: false).
--
-- Path convention: {user_id}/{file_type}/{filename}
--
-- Storage RLS policies (apply per bucket after bucket creation):
--
--   allow authenticated users to select/insert/update/delete
--   only objects where (storage.foldername(name))[1] = auth.uid()::text
--
-- Example policy SQL (run after bucket creation):
--
--   create policy "bloodwork: own files only"
--   on storage.objects for all
--   using (
--     bucket_id = 'bloodwork' and
--     (storage.foldername(name))[1] = auth.uid()::text
--   )
--   with check (
--     bucket_id = 'bloodwork' and
--     (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Updated-at trigger helper ────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_personal_notes_updated_at
  before update on public.personal_notes
  for each row execute function public.handle_updated_at();

create trigger handle_user_day_state_updated_at
  before update on public.user_day_state
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TODO (Step 1): Profile auto-creation
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Two options — pick one in Step 1:
--
-- OPTION A: Database trigger (preferred — zero client-side risk)
-- Creates a profile row automatically when a new auth.users row is inserted.
--
--   create or replace function public.handle_new_user()
--   returns trigger as $$
--   begin
--     insert into public.profiles (id, email)
--     values (new.id, new.email)
--     on conflict (id) do nothing;
--     return new;
--   end;
--   $$ language plpgsql security definer;
--
--   create trigger on_auth_user_created
--     after insert on auth.users
--     for each row execute function public.handle_new_user();
--
-- OPTION B: Upsert in auth callback (app/auth/callback/route.ts)
-- After exchangeCodeForSession succeeds, call:
--   await supabase.from('profiles').upsert({ id: user.id, email: user.email })
--
-- Recommendation: implement OPTION A (trigger) in Step 1 migration 002.
-- It is more reliable and works regardless of which auth flow is used.
-- ─────────────────────────────────────────────────────────────────────────────

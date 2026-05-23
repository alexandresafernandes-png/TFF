-- ─────────────────────────────────────────────────────────────────────────────
-- TFF — Phase 1.5 Step 3: User Data Schema Foundation
-- Migration: 002_tff_user_data_schema.sql
-- Depends on: 001_initial_tff_schema.sql
-- Run manually via Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
--
-- What this migration does:
--   1.  Creates set_updated_at() trigger function (idempotent alias for handle_updated_at)
--   2.  Creates handle_new_user() + on_auth_user_created trigger (profile auto-creation
--       — resolves the OPTION A TODO left in migration 001)
--   3.  Extends checklist_completions (001) with Phase 1.5 columns
--   4.  Creates checklist_custom_items (new)
--   5.  Creates shopping_custom_items (new)
--   6.  Creates shopping_item_status (new — supersedes shopping_status from 001,
--       adds mode column for retainer/upgrade basket split)
--   7.  Creates routine_completions (new — no equivalent in 001)
--   8.  Creates protocol_tracking (new — supersedes active_protocols from 001,
--       adds status text + notes)
--   9.  Creates user_notes (new — supersedes personal_notes from 001,
--       adds title, renames entity_type→area, content→body)
--   10. Adds performance indexes on all user-owned tables
--
-- Tables from 001 NOT duplicated here (already covered):
--   profiles       → covers the user_profiles spec (id = auth.uid(), display_name, timestamps)
--   user_settings  → covers the user_app_settings spec (key/value per user)
--                    NOTE: column names differ: key/value (001) vs setting_key/setting_value (spec)
--                    Use profiles and user_settings when wiring Phase 2.
-- ─────────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TRIGGER FUNCTION — set_updated_at()
-- ═══════════════════════════════════════════════════════════════════════════════

-- Canonical name going forward. handle_updated_at() from 001 is left intact
-- so its three existing triggers (profiles, personal_notes, user_day_state) keep working.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. PROFILE AUTO-CREATION TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════════
-- Resolves the OPTION A TODO from migration 001.
-- Fires after every auth.users INSERT, creating a matching profiles row automatically.
-- security definer so the function can write to public.profiles regardless of RLS.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- CREATE TRIGGER does not support IF NOT EXISTS — use DROP IF EXISTS first.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. EXTEND checklist_completions (migration 001)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 001 schema: id, user_id, checklist_item_id, completed_date, notes, created_at
-- Phase 1.5 adds: item_source (which system created the item), completed boolean,
--   updated_at. Column renames are intentionally deferred — existing code uses
--   checklist_item_id and completed_date; rename them in Phase 2 once wired.

alter table public.checklist_completions
  add column if not exists item_source  text        not null default 'app',
  add column if not exists completed    boolean     not null default false,
  add column if not exists updated_at   timestamptz          default now();

drop trigger if exists set_checklist_completions_updated_at on public.checklist_completions;
create trigger set_checklist_completions_updated_at
  before update on public.checklist_completions
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. checklist_custom_items
-- ═══════════════════════════════════════════════════════════════════════════════
-- Stores user-created checklist items (not in /data/checklist_items.json).
-- When syncing, these items are referenced by item_source = 'custom'.

create table if not exists public.checklist_custom_items (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  description text,
  category    text,
  priority    text,
  sort_order  integer     not null default 0,
  is_archived boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.checklist_custom_items enable row level security;

drop policy if exists "checklist_custom_items: own rows only" on public.checklist_custom_items;
create policy "checklist_custom_items: own rows only"
  on public.checklist_custom_items
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_checklist_custom_items_updated_at on public.checklist_custom_items;
create trigger set_checklist_custom_items_updated_at
  before update on public.checklist_custom_items
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. shopping_custom_items
-- ═══════════════════════════════════════════════════════════════════════════════
-- Stores user-created shopping items beyond what's in /data/shopping_items.json.
-- mode = 'retainer' → Retainer Basket; mode = 'upgrade' → Upgrade Queue.

create table if not exists public.shopping_custom_items (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  mode        text        not null check (mode in ('retainer', 'upgrade')),
  name        text        not null,
  category    text,
  priority    text,
  frequency   text,
  cost_tier   text,
  purpose     text,
  note        text,
  is_archived boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.shopping_custom_items enable row level security;

drop policy if exists "shopping_custom_items: own rows only" on public.shopping_custom_items;
create policy "shopping_custom_items: own rows only"
  on public.shopping_custom_items
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_shopping_custom_items_updated_at on public.shopping_custom_items;
create trigger set_shopping_custom_items_updated_at
  before update on public.shopping_custom_items
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. shopping_item_status
-- ═══════════════════════════════════════════════════════════════════════════════
-- Tracks bought/planned/checked state per item per mode.
-- Supersedes shopping_status from 001, which lacked the mode column.
-- Migration 001's shopping_status is left intact to avoid breaking anything.
-- Phase 2 wiring should target shopping_item_status.

create table if not exists public.shopping_item_status (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  mode       text        not null check (mode in ('retainer', 'upgrade')),
  item_id    text        not null,
  status     text        not null default 'unchecked',
  updated_at timestamptz not null default now(),
  unique (user_id, mode, item_id)
);

alter table public.shopping_item_status enable row level security;

drop policy if exists "shopping_item_status: own rows only" on public.shopping_item_status;
create policy "shopping_item_status: own rows only"
  on public.shopping_item_status
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_shopping_item_status_updated_at on public.shopping_item_status;
create trigger set_shopping_item_status_updated_at
  before update on public.shopping_item_status
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. routine_completions
-- ═══════════════════════════════════════════════════════════════════════════════
-- Tracks per-user, per-day routine status. No equivalent in migration 001.
-- routine_id references the id field in /data/routines.json.
-- status values: 'inactive' | 'active' | 'done'

create table if not exists public.routine_completions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  routine_id      text        not null,
  completion_date date        not null default current_date,
  status          text        not null default 'inactive',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, routine_id, completion_date)
);

alter table public.routine_completions enable row level security;

drop policy if exists "routine_completions: own rows only" on public.routine_completions;
create policy "routine_completions: own rows only"
  on public.routine_completions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_routine_completions_updated_at on public.routine_completions;
create trigger set_routine_completions_updated_at
  before update on public.routine_completions
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. protocol_tracking
-- ═══════════════════════════════════════════════════════════════════════════════
-- Supersedes active_protocols from 001. Adds status text (vs boolean active)
-- and a notes field. Phase 2 wiring should target protocol_tracking.
-- Migration 001's active_protocols is left intact.
-- protocol_id references the id field in /data/protocols.json.

create table if not exists public.protocol_tracking (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  protocol_id text        not null,
  status      text        not null default 'inactive',
  started_at  timestamptz,
  ended_at    timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, protocol_id)
);

alter table public.protocol_tracking enable row level security;

drop policy if exists "protocol_tracking: own rows only" on public.protocol_tracking;
create policy "protocol_tracking: own rows only"
  on public.protocol_tracking
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_protocol_tracking_updated_at on public.protocol_tracking;
create trigger set_protocol_tracking_updated_at
  before update on public.protocol_tracking
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. user_notes
-- ═══════════════════════════════════════════════════════════════════════════════
-- Supersedes personal_notes from 001. Adds title column, renames entity_type→area
-- and content→body for clarity. Phase 2 wiring should target user_notes.
-- Migration 001's personal_notes is left intact.
-- area examples: 'food', 'supplement', 'protocol', 'bloodwork', 'general'
-- entity_id references the id field in the relevant /data/*.json file, if applicable.

create table if not exists public.user_notes (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  area        text        not null,
  entity_id   text,
  title       text,
  body        text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_notes enable row level security;

drop policy if exists "user_notes: own rows only" on public.user_notes;
create policy "user_notes: own rows only"
  on public.user_notes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_user_notes_updated_at on public.user_notes;
create trigger set_user_notes_updated_at
  before update on public.user_notes
  for each row execute function public.set_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

-- checklist_completions: user + date lookups (daily sync)
create index if not exists idx_checklist_completions_user_date
  on public.checklist_completions (user_id, completed_date);

-- checklist_custom_items: all items for a user
create index if not exists idx_checklist_custom_items_user_id
  on public.checklist_custom_items (user_id);

-- shopping_custom_items: all items for a user
create index if not exists idx_shopping_custom_items_user_id
  on public.shopping_custom_items (user_id);

-- shopping_item_status: per-user per-basket lookups
create index if not exists idx_shopping_item_status_user_mode
  on public.shopping_item_status (user_id, mode);

-- routine_completions: per-user per-day lookups (daily sync)
create index if not exists idx_routine_completions_user_date
  on public.routine_completions (user_id, completion_date);

-- protocol_tracking: per-user active protocol queries
create index if not exists idx_protocol_tracking_user_status
  on public.protocol_tracking (user_id, status);

-- user_notes: per-user lookups
create index if not exists idx_user_notes_user_id
  on public.user_notes (user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- END OF MIGRATION 002
-- ─────────────────────────────────────────────────────────────────────────────

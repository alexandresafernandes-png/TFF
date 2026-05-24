-- Phase 2 Step 5: Macro & Fuel System
-- Two tables: macro_profiles (per-user targets) + daily_fuel_logs (per-user per-day log).
-- No new trigger function needed — reuses set_updated_at() from migration 002.

-- ── macro_profiles ────────────────────────────────────────────────────────────

create table if not exists macro_profiles (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  training_calories   integer,
  training_protein_g  integer,
  training_carbs_g    integer,
  training_fat_g      integer,
  rest_calories       integer,
  rest_protein_g      integer,
  rest_carbs_g        integer,
  rest_fat_g          integer,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (user_id)
);

alter table macro_profiles enable row level security;

drop policy if exists "Owner select" on macro_profiles;
drop policy if exists "Owner insert" on macro_profiles;
drop policy if exists "Owner update" on macro_profiles;

create policy "Owner select" on macro_profiles
  for select using (auth.uid() = user_id);

create policy "Owner insert" on macro_profiles
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on macro_profiles
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

drop trigger if exists set_macro_profiles_updated_at on macro_profiles;
create trigger set_macro_profiles_updated_at
  before update on macro_profiles
  for each row execute procedure set_updated_at();

create index if not exists idx_macro_profiles_user_id
  on macro_profiles (user_id);

-- ── daily_fuel_logs ───────────────────────────────────────────────────────────

create table if not exists daily_fuel_logs (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  log_date         date        not null,
  day_type         text        not null default 'training'
                               check (day_type in ('training', 'rest')),
  meals            jsonb       not null default '[]'::jsonb,
  totals           jsonb       not null default '{}'::jsonb,
  compliance_score numeric     not null default 0,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique (user_id, log_date)
);

alter table daily_fuel_logs enable row level security;

drop policy if exists "Owner select" on daily_fuel_logs;
drop policy if exists "Owner insert" on daily_fuel_logs;
drop policy if exists "Owner update" on daily_fuel_logs;

create policy "Owner select" on daily_fuel_logs
  for select using (auth.uid() = user_id);

create policy "Owner insert" on daily_fuel_logs
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on daily_fuel_logs
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

drop trigger if exists set_daily_fuel_logs_updated_at on daily_fuel_logs;
create trigger set_daily_fuel_logs_updated_at
  before update on daily_fuel_logs
  for each row execute procedure set_updated_at();

create index if not exists idx_daily_fuel_logs_user_id
  on daily_fuel_logs (user_id);

create index if not exists idx_daily_fuel_logs_user_date_desc
  on daily_fuel_logs (user_id, log_date desc);

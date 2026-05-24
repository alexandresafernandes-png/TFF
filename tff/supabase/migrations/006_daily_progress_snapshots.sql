-- Phase 2 Step 2: Streak Engine / Daily History
-- Records daily progress snapshots for streak and history tracking.
-- Unique constraint on (user_id, progress_date) — upsert is safe and idempotent.

create table if not exists daily_progress_snapshots (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  progress_date       date        not null,
  score               numeric     not null default 0,
  checklist_completed integer     not null default 0,
  checklist_total     integer     not null default 0,
  routines_completed  integer     not null default 0,
  routines_active     integer     not null default 0,
  protocols_active    integer     not null default 0,
  protocols_completed integer     not null default 0,
  notes_count         integer     not null default 0,
  metrics             jsonb       not null default '{}'::jsonb,
  created_at          timestamptz          default now(),
  updated_at          timestamptz          default now(),
  unique (user_id, progress_date)
);

-- RLS
alter table daily_progress_snapshots enable row level security;

drop policy if exists "Owner select" on daily_progress_snapshots;
drop policy if exists "Owner insert" on daily_progress_snapshots;
drop policy if exists "Owner update" on daily_progress_snapshots;
drop policy if exists "Owner delete" on daily_progress_snapshots;

create policy "Owner select" on daily_progress_snapshots
  for select using (auth.uid() = user_id);

create policy "Owner insert" on daily_progress_snapshots
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on daily_progress_snapshots
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

create policy "Owner delete" on daily_progress_snapshots
  for delete using (auth.uid() = user_id);

-- updated_at trigger (reuses set_updated_at() from migration 002)
drop trigger if exists set_daily_progress_snapshots_updated_at on daily_progress_snapshots;

create trigger set_daily_progress_snapshots_updated_at
  before update on daily_progress_snapshots
  for each row execute procedure set_updated_at();

-- Indexes
create index if not exists idx_daily_progress_snapshots_user_id
  on daily_progress_snapshots (user_id);

create index if not exists idx_daily_progress_snapshots_user_date_desc
  on daily_progress_snapshots (user_id, progress_date desc);

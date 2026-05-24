-- Phase 2 Step 6: Supplement Schedule
-- Two tables: supplement_schedule_items (user-defined items) +
-- supplement_schedule_completions (per-item per-day completion).
-- No new trigger function needed — reuses set_updated_at() from migration 002.

-- ── supplement_schedule_items ─────────────────────────────────────────────────

create table if not exists supplement_schedule_items (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  name           text        not null,
  dose_text      text,
  timing_block   text        not null default 'custom'
                             check (timing_block in ('morning','midday','pre_workout','evening','night','custom')),
  instructions   text,
  is_active      boolean     not null default true,
  sort_order     integer     not null default 0,
  source         text        not null default 'manual',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table supplement_schedule_items enable row level security;

drop policy if exists "Owner select" on supplement_schedule_items;
drop policy if exists "Owner insert" on supplement_schedule_items;
drop policy if exists "Owner update" on supplement_schedule_items;
drop policy if exists "Owner delete" on supplement_schedule_items;

create policy "Owner select" on supplement_schedule_items
  for select using (auth.uid() = user_id);

create policy "Owner insert" on supplement_schedule_items
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on supplement_schedule_items
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

create policy "Owner delete" on supplement_schedule_items
  for delete using (auth.uid() = user_id);

drop trigger if exists set_supplement_schedule_items_updated_at on supplement_schedule_items;
create trigger set_supplement_schedule_items_updated_at
  before update on supplement_schedule_items
  for each row execute procedure set_updated_at();

create index if not exists idx_supplement_schedule_items_user_id
  on supplement_schedule_items (user_id);

create index if not exists idx_supplement_schedule_items_user_timing
  on supplement_schedule_items (user_id, timing_block);

-- ── supplement_schedule_completions ──────────────────────────────────────────

create table if not exists supplement_schedule_completions (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  item_id         uuid        not null references supplement_schedule_items(id) on delete cascade,
  completion_date date        not null,
  completed       boolean     not null default false,
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (user_id, item_id, completion_date)
);

alter table supplement_schedule_completions enable row level security;

drop policy if exists "Owner select" on supplement_schedule_completions;
drop policy if exists "Owner insert" on supplement_schedule_completions;
drop policy if exists "Owner update" on supplement_schedule_completions;
drop policy if exists "Owner delete" on supplement_schedule_completions;

create policy "Owner select" on supplement_schedule_completions
  for select using (auth.uid() = user_id);

create policy "Owner insert" on supplement_schedule_completions
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on supplement_schedule_completions
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

create policy "Owner delete" on supplement_schedule_completions
  for delete using (auth.uid() = user_id);

drop trigger if exists set_supplement_schedule_completions_updated_at on supplement_schedule_completions;
create trigger set_supplement_schedule_completions_updated_at
  before update on supplement_schedule_completions
  for each row execute procedure set_updated_at();

create index if not exists idx_supplement_schedule_completions_user_id
  on supplement_schedule_completions (user_id);

create index if not exists idx_supplement_schedule_completions_item_date
  on supplement_schedule_completions (item_id, completion_date);

create index if not exists idx_supplement_schedule_completions_user_date
  on supplement_schedule_completions (user_id, completion_date);

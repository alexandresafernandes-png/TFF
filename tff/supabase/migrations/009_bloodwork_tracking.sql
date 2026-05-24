-- Phase 2 Step 7: Bloodwork Tracking
-- Two tables: bloodwork_tests (per-draw header) + bloodwork_results (per-marker rows).
-- No new trigger function needed — reuses set_updated_at() from migration 002.

-- ── bloodwork_tests ───────────────────────────────────────────────────────────

create table if not exists bloodwork_tests (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  test_date    date        not null,
  lab_name     text,
  notes        text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table bloodwork_tests enable row level security;

drop policy if exists "Owner select" on bloodwork_tests;
drop policy if exists "Owner insert" on bloodwork_tests;
drop policy if exists "Owner update" on bloodwork_tests;
drop policy if exists "Owner delete" on bloodwork_tests;

create policy "Owner select" on bloodwork_tests
  for select using (auth.uid() = user_id);

create policy "Owner insert" on bloodwork_tests
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on bloodwork_tests
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

create policy "Owner delete" on bloodwork_tests
  for delete using (auth.uid() = user_id);

drop trigger if exists set_bloodwork_tests_updated_at on bloodwork_tests;
create trigger set_bloodwork_tests_updated_at
  before update on bloodwork_tests
  for each row execute procedure set_updated_at();

create index if not exists idx_bloodwork_tests_user_id
  on bloodwork_tests (user_id);

create index if not exists idx_bloodwork_tests_user_date
  on bloodwork_tests (user_id, test_date desc);

-- ── bloodwork_results ─────────────────────────────────────────────────────────

create table if not exists bloodwork_results (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null references auth.users(id) on delete cascade,
  test_id               uuid        not null references bloodwork_tests(id) on delete cascade,
  marker_key            text        not null,
  marker_name           text        not null,
  value                 numeric,
  unit                  text,
  reference_range_text  text,
  flag                  text        not null default 'unknown'
                                    check (flag in ('low','normal','high','manual_review','unknown')),
  notes                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (test_id, marker_key)
);

alter table bloodwork_results enable row level security;

drop policy if exists "Owner select" on bloodwork_results;
drop policy if exists "Owner insert" on bloodwork_results;
drop policy if exists "Owner update" on bloodwork_results;
drop policy if exists "Owner delete" on bloodwork_results;

create policy "Owner select" on bloodwork_results
  for select using (auth.uid() = user_id);

create policy "Owner insert" on bloodwork_results
  for insert with check (auth.uid() = user_id);

create policy "Owner update" on bloodwork_results
  for update using  (auth.uid() = user_id)
            with check (auth.uid() = user_id);

create policy "Owner delete" on bloodwork_results
  for delete using (auth.uid() = user_id);

drop trigger if exists set_bloodwork_results_updated_at on bloodwork_results;
create trigger set_bloodwork_results_updated_at
  before update on bloodwork_results
  for each row execute procedure set_updated_at();

create index if not exists idx_bloodwork_results_user_id
  on bloodwork_results (user_id);

create index if not exists idx_bloodwork_results_test_id
  on bloodwork_results (test_id);

create index if not exists idx_bloodwork_results_user_marker
  on bloodwork_results (user_id, marker_key);

# TFF — Supabase

## Status

**Schema: defined. `/checklist`, `/shopping`, `/routines`, `/protocols`, `/progress`, `/weekly-review`, `/fuel`, `/supplement-schedule`, `/bloodwork-tracking`, the dashboard Command Center, user notes on `/protocols` + `/bloodwork`, and the dashboard personal summary are wired. All other pages: localStorage only.**

- `/checklist` syncs completions and custom items to Supabase when the user is logged in
- `/shopping` syncs retainer checkmarks, upgrade status, and custom items to Supabase when the user is logged in
- `/routines` syncs active/completed today state to Supabase when the user is logged in
- `/protocols` syncs protocol tracking status and notes to Supabase when the user is logged in; protocol content remains static JSON
- `/protocols` (per-protocol) and `/bloodwork` (per-marker) support personal notes via `UserNotesPanel`, synced to `user_notes` when signed in
- `/` (dashboard) shows a personal summary card when signed in: today's checklist count, protocol tracking counts, today's routine counts, shopping checked counts, and last 3 notes; falls back to a "local-first mode" prompt when not signed in
- All other app pages still use `localStorage` exclusively
- Route protection is **active** — all `app/(app)` routes require a signed-in session; unauthenticated requests redirect to `/login`
- Public routes: `/login` and `/auth/callback` — no session required
- Auth boundary is implemented in `app/(app)/layout.tsx` using `supabase.auth.getUser()` server-side; middleware is intentionally not used for auth
- `localStorage` remains an internal fallback for all synced pages when Supabase data is unavailable, but app access now requires login
- Auth UX is polished: login page shows "already signed in" state when revisited, `/settings` Account section shows live session status via `AuthSessionStatus`, dashboard CTA links to `/login`
- Primary login method is **email + password** (`signInWithPassword`). Magic link is available as a secondary fallback via "Send magic link instead". Requires the Supabase user to have a password set.

---

## Phase 1.5 sync status

| Feature | localStorage | Cloud sync | Notes |
|---------|-------------|------------|-------|
| Checklist completions | ✓ primary | ✓ when signed in | Daily scope; remote wins on merge |
| Checklist custom items | ✓ primary | ✓ when signed in | `client_id` bridge for cross-device match |
| Shopping retainer status | ✓ primary | ✓ when signed in | checked / unchecked per item |
| Shopping upgrade status | ✓ primary | ✓ when signed in | planned / bought / unchecked per item |
| Shopping custom items | ✓ primary | ✓ when signed in | `client_id` bridge; mode = retainer \| upgrade |
| Routine completions | ✓ primary | ✓ when signed in | Daily scope; active / done / inactive |
| Protocol tracking | ✓ primary | ✓ when signed in | Not date-scoped; one row per protocol per user |
| Personal notes | ✓ primary | ✓ when signed in | Soft-delete via `is_archived`; area + entity_id scoped |
| Dashboard Command Center | — | Read-only fetch | 8 parallel queries; partial failure safe; each card degrades independently |
| Dashboard summary | — | Read-only fetch | `Promise.allSettled`; partial failure safe |
| Bloodwork tests + results | — | ✓ cloud-only | No localStorage fallback; unauthenticated → clean empty state |
| Auth | — | Magic link | No route enforcement |
| Route protection | — | Active | `app/(app)/layout.tsx` redirects to `/login`; middleware not used |
| localStorage fallback | ✓ always | — | Active on all synced pages regardless of auth state |

---

## Running the migrations

No Supabase CLI is required. Run migrations manually:

1. Open your Supabase project → **SQL Editor**
2. Run `001_initial_tff_schema.sql` first
3. Run `002_tff_user_data_schema.sql` second
4. Run `003_checklist_client_id.sql` third
5. Run `004_shopping_client_id.sql` fourth
6. Run `005_user_notes_archive.sql` fifth
7. Run `006_daily_progress_snapshots.sql` sixth
8. Run `007_macro_fuel_system.sql` seventh
9. Run `008_supplement_schedule.sql` eighth
10. Run `009_bloodwork_tracking.sql` ninth

Each file is idempotent: re-running it is safe (`create table if not exists`, `create or replace function`, `drop trigger if exists` before recreating, etc.).

---

## Migration index

### `001_initial_tff_schema.sql` — Phase 1 foundation

| Table | Purpose |
|-------|---------|
| `profiles` | Per-user profile (id = auth.uid(), display_name, email, avatar_url) |
| `user_settings` | Flexible key/value preferences per user |
| `checklist_completions` | Daily checklist completion state per item |
| `shopping_status` | Bought/planned/skipped state for shopping items |
| `active_protocols` | Which protocols a user has started/ended |
| `personal_notes` | Freeform notes attached to any entity |
| `user_day_state` | Flexible per-day JSON state blob |

Also includes: `handle_updated_at()` trigger function, storage bucket instructions.

---

### `003_checklist_client_id.sql` — Phase 1.5 Step 4

Adds `client_id text` to `checklist_custom_items`. This maps local `c_<timestamp>_<random>` IDs to Supabase UUIDs so the sync layer can match remote rows to local items without changing the local ID format. Sparse index on `client_id where client_id is not null`.

---

### `004_shopping_client_id.sql` — Phase 1.5 Step 5

Adds `client_id text` to `shopping_custom_items`. This maps local `custom_retainer_<timestamp>_<random>` and `custom_upgrade_<timestamp>_<random>` IDs to Supabase UUIDs, using the same client_id bridge pattern as migration 003. Sparse index on `client_id where client_id is not null`.

---

### `009_bloodwork_tracking.sql` — Phase 2 Step 7

Creates `bloodwork_tests` and `bloodwork_results`. Both use owner-only RLS (select / insert / update / delete policies) and `set_updated_at()` triggers from migration 002.

**No diagnosis, no range inference, no medical advice is generated.** The system stores only what the user manually enters. Reference ranges are stored as user-provided text (`reference_range_text`), never auto-populated. The flag field (`low` / `normal` / `high` / `manual_review` / `unknown`) is set by the user, never inferred. Trend charts are reserved for Phase 2.5.

**`bloodwork_tests`** — One row per lab draw. Acts as a header for the set of results from that draw.

| Column | Type | Notes |
|--------|------|-------|
| `test_date` | date | Required — date of the blood draw (YYYY-MM-DD) |
| `lab_name` | text | Optional — e.g. "LabCorp", "Quest" |
| `notes` | text | Optional — freeform notes for the draw |

**`bloodwork_results`** — One row per marker per draw. `unique(test_id, marker_key)` ensures one result per marker per test.

| Column | Type | Notes |
|--------|------|-------|
| `test_id` | uuid | FK → bloodwork_tests(id) on delete cascade |
| `marker_key` | text | snake_case key derived from marker name (max 60 chars) |
| `marker_name` | text | Display name as entered by user or from TFF library |
| `value` | numeric | The lab result value (nullable) |
| `unit` | text | Optional — e.g. "ng/dL", "mIU/L" |
| `reference_range_text` | text | Optional — lab's range text as printed, user-entered only |
| `flag` | text | One of: `low`, `normal`, `high`, `manual_review`, `unknown` |
| `notes` | text | Optional — per-marker notes |

The `marker_key` is computed by `normalizeMarkerKey()` in `lib/supabase/bloodwork-tracking-sync.ts`: lowercased, non-alphanumeric runs collapsed to `_`, trimmed, max 60 chars. The TFF library picker (`data/blood_markers.json`) pre-fills name and unit only — reference ranges from the library are never imported.

---

### `008_supplement_schedule.sql` — Phase 2 Step 6

Creates `supplement_schedule_items` and `supplement_schedule_completions`. Both use owner-only RLS (select / insert / update / delete policies) and `set_updated_at()` triggers from migration 002.

**`supplement_schedule_items`** — User-defined supplement entries. Each item has a name, optional dose, timing block, and optional instructions. Items can be deactivated (soft-delete via `is_active = false`).

| Column | Type | Notes |
|--------|------|-------|
| `name` | text | Required — user-entered or from TFF library |
| `dose_text` | text | Optional — user-entered or from TFF source data |
| `timing_block` | text | One of: `morning`, `midday`, `pre_workout`, `evening`, `night`, `custom` |
| `instructions` | text | Optional — user-entered only, no invented content |
| `is_active` | boolean | Soft-deactivate; default true |
| `sort_order` | integer | Display order within timing block |
| `source` | text | `manual` or `tff_library` |

**`supplement_schedule_completions`** — One row per user per item per calendar day. `unique(user_id, item_id, completion_date)` makes upsert safe on every toggle.

| Column | Type | Notes |
|--------|------|-------|
| `item_id` | uuid | FK → supplement_schedule_items(id) on delete cascade |
| `completion_date` | date | Local date (YYYY-MM-DD) |
| `completed` | boolean | Whether the item was taken |
| `completed_at` | timestamptz | Timestamp when marked complete (null if unchecked) |

---

### `007_macro_fuel_system.sql` — Phase 2 Step 5

Creates `macro_profiles` and `daily_fuel_logs`. Both use owner-only RLS and `set_updated_at()` triggers from migration 002.

**`macro_profiles`** — One row per user. Stores training-day and rest-day macro targets. All macro fields are `integer nullable` — set only the fields you know.

| Column | Type | Notes |
|--------|------|-------|
| `training_calories` | integer | Training day calorie target (nullable) |
| `training_protein_g` | integer | Training day protein target in grams (nullable) |
| `training_carbs_g` | integer | Training day carbs target in grams (nullable) |
| `training_fat_g` | integer | Training day fat target in grams (nullable) |
| `rest_calories` | integer | Rest day calorie target (nullable) |
| `rest_protein_g` | integer | Rest day protein target (nullable) |
| `rest_carbs_g` | integer | Rest day carbs target (nullable) |
| `rest_fat_g` | integer | Rest day fat target (nullable) |

**`daily_fuel_logs`** — One row per user per calendar day (`unique(user_id, log_date)`). Stores meal list as JSONB array and computed totals.

| Column | Type | Notes |
|--------|------|-------|
| `log_date` | date | Local date (YYYY-MM-DD) |
| `day_type` | text | `'training'` or `'rest'`; check constraint |
| `meals` | jsonb | Array of `FuelMeal` objects |
| `totals` | jsonb | Computed totals object (`{calories, protein_g, carbs_g, fat_g}`) |
| `compliance_score` | numeric | 0–100, computed from macro compliance formula |
| `notes` | text | Optional day notes |

---

### `006_daily_progress_snapshots.sql` — Phase 2 Step 2

Creates `daily_progress_snapshots`. One row per user per calendar day. Captures score, checklist/routine/protocol counts, and a `metrics jsonb` field for future expansion. `unique(user_id, progress_date)` makes upsert safe to call on every `/progress` load.

| Column | Type | Notes |
|--------|------|-------|
| `progress_date` | date | Local date (YYYY-MM-DD) |
| `score` | numeric | 0–100, computed by `calcScore()` in progress-sync.ts |
| `checklist_completed` | integer | Items completed today |
| `checklist_total` | integer | Always 21 (denominator) |
| `routines_completed` | integer | Routines with status=done |
| `routines_active` | integer | Routines with status=active |
| `protocols_active` | integer | Protocols with status=active |
| `protocols_completed` | integer | Protocols with status=completed |
| `notes_count` | integer | Notes updated today |
| `metrics` | jsonb | Reserved for future fields |

---

### `005_user_notes_archive.sql` — Phase 1.5 Step 8

Adds `is_archived boolean not null default false` to `user_notes`. This enables soft-delete: notes are hidden from fetch queries (`eq("is_archived", false)`) rather than permanently deleted. Partial index on `(user_id, area) where is_archived = false` for fast per-area lookups. Required before using `archiveUserNote()` in `lib/supabase/notes-sync.ts`.

---

### `002_tff_user_data_schema.sql` — Phase 1.5 user data schema

| Table | Purpose | Notes |
|-------|---------|-------|
| `checklist_custom_items` | User-created checklist items (not in JSON data) | New in 002 |
| `shopping_custom_items` | User-created shopping items per basket mode | New in 002 |
| `shopping_item_status` | Bought/checked state with retainer/upgrade mode split | Supersedes `shopping_status` from 001 |
| `routine_completions` | Per-day routine active/done state | New in 002 |
| `protocol_tracking` | Active protocols with status text + notes | Supersedes `active_protocols` from 001 |
| `user_notes` | Notes with title, area, entity link | Supersedes `personal_notes` from 001 |

Also included in 002:
- `set_updated_at()` trigger function (canonical alias for `handle_updated_at()`)
- `handle_new_user()` function + `on_auth_user_created` trigger — auto-creates a `profiles` row on sign-up
- `ALTER TABLE checklist_completions` — adds `item_source`, `completed`, `updated_at` columns
- Performance indexes on all user-owned tables

---

## Table reference

### Tables covered by 001 (use these in Phase 2 wiring)

**`profiles`** — User profile. `id` = auth user UUID (not a foreign key column, it IS the PK).
```
id            uuid  PK  references auth.users(id)
email         text
display_name  text
avatar_url    text
created_at    timestamptz
updated_at    timestamptz
```
> Covers the `user_profiles` spec. RLS: `id = auth.uid()`.

**`user_settings`** — Per-user key/value preferences.
```
id          uuid  PK
user_id     uuid  FK → auth.users
key         text
value       jsonb
updated_at  timestamptz
UNIQUE (user_id, key)
```
> Covers the `user_app_settings` spec. Column names differ from spec (`key`/`value` vs `setting_key`/`setting_value`) — use the 001 names when wiring Phase 2.

---

### Tables added in 002

**`checklist_custom_items`** — User-added checklist items.
```
id           uuid  PK
user_id      uuid  FK → auth.users
title        text  NOT NULL
description  text
category     text
priority     text
sort_order   integer  default 0
is_archived  boolean  default false
created_at   timestamptz
updated_at   timestamptz
```

**`shopping_custom_items`** — User-added shopping items per basket.
```
id          uuid  PK
user_id     uuid  FK → auth.users
mode        text  CHECK ('retainer' | 'upgrade')  NOT NULL
name        text  NOT NULL
category    text
priority    text
frequency   text
cost_tier   text
purpose     text
note        text
is_archived boolean  default false
created_at  timestamptz
updated_at  timestamptz
```

**`shopping_item_status`** — Per-item status with basket mode.
```
id         uuid  PK
user_id    uuid  FK → auth.users
mode       text  CHECK ('retainer' | 'upgrade')  NOT NULL
item_id    text  NOT NULL
status     text  default 'unchecked'
updated_at timestamptz
UNIQUE (user_id, mode, item_id)
```

**`routine_completions`** — Per-day routine state.
```
id               uuid  PK
user_id          uuid  FK → auth.users
routine_id       text  NOT NULL  (references /data/routines.json id)
completion_date  date  NOT NULL  default current_date
status           text  NOT NULL  default 'inactive'  ('inactive' | 'active' | 'done')
created_at       timestamptz
updated_at       timestamptz
UNIQUE (user_id, routine_id, completion_date)
```

**`protocol_tracking`** — Protocol status and notes.
```
id          uuid  PK
user_id     uuid  FK → auth.users
protocol_id text  NOT NULL  (references /data/protocols.json id)
status      text  NOT NULL  default 'inactive'
started_at  timestamptz
ended_at    timestamptz
notes       text
created_at  timestamptz
updated_at  timestamptz
UNIQUE (user_id, protocol_id)
```

**`user_notes`** — Notes attached to any app area or entity.
```
id         uuid  PK
user_id    uuid  FK → auth.users
area       text  NOT NULL  ('food' | 'supplement' | 'protocol' | 'bloodwork' | 'general' | ...)
entity_id  text  (references id in relevant /data/*.json file)
title      text
body       text  NOT NULL
created_at timestamptz
updated_at timestamptz
```

---

## RLS summary

All user tables use owner-only RLS via `for all` policies:

```sql
using  (auth.uid() = user_id)
with check (auth.uid() = user_id)
```

For `profiles`: `auth.uid() = id` (id IS the user UUID).

No row is readable, writable, or deletable by anyone other than the owning user. Service-role key bypasses RLS — only use it server-side for admin operations.

---

## Superseded tables

These tables from 001 are left intact but should not be targeted by Phase 2 wiring:

| 001 table | Superseded by | Reason |
|-----------|---------------|--------|
| `shopping_status` | `shopping_item_status` | Missing `mode` column for retainer/upgrade split |
| `active_protocols` | `protocol_tracking` | Uses `active boolean` instead of `status text`; no notes field |
| `personal_notes` | `user_notes` | Column names (`entity_type`, `content`) differ from Phase 2 spec |

---

## Phase 2 — Active

### Phase 2 Step 1 — Daily Progress (complete)
- `/progress` reads `checklist_completions`, `routine_completions`, `protocol_tracking`, and `user_notes` (today's notes) via `lib/supabase/progress-sync.ts`.
- Score formula: `min(completedToday/21, 1) × 70 + min(doneToday × 5, 20) + (active > 0 ? 10 : 0)`. Denominator 21 = actual checklist item count across 7 groups.

### Phase 2 Step 8 — Dashboard 2.0 (complete)

- `app/(app)/page.tsx` — reorganized as a server component; title updated to "TFF Command Center"; imports `DashboardCommandCenter`; Quick Actions reorganized with Phase 2 tracking tools first (Daily Progress, Weekly Review, Macro & Fuel, Supplement Schedule, Protocols, Bloodwork Tracking) followed by reference tools.
- `components/tff/DashboardCommandCenter.tsx` — new client component; single `useEffect` fires 8 parallel fetches via `Promise.allSettled`; each card degrades gracefully on partial failure.
- **No new tables.** Reads from existing Phase 2 systems only:
  - `fetchProgressData()` + `calcScore()` → Today's Execution card
  - `fetchRecentProgressSnapshots(14)` + `calculateStreaks()` + `calculateWeeklyStats()` → Streak & Consistency card
  - `fetchMacroProfile()` + `fetchDailyFuelLog()` + `calculateMacroCompliance()` → Macro & Fuel card
  - `fetchSupplementScheduleItems()` + `fetchSupplementCompletionsForDate()` + `calculateSupplementAdherence()` → Supplement Schedule card
  - `fetchProtocolTracking()` → Active Protocols card (names resolved from `data/protocols.json`)
  - `fetchBloodworkTests()` → Bloodwork card
- **Setup Status card**: factual-only gap detection (missing macro targets, no active supplements, no active protocols, no bloodwork tests, no progress snapshots). No coaching language.
- **Bloodwork card**: objective counts only — no diagnosis, no range interpretation.
- **Unauthenticated state**: clean "Sign in to unlock tracking" card; no crash.
- **Loading state**: skeleton cards shown while 8 fetches complete.
- **Full UI upgrade** (typography, color system, layout overhaul) is reserved for Phase 2.5.1.

### Phase 2 Step 7 — Bloodwork Tracking (complete)

- `/bloodwork-tracking` page — TESTS / DETAIL / HISTORY views; add test with inline marker entry at creation time; batch creation via `createBloodworkTestWithResults()`; auto-navigate to detail after creation; per-marker remove; history table by date.
- `lib/supabase/bloodwork-tracking-sync.ts` — types + all CRUD helpers including `createBloodworkTestWithResults` (sequential batch wrapper).
- `supabase/migrations/009_bloodwork_tracking.sql` — `bloodwork_tests` + `bloodwork_results`; owner-only RLS; unique(test_id, marker_key).
- No auto-classification, no invented ranges, no medical advice. All flags manually selected.
- No localStorage fallback (sensitive data) — clean unauthenticated state shown.
- Navigation: Sidebar (key B), MobileMoreSheet, Topbar (INDEX · 15 / BW TRACKING, inserted BEFORE /bloodwork to avoid startsWith collision), Dashboard Quick Actions. `/bloodwork` phase2 tab updated with "Active" badge + link.

### Phase 2 Step 6 — Supplement Schedule (complete)

- `/supplement-schedule` page — today summary (adherence %, completed, remaining), items grouped by timing block (morning / midday / pre-workout / evening / night / custom), add-item form (manual or pre-filled from TFF library), inactive items panel, future integration placeholder.
- `lib/supabase/supplement-schedule-sync.ts` — types (`TimingBlock`, `SupplementScheduleItem`, `SupplementScheduleCompletion`) and helpers: `getTodayLocalDate`, `groupItemsByTimingBlock`, `calculateSupplementAdherence`, `fetchSupplementScheduleItems`, `createSupplementScheduleItem`, `updateSupplementScheduleItem`, `setSupplementScheduleItemActive`, `fetchSupplementCompletionsForDate`, `upsertSupplementCompletion`.
- **Local-first**: items and completions cached in localStorage (`tff_sup_items`, `tff_sup_comp_YYYY-MM-DD`). Page renders from cache immediately; Supabase fetch overwrites on success.
- **Unauthenticated mode**: items created with a `local_` prefixed ID; all data persists in browser storage only. Clear "LOCAL MODE" label shown.
- **TFF Library picker**: "Add from Library" pre-fills name + dose from `data/supplements.json`. No dosage advice is invented — only existing TFF source data is used. User can edit before saving.
- Navigation: Sidebar (key S, after Supplements), MobileMoreSheet, Topbar (`INDEX · 14 / SUPP SCHED`), Dashboard Quick Actions.
- `/supplements` phase2 tab: "Supplement Schedule now active" card with link replaces old "Phase 2" banner.
- **Not yet wired to Daily Progress or Weekly Review.** Future phase placeholder included on page.

### Phase 2 Step 5 — Macro & Fuel System (complete)

- `/fuel` page — macro targets form (training + rest day), daily meal log, totals vs. targets, compliance score, day notes, and How to Use section.
- `lib/supabase/macro-fuel-sync.ts` — types (`DayType`, `MacroTarget`, `MacroProfile`, `FuelMeal`, `FuelTotals`, `DailyFuelLog`) and helpers: `getTodayLocalDate`, `getMacroTargetForDay`, `calculateFuelTotals`, `calculateMacroCompliance`, `fetchMacroProfile`, `upsertMacroProfile`, `fetchDailyFuelLog`, `upsertDailyFuelLog`.
- Compliance formula: Calories 30pts + Protein 30pts + Carbs 20pts + Fat 20pts; `weight × max(0, 1 – (|actual – target| / target) × 2)`; returns `null` if any target is missing.
- Navigation: Sidebar (key F, after Nutrition & Cooking), MobileMoreSheet, Topbar (`INDEX · 13 / FUEL`), Dashboard Quick Actions.
- `/nutrition` phase2 tab: "Macro & Fuel now active" card replaces old "Phase 2" banner; MACRO TRACKING hero stat updated to "Active".
- No auto-calculation of targets — manual entry with "manual review needed" placeholder.
- All macro data is manual-entry only; no macro data exists in `/data/*.json` files.

### Phase 2 Step 4 — Active Protocol System v2 (complete)
- `/protocols` enhanced with an Active Protocol Summary section at the top of the page.
- No new tables — uses existing `protocol_tracking` table and `lib/supabase/protocols-sync.ts`.
- Summary shows: Active / Paused / Completed / Not Started counts plus a "Currently Active" list.
- Currently Active list: shows each active protocol's name, category, days since start, and quick Pause / Complete / View actions.
- Each protocol detail now shows a Tracking Overview block: status badge, days-since-start, started/ended dates, and a "Duration target: manual review needed" note (no duration field in protocol data).
- `handleStatusChange` timestamp rules: Active → sets `started_at` if unset, clears `ended_at`; Completed → sets `ended_at`; Paused → preserves both; Not Active → preserves notes, no data loss.
- Adherence tracking placeholder added with TODO comment in protocol detail (Phase 2.x, not implemented).
- localStorage fallback and local-first mode unchanged. Daily Progress score formula unchanged.

### Phase 2 Step 3 — Weekly Review (complete)
- `/weekly-review` reads from `daily_progress_snapshots` — no new tables required.
- Sections: Weekly Score Summary, Consistency Breakdown, Last 7 Days, Weekly Insight.
- Score threshold ≥ 70 = successful day (same as streak engine).
- Weekly Score Summary: average score, successful days, days tracked, best day, weakest day.
- Consistency Breakdown: checklist %, routine completion rate, protocol active-days, notes total.
- Last 7 Days: per-day row showing score, success/fail, and breakdown from snapshot columns.
- Weekly Insight: 2–4 objective factual summaries from the data — no recommendations or advice.
- Navigation: Sidebar (key W), MobileMoreSheet, Topbar crumb, and dashboard Quick Actions.

### Phase 2 Step 2 — Streak Engine / Daily History (complete)
- `/progress` now upserts a `daily_progress_snapshots` row on every page load (fire-and-forget background write).
- The unique constraint `(user_id, progress_date)` prevents duplicates — upsert is safe to call on every visit.
- Streak logic: **current streak** = consecutive days ending today if today ≥ 70, otherwise consecutive days ending yesterday (preserves streak while today is in progress); **best streak** = longest such run in fetched history; **missed day** = no snapshot OR score < 70.
- Success threshold: **score ≥ 70** (visible in UI as "STREAK DAY = DAILY EXECUTION SCORE ≥ 70").
- `/progress` shows: current streak · best streak · 7-day average · days tracked · last 7 days mini history.
- Phase 2.5: trend charts and weekly analytics will build on these snapshots.

## Completed steps

1. ~~Add route protection in `middleware.ts`~~ — Route protection implemented in `app/(app)/layout.tsx` instead; middleware intentionally not used for auth
2. ~~Wire `/checklist` to sync `checklist_completions` and `checklist_custom_items`~~ ✓ Done (Phase 1.5 Step 4)
3. ~~Wire `/shopping` to sync `shopping_item_status` and `shopping_custom_items`~~ ✓ Done (Phase 1.5 Step 5)
4. ~~Wire `/routines` to sync `routine_completions`~~ ✓ Done (Phase 1.5 Step 6)
5. ~~Wire `/protocols` to sync `protocol_tracking`~~ ✓ Done (Phase 1.5 Step 7)
6. ~~Wire notes to `user_notes` across relevant pages~~ ✓ Done (Phase 1.5 Step 8) — `UserNotesPanel` on `/protocols` (per-protocol) and `/bloodwork` (per-marker)
7. ~~Dashboard personal data layer~~ ✓ Done (Phase 1.5 Step 9) — `DashboardPersonalCards` reads checklist, protocols, routines, shopping, and notes summaries
8. ~~Daily Progress page~~ ✓ Done (Phase 2 Step 1) — `/progress` with Daily Execution Score, breakdown bars, and notes today
9. ~~Streak Engine / Daily History~~ ✓ Done (Phase 2 Step 2) — `daily_progress_snapshots` table, current/best streak, 7-day history
10. ~~Weekly Review~~ ✓ Done (Phase 2 Step 3) — `/weekly-review` with score summary, consistency breakdown, last 7 days, objective insights
11. ~~Active Protocol System v2~~ ✓ Done (Phase 2 Step 4) — `/protocols` protocol tracker summary, currently active list, enhanced tracking detail, adherence placeholder
12. ~~Macro & Fuel System~~ ✓ Done (Phase 2 Step 5) — `/fuel` page, `macro_profiles` + `daily_fuel_logs` tables, compliance score, navigation wiring, nutrition page link
13. ~~Supplement Schedule~~ ✓ Done (Phase 2 Step 6) — `/supplement-schedule` page, `supplement_schedule_items` + `supplement_schedule_completions` tables, TFF library picker, local-first with Supabase sync, navigation wiring, supplements page link
14. ~~Bloodwork Tracking~~ ✓ Done (Phase 2 Step 7) — `/bloodwork-tracking` page with TESTS / DETAIL / HISTORY views; inline marker entry at creation; `bloodwork_tests` + `bloodwork_results` tables; no auto-classification; full navigation wiring
15. ~~Dashboard 2.0~~ ✓ Done (Phase 2 Step 8) — `DashboardCommandCenter` client component; 8 parallel reads from existing Phase 2 systems; Today / Streak / Macro / Supplements / Protocols / Bloodwork / Setup Status cards; no new tables

## Next steps

- Phase 2.5: Trend charts (build on `daily_progress_snapshots`)
- Phase 2.5.1: Full visual upgrade across all pages
- Wire supplement adherence into Daily Progress score (future phase placeholder is live on `/supplement-schedule`)
- Wire profile display in `/settings` from `profiles`

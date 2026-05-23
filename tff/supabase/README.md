# TFF — Supabase

## Status

**Schema: defined. `/checklist`, `/shopping`, `/routines`, `/protocols`, user notes on `/protocols` + `/bloodwork`, and the dashboard personal summary are wired. All other pages: localStorage only.**

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
| Dashboard summary | — | Read-only fetch | `Promise.allSettled`; partial failure safe |
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

## Next steps (Phase 2)

1. Add route protection in `middleware.ts` using `lib/supabase/middleware.ts`
2. Add session context provider if needed for client components
3. ~~Wire `/checklist` to sync `checklist_completions` and `checklist_custom_items`~~ ✓ Done (Phase 1.5 Step 4)
4. ~~Wire `/shopping` to sync `shopping_item_status` and `shopping_custom_items`~~ ✓ Done (Phase 1.5 Step 5)
5. ~~Wire `/routines` to sync `routine_completions`~~ ✓ Done (Phase 1.5 Step 6)
6. ~~Wire `/protocols` to sync `protocol_tracking`~~ ✓ Done (Phase 1.5 Step 7)
7. ~~Wire notes to `user_notes` across relevant pages~~ ✓ Done (Phase 1.5 Step 8) — `UserNotesPanel` on `/protocols` (per-protocol) and `/bloodwork` (per-marker)
8. ~~Dashboard personal data layer~~ ✓ Done (Phase 1.5 Step 9) — `DashboardPersonalCards` reads checklist, protocols, routines, shopping, and notes summaries; falls back to local-first prompt when not signed in
9. Wire profile display in `/settings` from `profiles`
9. Migrate relevant `localStorage` keys to Supabase (keep localStorage as offline fallback)

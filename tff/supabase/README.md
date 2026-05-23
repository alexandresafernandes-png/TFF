# TFF — Supabase

## Status

**Schema: defined. `/checklist` is wired. All other pages: localStorage only.**

- `/checklist` syncs completions and custom items to Supabase when the user is logged in
- All other app pages (`/shopping`, `/routines`, `/protocols`, etc.) still use `localStorage` exclusively
- Route protection is not active — all pages open without a session
- `localStorage` remains the fallback for all synced pages when Supabase is unavailable or the user is not signed in

---

## Running the migrations

No Supabase CLI is required. Run migrations manually:

1. Open your Supabase project → **SQL Editor**
2. Run `001_initial_tff_schema.sql` first
3. Run `002_tff_user_data_schema.sql` second
4. Run `003_checklist_client_id.sql` third

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
3. Wire `/checklist` to sync `checklist_completions` and `checklist_custom_items`
4. Wire `/shopping` to sync `shopping_item_status` and `shopping_custom_items`
5. Wire `/routines` to sync `routine_completions`
6. Wire `/protocols` to sync `protocol_tracking`
7. Wire notes to `user_notes` across relevant pages
8. Wire profile display in `/settings` from `profiles`
9. Migrate relevant `localStorage` keys to Supabase (keep localStorage as offline fallback)

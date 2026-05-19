# TFF — App Screens Specification
**Version:** v1.0 — Design Lock
**Rule:** Do not invent content. Do not redesign. All data from /data/*.json only.

---

## Phase 1 Screens

---

### Screen 1 — Dashboard

**Route:** `/` or `/dashboard`
**Crumb:** `INDEX · 01 / DASHBOARD`

**Layout (desktop):**
- Full-width content area right of sidebar
- 2-column grid: left=main (2/3), right=sidebar panel (1/3)
- Top: greeting strip with operator status + date

**Components:**
- `DashboardGreeting` — mono micro text, date, operator tag
- `ChecklistProgressCard` — today's checklist completion bar + count (from Supabase daily completions)
- `ActiveProtocolsCard` — list of user's active protocols (from Supabase `active_protocols` table)
- `QuickChecklist` — top 3 critical checklist items for today (from `checklist_items.json`, priority=critical)
- `TodayRoutineCard` — relevant routine for today (training_day vs rest_day, from `routines.json`)
- `BloodworkAlertCard` — next scheduled bloodwork reminder (from `checklist_items.json`, category=bloodwork)
- `QuickNav` — shortcut tiles to: Search, Supplements, Foods, Protocols

**Right panel:**
- `SupplementTimingStrip` — today's supplements by time_of_day (from `supplements.json` + `checklist_items.json`)
- `ShoppingAlertBadge` — count of critical items not yet marked bought (from Supabase shopping status)

**Data sources:**
- `checklist_items.json` — today's items, priority filter
- `routines.json` — daily/training_day/rest_day
- `supplements.json` — supplement timing strip
- Supabase: `checklist_completions`, `active_protocols`, `shopping_status`, `user_settings`

**Interactions:**
- Tap checklist item → mark complete (updates Supabase)
- Tap protocol → navigate to Protocol Detail
- Tap QuickNav tile → navigate to screen

**Mobile:**
- Single column, stacked cards
- Progress bar + greeting at top
- Supplement strip collapses to horizontal scroll
- QuickNav as 2×2 grid

**Empty state:** New user — show "Set up your first protocol" CTA
**Loading:** Skeleton cards
**Error:** "Could not load dashboard — check connection"

---

### Screen 2 — Knowledge Search

**Route:** `/search`
**Crumb:** `INDEX · 02 / SEARCH`

**Layout (desktop):**
- Full-width search bar pinned at top of content area
- Results area below: grouped by type (Foods, Supplements, Protocols, Claims, Blood Markers)
- Filter bar: type chips + tag filter

**Components:**
- `SearchBar` — large, full-width, autofocus on load. Placeholder: "Search knowledge base…"
- `FilterChips` — Foods | Supplements | Protocols | Claims | Markers | All
- `SearchResultGroup` — section header + result rows per type
- `SearchResultRow` — name, type badge, status/tier badge, one-line description
- `SearchDetailDrawer` — slides in on result tap (desktop right, mobile bottom sheet)

**Search behavior (client-side, no AI):**
- Search across: `foods.json` (name, purpose, why), `supplements.json` (name, purpose, mechanism), `protocols.json` (name, goal), `claims.json` (claim text, mechanism), `blood_markers.json` (name, why_it_matters)
- Match on: name, description fields
- Sort: exact match first, then partial

**SearchDetailDrawer content:**
- Full record display: all fields from the matched JSON
- Related items cross-links (linked_protocols, related_markers)
- Source refs displayed as: shorthand + page
- Status badge prominent at top

**Data sources:**
- All: `foods.json`, `supplements.json`, `protocols.json`, `claims.json`, `blood_markers.json`

**Mobile:**
- Search bar sticky at top
- Results as full-width rows
- Drawer becomes full bottom sheet

**Empty state:** "Type to search your knowledge base" — no results message: "Not found in KB."
**Loading:** Instant (client-side search)
**Error:** N/A (static data)

---

### Screen 3 — Daily Checklist

**Route:** `/checklist`
**Crumb:** `INDEX · 03 / CHECKLIST`

**Layout (desktop):**
- Left: checklist grouped by `time_of_day` category (morning → pre-workout → intra → post → evening → pre-bed → anytime)
- Right panel: completion summary + streak (from Supabase)

**Components:**
- `ChecklistSection` — section header (time_of_day label) + items
- `ChecklistItem` — tick + title + category badge + linked protocol chip
- `CompletionBar` — overall today % complete
- `StreakCounter` — consecutive days with ≥ 80% completion (from Supabase)
- `FrequencyFilter` — tabs: Today | Training Day | Rest Day | Weekly | All

**Checklist item display:**
- `title` from `checklist_items.json`
- `category` badge
- Linked protocol chip (if `linked_protocols` non-empty) — tappable → Protocol Detail
- `priority` marker: critical = accent dot, core = neutral, optional = dimmed

**Advanced mode toggle (top-right):**
- OFF by default — protocols 16–24 NOT visible
- ON — shows advanced DHT protocols section (Phase 3 only, locked behind toggle)
- Toggle state stored in Supabase `user_settings.advanced_mode`

**Completion persistence:**
- Each tick writes to Supabase `checklist_completions` (item_id, date, completed)
- Loads today's completions on mount

**Data sources:**
- `checklist_items.json` — all 44 items
- Supabase: `checklist_completions`, `user_settings`

**Mobile:**
- Single column
- Sticky section headers
- Completion bar sticky at top

**Empty state:** No items for selected filter — "No items for this day type"
**Loading:** Skeleton rows
**Error:** "Could not sync — completions saved locally until reconnected"

---

### Screen 4 — Protocol Library

**Route:** `/protocols`
**Crumb:** `INDEX · 04 / PROTOCOLS`

**Layout (desktop):**
- Left: protocol list with filters
- Right: Protocol Detail panel (inline on desktop, drawer on mobile)

**Components:**
- `ProtocolFilter` — tabs by category: All | Sleep | Testosterone | DHT | Hair | Nutrition | Gut | Blood Work | Stress | Training
- `ProtocolCard` — protocol number chip + name + goal + priority badge + checklist_ready badge
- `ProtocolDetailPanel` — full protocol detail

**ProtocolCard fields:**
- Protocol number: mono badge (e.g. `P-01`)
- Name, goal (one line)
- Priority badge: critical/core/advanced/optional
- `checklist_ready: true` → show "CHECKLIST" badge
- `advanced: true` → HIDDEN unless Advanced Mode ON

**ProtocolDetailPanel:**
- Header: protocol name + number + category + priority
- Goal field
- Steps: numbered list from `steps[]`
- Timing
- Items needed: chips linking to supplements/foods
- Cautions: warning-styled list
- Source refs
- "Add to Active Protocols" button → writes to Supabase `active_protocols`
- Related checklist items (cross-ref from `checklist_items.json` `linked_protocols`)

**Data sources:**
- `protocols.json` — protocols 1–15 visible by default
- Supabase: `active_protocols`

**Mobile:**
- Protocol list full screen
- Tap → navigate to `/protocols/[id]` detail page

**Empty state:** No protocols for category filter — "No protocols in this category"
**Loading:** Skeleton cards
**Error:** Standard error state

**What NOT to build yet:**
- Protocols 16–24 detail visible by default (Phase 3)
- Protocol progress tracking (Phase 2)
- Custom protocol creation (Phase 3)

---

### Screen 5 — Protocol Detail

**Route:** `/protocols/[id]`
**Crumb:** `INDEX · 04 / PROTOCOLS / [name]`

This is the full-page version of ProtocolDetailPanel above, used for mobile navigation and direct deep links. Same content as panel, full-page layout.

---

### Screen 6 — Nutrition & Cooking

**Route:** `/nutrition`
**Crumb:** `INDEX · 05 / NUTRITION`

**Layout (desktop):**
- Tabs: Foods | Cooking Guides | Meal Patterns

**Tab: Foods**
- `FoodStatusFilter` — filter chips: All | APPROVED_CORE | APPROVED_CONTEXT | PREP_REQUIRED | AVOID | DEPENDS
- `CategoryFilter` — Protein | Fat | Starch | Dairy | Condiment | Other
- `FoodTable` — rows: name, status badge, category, purpose (one line), timing
- Tap row → `FoodDetailDrawer`

**FoodDetailDrawer:**
- Name + status badge (large, prominent)
- `why` field
- `cooking_method` field
- `timing` field
- `avoid_reason` if AVOID
- Linked cooking guide chip (if matching `cooking_guides.json` entry)
- Source refs

**Tab: Cooking Guides**
- `CookingGuideCard` per guide: food name + prep_method summary
- Expand → full guide: prep_method, cooking_method, avoid, timing, notes

**Tab: Meal Patterns**
- 3 meal pattern guides from `cooking_guides.json` (post-workout, pre-workout, evening protein+fat)
- Card layout: title + components + timing

**Data sources:**
- `foods.json`
- `cooking_guides.json`

**Mobile:**
- Tabs → horizontal scroll tabs at top
- FoodDetailDrawer → bottom sheet

**Empty state:** No foods for filter — "No foods match this filter"
**Loading:** Skeleton rows/cards
**Error:** Standard

**What NOT to build yet:**
- Macro tracking (Phase 2)
- Saved meals (Phase 2)
- Meal logging (Phase 2)

---

### Screen 7 — Food Detail

**Route:** `/foods/[id]`

Full-page Food Detail for mobile. Same content as FoodDetailDrawer. Back button → Nutrition.

---

### Screen 8 — Supplements

**Route:** `/supplements`
**Crumb:** `INDEX · 06 / SUPPLEMENTS`

**Layout (desktop):**
- Tabs: All Supplements | By Tier | By Timing | My Stack

**Tab: All Supplements**
- `TierFilter` — TIER_1 | TIER_2 | TIER_3 | OPTIONAL | CONTEXT_DEPENDENT
- `CategoryFilter` — mineral | vitamin | amino_acid | adaptogen | nootropic | gut | advanced | sleep | joint | other
- `SupplementTable` — rows: name, tier badge, category, dose, timing, purpose
- Tap → `SupplementDetailDrawer`

**SupplementDetailDrawer:**
- Name + tier badge (large)
- Purpose, mechanism
- Dose, timing
- Cautions: warning-styled list items
- Linked protocols chips
- Source refs

**Tab: By Timing**
- Groups: morning | pre-workout | post-workout | with meals | pre-bed | anytime
- Cards per group listing relevant supplements

**Tab: My Stack**
- Supplements linked to user's active protocols (from Supabase `active_protocols` cross-ref `supplements.json`)
- If no active protocols: "Activate a protocol to build your stack"

**Data sources:**
- `supplements.json`
- Supabase: `active_protocols`

**Mobile:**
- Tab bar at top
- SupplementDetailDrawer → bottom sheet

**Empty state:** No supplements for filter
**Loading:** Skeleton rows

**What NOT to build yet:**
- Supplement logging (Phase 2)
- Dose tracking (Phase 2)

---

### Screen 9 — Bloodwork Reference

**Route:** `/bloodwork`
**Crumb:** `INDEX · 07 / BLOODWORK`

**Layout (desktop):**
- Left: panel selector (11 panels)
- Right: markers table for selected panel

**Panel List:**
Thyroid | Sex Hormones | Metabolic | Lipids | Inflammation | Micronutrients | Liver | Kidney | Bone & Mineral | CBC | DUTCH (Phase 2/3 note)

**Markers Table per Panel:**
Columns: Marker | Optimal Range | Standard Range | Units | Why It Matters
- Tap marker → `MarkerDetailDrawer`

**MarkerDetailDrawer:**
- Name + panel badge
- optimal_range, standard_range, units
- high_means, low_means
- why_it_matters
- Related markers chips
- Source refs
- DUTCH markers: show phase badge "PHASE 2/3 — DUTCH Add-on"

**Data sources:**
- `blood_markers.json` — all 77 markers across 11 panels

**Mobile:**
- Panel selector = horizontal scroll chips at top
- Markers as card rows
- Drawer → bottom sheet

**Empty state:** N/A (static data always present)
**Loading:** Skeleton table

**What NOT to build yet:**
- Bloodwork input (Phase 2)
- Marker interpretation engine (Phase 2)
- DUTCH panel deep integration (Phase 3)
- Personal result tracking (Phase 2)

---

### Screen 10 — Shopping List

**Route:** `/shopping`
**Crumb:** `INDEX · 08 / SHOPPING`

**Layout (desktop):**
- Tabs: All | Supplements | Food | Tools | Other
- Filter: priority chips: Critical | Core | Optional
- `ShoppingTable` — rows: name, category badge, priority badge, linked item chip, bought tick
- Bulk actions: Mark All Bought, Reset All

**ShoppingRow:**
- Tick (bought/not_bought) → syncs to Supabase `shopping_status`
- Name
- Priority badge
- Linked supplement/food chip (if non-empty) → opens detail drawer
- No prices displayed (all "Not clearly stated in KB.")
- No external links

**Data sources:**
- `shopping_items.json`
- Supabase: `shopping_status`

**Mobile:**
- Single column rows with large tick targets
- Tabs at top
- Bulk action bar at bottom

**Empty state:** All items bought — "All items marked — restock when needed"
**Loading:** Skeleton rows
**Error:** Offline fallback — "Changes will sync when reconnected"

---

### Screen 11 — Routines

**Route:** `/routines`
**Crumb:** `INDEX · 09 / ROUTINES`

**Layout (desktop):**
- Left: routine selector list
- Right: routine detail

**Routine List:**
All 11 routines from `routines.json`:
- Daily (5 variants)
- Training Day
- Rest Day
- Sleep
- Weekly (2)
- Monthly
- Type badges per item

**Routine Detail:**
- Routine name + type badge
- Sections: each section title (`.label`) + items list
- Items displayed as plain text action list (not ticks — routines are reference, not tracked checklist)
- Source refs

**Data sources:**
- `routines.json`

**Mobile:**
- Routine selector → dropdown or top sheet
- Detail full-width below

**Empty state:** N/A
**Loading:** Skeleton

**What NOT to build yet:**
- Routine completion tracking (Phase 2)
- Custom routines (Phase 2)

---

### Screen 12 — Sources / References

**Route:** `/sources`
**Crumb:** `INDEX · 10 / SOURCES`

**Layout:**
- Grid of 6 source cards (one per ebook)
- Each card: ebook_title, shorthand ID badge, notes field
- Disclaimer text below each card

**SourceCard:**
- Title in Geist 500
- Shorthand badge (mono)
- Notes field
- "All content from this source" — no links, no external URLs

**Data sources:**
- `sources.json`

**Mobile:** Single column cards

**Empty state:** N/A (static)

---

## Design-Supported Future Screens (Phase 2/3)

---

### Screen 13 — Bloodwork Input Flow (Phase 2)

**Route:** `/bloodwork/input`

Guided step flow:
1. Select panel
2. Enter marker values (form inputs, one marker per step)
3. Review — compare entered vs optimal ranges
4. Save to Supabase `bloodwork_entries`

Components: StepProgress, MarkerInput, RangeComparison, SaveButton
Data: `blood_markers.json` for ranges, Supabase for entries

**Do not build in Phase 1.**

---

### Screen 14 — Search Detail Drawer / Mobile Sheet

Already part of Screen 2 (Knowledge Search). Full-screen mobile version of SearchDetailDrawer.

---

### Screen 15 — Onboarding (Phase 1 — simple version)

**Route:** `/onboarding`

Simple 3-step flow for new users:
1. Welcome + app purpose
2. Select initial goals (goal tags from `tags.json`, category=goal)
3. Select first active protocol (from `protocols.json`, priority=critical, checklist_ready=true)

Saves to Supabase `user_settings`.
Skip option always available.

**Build in Phase 1 — keep minimal.**

---

### Screen 16 — Mobile Dashboard

Same as Screen 1 (Dashboard) but with mobile-optimized layout. Not a separate screen — responsive variant of Dashboard.

---

### Screen 17 — Mobile More Sheet

Not a separate screen — triggered by "More" tab in mobile bottom nav. Lists remaining nav items.

---

### Screen 18 — Macro & Fuel System (Phase 2 ONLY)

**Route:** `/macros`

**Do NOT build in Phase 1. Do NOT show in nav.**

Checklist-based macro correction layer:
- User selects day type (training / rest / minimum_effective)
- Saved meals compared to day-type targets
- App shows checklist-style corrections ("Add protein source", "Reduce starch")
- NOT a generic calorie tracker
- NOT macro rings/dials

Phase 2 Supabase tables: `saved_meals`, `meal_logs`, `macro_logs`

---

### Screen 19 — Tracking Hub (Phase 2)

**Route:** `/tracking`

**Do NOT build in Phase 1.**

Central hub for:
- Symptom logs
- Training logs
- Supplement logs
- Experiment logs
- Progress photos

Each category: simple date-stamped log entries stored in Supabase.

---

### Screen 20 — States Gallery (Design Reference)

**Route:** `/system` (internal, not in main nav)

Design system showcase page with all component states:
- All badge variants
- All button variants
- Progress bars
- Loading/empty/error states
- Typography scale
- Color palette

Used for implementation QA only. Not shipped in production build.

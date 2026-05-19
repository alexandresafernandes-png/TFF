# TFF — Data Usage Map
**Version:** v1.0
**Rule:** Every screen must use only the JSON files listed here. No other data sources.

---

## sources.json (6 records)
**Used by:**
- Sources / References screen — primary content (all 6 source cards)
- All screens that display `source_refs` field — rendered as shorthand + page
- SearchDetailDrawer — source refs on any matched record
- ProtocolDetail — source_refs display
- FoodDetailDrawer — source_refs display
- SupplementDetailDrawer — source_refs display
- MarkerDetailDrawer — source_refs display

**Fields used in UI:**
- `id` — internal ref only
- `ebook_title` — displayed as card title
- `shorthand` — displayed as mono badge + used to parse source_refs strings
- `notes` — displayed under card title

---

## tags.json (51 records)
**Used by:**
- Onboarding Step 2 — `category: "goal"` tags offered as goal selection
- Search filtering — tag IDs used for semantic grouping
- Internal only — not displayed as raw tag IDs anywhere

**Fields used in UI:**
- `id` — cross-reference key
- `name` — display label when rendering tag chips (if needed)
- `category` — used to filter tags by type

---

## foods.json (23 records)
**Used by:**
- Nutrition & Cooking → Foods tab — full table
- Food Detail page — full record
- Knowledge Search — matched + displayed in results
- Dashboard → QuickChecklist cross-ref (via checklist_items linked_items)
- Shopping List → linked_food_or_supplement cross-ref
- Cooking Guides → food_id cross-ref

**Fields used in UI:**
- `name` — display name everywhere
- `status` — badge (APPROVED_CORE / APPROVED_CONTEXT / PREP_REQUIRED / AVOID / DEPENDS / NOT_MENTIONED)
- `category` — filter chips (protein / fat / starch / dairy / condiment / other)
- `purpose` — one-line description in table rows
- `why` — detailed mechanism in drawer
- `prep_required` — indicator dot in table
- `cooking_method` — in drawer
- `timing` — in drawer + supplement timing strip context
- `avoid_reason` — displayed in danger style if AVOID
- `related_protocols` — cross-link chips in drawer
- `source_refs` — source ref display in drawer
- `tags` — internal filtering

---

## supplements.json (37 records)
**Used by:**
- Supplements screen — full table (all 3 tabs)
- Supplement Detail — full record
- Knowledge Search — matched + displayed in results
- Dashboard → SupplementTimingStrip (by time_of_day)
- Shopping List → linked_food_or_supplement cross-ref
- Checklist → linked_items cross-ref

**Fields used in UI:**
- `name` — display name everywhere
- `tier` — badge (TIER_1 / TIER_2 / TIER_3 / OPTIONAL / CONTEXT_DEPENDENT)
- `category` — filter chips
- `purpose` — one-line in table rows
- `mechanism` — in detail drawer
- `dose` — in detail drawer + supplement strip
- `timing` — grouping in By Timing tab + dashboard strip
- `cautions` — warning-styled list in detail drawer
- `related_protocols` — cross-link chips
- `source_refs` — source ref display
- `tags` — internal filtering

---

## protocols.json (24 records)
**Used by:**
- Protocol Library — list (1–15 default, 16–24 behind Advanced Mode)
- Protocol Detail — full record
- Knowledge Search — matched + displayed
- Dashboard → ActiveProtocolsCard (cross-ref with Supabase active_protocols)
- Checklist → linked_protocols cross-ref (chips on items)
- Supplements → My Stack tab (cross-ref with Supabase active_protocols)
- Foods → related_protocols cross-ref

**Fields used in UI:**
- `name` — display name
- `protocol_number` — mono badge `P-01` through `P-24`
- `category` — filter tabs (sleep / testosterone / dht / hair / nutrition / gut / blood_work / stress / training)
- `goal` — one-line in card + detail header
- `priority` — badge (critical / core / advanced / optional)
- `steps` — numbered list in detail (order + text)
- `timing` — in detail
- `items_needed` — chips in detail (cross-link to supplements/foods)
- `cautions` — warning-styled list in detail
- `checklist_ready` — CHECKLIST badge on protocol card
- `advanced` — gate: hide if true and Advanced Mode OFF
- `source_refs` — source ref display
- `tags` — internal filtering

---

## claims.json (59 records)
**Used by:**
- Knowledge Search — matched + displayed (claim text + mechanism + practical_implication)
- SearchDetailDrawer — full claim record

**Fields used in UI:**
- `claim` — main display text
- `claim_type` — displayed as badge
- `mechanism` — in detail
- `practical_implication` — in detail
- `app_usage` — internal gate (knowledge_only claims: display only, not as checklist)
- `source_refs` — source ref display
- `tags` — internal filtering

**NOT used for:**
- Generating checklist items (checklist_items.json is authoritative)
- Generating food rules (foods.json is authoritative)
- Any screen outside Knowledge Search

---

## blood_markers.json (77 records)
**Used by:**
- Bloodwork Reference — all 11 panels + marker rows + detail drawer
- Knowledge Search — matched + displayed

**Fields used in UI:**
- `name` — display name
- `panel` — panel selector grouping (11 panels)
- `optimal_range` — prominent display in table + drawer
- `standard_range` — secondary display in drawer
- `units` — displayed next to ranges
- `high_means` — in detail drawer
- `low_means` — in detail drawer
- `why_it_matters` — in detail drawer
- `related_markers` — cross-link chips in drawer
- `source_refs` — source ref display
- `tags` — internal (dutch tag = show Phase 2/3 badge)

**DUTCH panel:**
- 3 records with `panel: "dutch"`
- Display with "PHASE 2/3 — DUTCH Add-on" badge in drawer
- Show in panel selector but mark as future

---

## routines.json (11 records)
**Used by:**
- Routines screen — all 11 routines
- Dashboard → TodayRoutineCard (daily / training_day / rest_day)

**Fields used in UI:**
- `name` — display name
- `type` — badge + grouping (daily / training_day / rest_day / sleep / weekly / monthly)
- `sections` — accordion sections: `title` as section header, `items[]` as text list
- `source_refs` — source ref display

---

## checklist_items.json (44 records)
**Used by:**
- Daily Checklist — primary content (all 44 items)
- Dashboard → QuickChecklist (priority=critical items)
- Dashboard → ChecklistProgressCard (count/completion)
- Protocol Library → ProtocolDetail cross-ref (items linked to protocol)

**Fields used in UI:**
- `title` — main display label
- `description` — shown in expanded/detail view
- `frequency` — FrequencyFilter grouping (daily / training_day / rest_day / weekly / monthly)
- `time_of_day` — section grouping (morning / pre-workout / intra-workout / post-workout / evening / pre-bed / anytime)
- `category` — badge on item
- `priority` — visual indicator (critical=accent dot / core=neutral / optional=dimmed)
- `linked_protocols` — protocol chip cross-links
- `linked_items` — supplement/food chip cross-links
- `source_refs` — shown in item detail

**Supabase cross-ref:**
- `id` — used as `item_id` in `checklist_completions` table

---

## cooking_guides.json (12 records)
**Used by:**
- Nutrition & Cooking → Cooking Guides tab (9 individual food guides)
- Nutrition & Cooking → Meal Patterns tab (3 meal pattern guides)
- FoodDetailDrawer → linked cooking guide chip (if food_id matches)

**Fields used in UI:**
- `food_id` — cross-ref to foods.json for food name
- `title` — guide title
- `prep_method` — displayed in guide card
- `cooking_method` — displayed in guide card
- `avoid` — displayed as warning list
- `timing` — displayed in guide
- `notes` — displayed as additional info
- `tags` — internal filtering

---

## shopping_items.json (56 records)
**Used by:**
- Shopping List — all 56 items (4 category tabs)

**Fields used in UI:**
- `name` — display name
- `category` — tab grouping (supplement / food / tool / other)
- `priority` — badge (critical / core / optional / context_dependent)
- `linked_food_or_supplement` — chip cross-link to foods/supplements detail
- `status` — initial state: all "not_bought" (overridden by Supabase)

**NOT displayed:**
- `estimated_price` — all "Not clearly stated in KB." — show `—`
- `link` — all empty string — never render a link

**Supabase cross-ref:**
- `id` — used as `item_id` in `shopping_status` table

---

## app_features.json (11 features / 86 subfeatures)
**Used by:**
- Internal phase gating only
- No direct UI display in Phase 1

**Usage:**
- Feature phase labels (`phase_1` / `phase_2` / `phase_3`) drive what is shown/hidden
- Phase 2+ features: no UI, no nav items, no placeholders
- Macro & Fuel System (`feature_7_macro_fuel`) — `phase_2`, completely absent in Phase 1 UI

---

## Cross-Reference Map

| Source field | Target file | Target field | Usage |
|---|---|---|---|
| `checklist_items.linked_protocols` | `protocols.json` | `id` | Protocol chip on checklist item |
| `checklist_items.linked_items` | `foods.json` / `supplements.json` | `id` | Food/supplement chip on item |
| `cooking_guides.food_id` | `foods.json` | `id` | Food name on cooking guide |
| `shopping_items.linked_food_or_supplement` | `foods.json` / `supplements.json` | `id` | Detail drawer chip on shopping row |
| `blood_markers.related_markers` | `blood_markers.json` | `id` | Related marker chips in drawer |
| `foods.related_protocols` | `protocols.json` | `id` | Protocol chips in food drawer |
| `supplements.related_protocols` | `protocols.json` | `id` | Protocol chips in supplement drawer |
| `protocols.items_needed` | `supplements.json` / `foods.json` | `id` | Items needed chips in protocol detail |
| All `source_refs` | `sources.json` | `shorthand` | Source display (shorthand + page) |
| All `tags` | `tags.json` | `id` | Filtering + display |

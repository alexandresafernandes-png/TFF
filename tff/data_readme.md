# Biohacking KB — Data Readme
**Source:** `biohacking_kb_final_v2.md`
**Phase:** 2A — Database files only. No app code yet.
**Fidelity rule:** All data comes strictly from the 6 ebooks as extracted in the KB. No outside knowledge. No invented fields.

---

## Files in this folder

| File | Status | Records | Notes |
|------|--------|---------|-------|
| `database_schema.md` | ✅ Complete | — | All schemas defined |
| `sources.json` | ✅ Batch 1 | 6 | All 6 ebooks |
| `tags.json` | ✅ Batch 1 | 51 | Topics, sources, content types, priorities, timings, goals |
| `foods.json` | ✅ Batch 1 | 20 | Full food status taxonomy applied |
| `supplements.json` | ✅ Batch 1 | 32 | Full tier system applied |
| `protocols.json` | ⏳ Batch 2 | — | Protocols 1–15 + 16–24 advanced |
| `blood_markers.json` | ⏳ Batch 2 | — | Full marker panel |
| `claims.json` | ⏳ Batch 2 | — | Claims with type taxonomy |
| `routines.json` | ⏳ Batch 3 | — | Daily/weekly/monthly routines |
| `checklist_items.json` | ⏳ Batch 3 | — | Checklist items with priorities |
| `shopping_items.json` | ⏳ Batch 3 | — | Shopping list |
| `cooking_guides.json` | ⏳ Batch 3 | — | Prep methods per food |
| `app_features.json` | ⏳ Batch 3 | — | Feature map from KB |

---

## Key rules applied

### Food status taxonomy
- `APPROVED_CORE` — Repeatedly framed as foundational in ebooks
- `APPROVED_CONTEXT` — Allowed but timing/source/preparation matters
- `PREP_REQUIRED` — Only acceptable in a specific prepared form (e.g. oats)
- `AVOID` — Ebook clearly says to avoid
- `DEPENDS` — Only useful in specific protocol/context
- `NOT_MENTIONED` — Not present in ebooks/KB

### Supplement tier system
- `TIER_1` — Core foundational (author's personal stack, repeatedly emphasized)
- `TIER_2` — Evidence-based advanced (context or cycling recommended)
- `TIER_3` — Experimental (limited human data; short cycles; cautions apply)
- `OPTIONAL` — Mentioned as tools with mixed author experience
- `CONTEXT_DEPENDENT` — Only for specific conditions

### Claims taxonomy (Batch 2)
- `actionable_protocol` → can become checklist item
- `food_rule` → goes into food/nutrition DB
- `lab_interpretation` → bloodwork hub only, NOT a task
- `mechanistic_concept` → knowledge card only, not a task
- `lifestyle_theory` → claims/concept DB only
- `avoid_caution` → checklist item only if simple and clear
- `advanced_compound` → advanced protocol only
- `context_dependent` → hidden until condition matches

### Tag categories
- `topic` — sleep, testosterone, dht, hair, blood_work, performance, gut, thyroid, estrogen, cortisol, inflammation, training, nadph, mitochondria, insulin
- `source` — src_sleep_recovery, src_tff_2_0, src_dht_remastered, src_hair_loss, src_blood_work_guide, src_performance_nutrition
- `content_type` — type_supplement, type_food, type_tool, type_habit, type_protocol, type_claim, type_marker
- `priority` — pri_critical, pri_core, pri_advanced, pri_experimental, pri_optional
- `timing` — time_morning, time_pre_workout, time_intra_workout, time_post_workout, time_evening, time_pre_bed, time_with_meals, time_fasted, time_anytime
- `goal` — goal_build_muscle, goal_optimize_t, goal_optimize_dht, goal_hair_growth, goal_fat_loss, goal_sleep_quality, goal_stress_reduction, goal_recovery, goal_gut_health

---

## Missing data handling
Where information is not clearly stated in the KB, the field is set to:
```
"Not clearly stated in KB."
```
No data has been invented or inferred from outside the 6 ebooks.

---

## ID conventions
IDs use `snake_case` stable slugs:
- Foods: `red_meat`, `eggs_whole`, `organ_meats_liver`, `seed_oils`
- Supplements: `magnesium`, `vitamin_d3_k2`, `creatine`, `kestose`
- Protocols: `protocol_1_sleep_stack`, `protocol_10_dht_starter_stack`
- Blood markers: `tsh`, `free_t3`, `total_testosterone`, `shbg`, `hsCRP`
- Claims: `sleep_t_drop_one_night`, `pufa_5ar_inhibition`, `prolactin_dht_suppression`

---

## App consumption notes
- All files are static JSON arrays
- No database server required for MVP
- Next.js can import directly or serve as /public/data/*.json
- Filter by `status`, `tier`, `tags`, `category`, `claim_type`, `panel`
- Every item links back to `sources.json` via `source_refs[]`
- Every item links to `tags.json` via `tags[]`
- Protocols link to supplements/foods via `items_needed[]`
- Checklist items link to protocols via `linked_protocols[]`

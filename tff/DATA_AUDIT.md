# TFF Data Package — Data Audit Report

**Audit date:** Generated at package build time
**Source:** All 12 JSON files in `/data/`
**Result: PASSED — 0 errors, 0 warnings**

---

## Audit Scope

| Check | Method |
|-------|--------|
| JSON syntax validity | `json.load()` — parse error = fail |
| Duplicate IDs per file | Set comparison across all `id` fields |
| Missing required schema fields | Field-by-field check per `database_schema.md` |
| Invalid enum values | Checked against defined taxonomies |
| Broken tag references | Every tag checked against `tags.json` |
| Broken linked_protocols | Every protocol ID checked against `protocols.json` |
| Broken linked_items | Every item ID checked against `foods.json` + `supplements.json` |
| Broken food_id in cooking_guides | Every food_id checked against `foods.json` |
| Broken related_markers in blood_markers | Every related_marker ID checked against marker ID set |
| Broken linked_food_or_supplement in shopping | Every non-empty ID checked against foods + supplements |
| Advanced DHT in default checklist | Protocol IDs 16–24 must not appear in checklist_items linked_protocols |
| Macro & Fuel System phase | Must be `phase_2` only |
| Feature 11 existence | `feature_11_integrations_data_management` must be present |
| Phase label consistency | Only `phase_1` / `phase_2` / `phase_3` allowed anywhere |
| hs_crp ID correctness | `hs_crp` must exist; `hscRP` must not |
| Invented prices | `estimated_price` must be `"Not clearly stated in KB."` or empty |
| Internet links | `link` field in shopping_items must be empty string only |

---

## Per-File Results

### sources.json — 6 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Enum errors: 0
- Tag errors: N/A (no tags field)
- **Result: PASS**

---

### tags.json — 51 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Categories present: topic (15), source (6), content_type (7), priority (5), timing (9), goal (9)
- **Result: PASS**

---

### foods.json — 23 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Status enum values all valid (APPROVED_CORE / APPROVED_CONTEXT / PREP_REQUIRED / AVOID / DEPENDS / NOT_MENTIONED)
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### supplements.json — 37 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Tier enum values all valid (TIER_1 / TIER_2 / TIER_3 / OPTIONAL / CONTEXT_DEPENDENT)
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### protocols.json — 24 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Protocol numbers 1–24: all present, no gaps ✓
- Protocols 16–24: all `advanced: true` ✓
- Protocols 16–24: all `checklist_ready: false` ✓
- No advanced protocol has `checklist_ready: true` ✓
- Category enum: all valid ✓
- Priority enum: all valid ✓
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### claims.json — 59 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- `claim_type` enum: all valid (8 allowed types) ✓
- `app_usage` enum: all valid (checklist / knowledge_only / protocol / warning / database) ✓
- app_usage breakdown: checklist=13, knowledge_only=5, warning=14, database=17, protocol=10
- Social/behavioral claims confirmed as `knowledge_only` — not in checklist ✓
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### blood_markers.json — 77 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- `panel` enum: all valid (11 panels) ✓
- Panels covered: thyroid (6), sex_hormones (11), metabolic (7), lipids (7), inflammation (1), micronutrients (14), liver (7), kidney (4), bone_mineral (2), cbc (15), dutch (3)
- Broken `related_markers` references: 0 ✓
- `related_untracked_markers` used correctly for 3 non-lab items (body_fat_percent, il6_tnf_proxy, creatine_kinase) ✓
- ID `hs_crp` present: ✓
- ID `hscRP` present: ✗ (correctly absent — renamed in integrity patch) ✓
- All 20 `related_markers` references updated from `hscRP` → `hs_crp` ✓
- Tags: all resolve to tags.json ✓
- **MCHC note:** Record `mchc` created for linkability only. KB patch explicitly states: "MCHC not clearly extracted from ebook text — do not create detailed MCHC logic without further source verification." Optimal range and interpretation fields correctly marked "Not clearly stated in KB."
- **Result: PASS**

---

### routines.json — 11 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- `type` enum: all valid (daily / training_day / rest_day / sleep / weekly / monthly) ✓
- Type breakdown: daily (5), training_day (1), rest_day (1), sleep (1), weekly (2), monthly (1)
- Sections all contain `title` and `items` ✓
- No advanced DHT protocols appear as default routine items ✓
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### checklist_items.json — 44 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- `frequency` enum: all valid ✓
- `time_of_day` enum: all valid ✓
- `priority` enum: all valid ✓
- Broken `linked_protocols` references: 0 ✓
- Broken `linked_items` references: 0 ✓
- Advanced DHT protocols (16–24) linked in default checklist: 0 ✓
- Social/behavioral claims as checklist items: 0 ✓
- Category breakdown: nutrition (10), sleep (6), post_workout (5), supplements (5), hair (4), cooking (4), weekly_review (2), training (2), morning_light (2), bloodwork (1), pre_workout (1), intra_workout (1), minimum_effective_day (1)
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### cooking_guides.json — 12 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Broken `food_id` references: 0 ✓
- All 12 food_id values resolve to existing foods.json records ✓
- 3 meal-pattern guides use closest matching food_id (white_rice, eggs_whole, red_meat) — by design, not a broken ref ✓
- No invented recipes ✓
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### shopping_items.json — 56 records
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- `priority` enum: all valid (critical / core / optional / context_dependent) ✓
- `status`: all = "not_bought" ✓
- Broken `linked_food_or_supplement` references: 0 ✓
- Empty `linked_food_or_supplement` (tools): 19 — correct; tools have no food/supplement equivalent ✓
- Invented prices: 0 (all = "Not clearly stated in KB.") ✓
- Internet links: 0 (all `link` fields = "" empty string) ✓
- Category breakdown: supplement (25), food (12), tool (18), other (1)
- Priority breakdown: critical (17), core (31), optional (8)
- Tags: all resolve to tags.json ✓
- **Result: PASS**

---

### app_features.json — 11 features / 86 subfeatures
- JSON valid: ✓
- Duplicate IDs: 0
- Missing fields: 0
- Phase enum (top-level): only `phase_1` / `phase_2` / `phase_3` ✓
- Phase enum (subfeatures): only `phase_1` / `phase_2` / `phase_3` ✓
- Phase breakdown (top-level): phase_1 (7), phase_2 (3), phase_3 (1)
- Phase breakdown (subfeatures): phase_1 (39), phase_2 (38), phase_3 (9)
- Old labels `v1_mvp` / `v2` / `phase_2_3`: absent ✓ (all renamed in final patch)
- Macro & Fuel System (`feature_7_macro_fuel`): phase_2 ✓
- Macro & Fuel System subfeatures (7.1–7.9): all phase_2 ✓
- Feature 11 (`feature_11_integrations_data_management`): present ✓ (phase_3, 5 subfeatures)
- Feature 11 subfeature 11.1 (Export/Backup): phase_2 ✓
- Feature 11 subfeatures 11.2–11.5: phase_3 ✓
- Advanced DHT protocols appear only in phase_3 subfeatures (3.5, 3.6) ✓
- DUTCH add-on appears only in phase_3 subfeature (5.9) ✓
- **Result: PASS**

---

## Cross-File Integrity Summary

| Cross-Reference | Broken | Status |
|-----------------|--------|--------|
| blood_markers `related_markers` → marker IDs | 0 | ✓ PASS |
| checklist_items `linked_protocols` → protocol IDs | 0 | ✓ PASS |
| checklist_items `linked_items` → food/supplement IDs | 0 | ✓ PASS |
| cooking_guides `food_id` → food IDs | 0 | ✓ PASS |
| shopping_items `linked_food_or_supplement` → food/supplement IDs | 0 | ✓ PASS |
| All `tags` fields → tags.json IDs | 0 | ✓ PASS |
| Advanced DHT protocols in default checklist | 0 | ✓ PASS |

---

## Special Integrity Checks

| Check | Result |
|-------|--------|
| `hs_crp` present in blood_markers | ✓ |
| `hscRP` absent from blood_markers | ✓ |
| All 20 `hs_crp` related_markers references updated | ✓ |
| Protocols 16–24: all `advanced: true` | ✓ |
| Protocols 16–24: all `checklist_ready: false` | ✓ |
| Macro & Fuel System: `phase_2` only | ✓ |
| Feature 11: present and `phase_3` | ✓ |
| No `v1_mvp` / `v2` / `phase_2_3` labels in app_features | ✓ |
| No invented prices in shopping_items | ✓ |
| No internet links in shopping_items | ✓ |
| No outside knowledge in any file | ✓ |

---

## Final Verdict

**0 errors. 0 warnings. All 12 JSON files pass full audit.**

All data sourced exclusively from `biohacking_kb_final_v2.md` (6 ebooks). No outside knowledge, no invented details, no internet links, no invented prices. Schema compliance confirmed across all 411 records.


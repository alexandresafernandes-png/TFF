# TFF Data Package — Manifest

**Package:** `tff_data_package.zip`
**Version:** v2 (post-patch)
**Built from:** `biohacking_kb_final_v2.md`
**Total JSON records across all files:** 411

---

## Files Included

### Documentation

| File | Purpose | Status |
|------|---------|--------|
| `database_schema.md` | Schema definitions for all 14 collection types: field names, types, enums, and notes | Final |
| `data_readme.md` | Conventions, taxonomy reference, missing-data rules, cross-file linking guide, app consumption notes | Final |
| `DATA_PACKAGE_MANIFEST.md` | This file — record counts, purposes, status | Final |
| `DATA_AUDIT.md` | Full cross-file validation report — errors, warnings, integrity checks | Final |

---

### JSON Data Files

| File | Records | Purpose | Status | Notes |
|------|---------|---------|--------|-------|
| `sources.json` | 6 | The 6 source ebooks with title, shorthand ID, and disclaimer notes | Final | IDs used as source_refs throughout all other files |
| `tags.json` | 51 | All tag IDs across 6 categories: topic, source, content_type, priority, timing, goal | Final | Used as tagging vocabulary across all other files |
| `foods.json` | 23 | Food database with status taxonomy (APPROVED_CORE / APPROVED_CONTEXT / PREP_REQUIRED / AVOID / DEPENDS / NOT_MENTIONED), purpose, mechanism, cooking method, timing, source refs | Final | food_ids are referenced by cooking_guides and shopping_items |
| `supplements.json` | 37 | Supplement database with tier system (TIER_1–3 / OPTIONAL / CONTEXT_DEPENDENT), dose, timing, mechanism, cautions, source refs | Final | Supplement IDs referenced by checklist_items and shopping_items |
| `protocols.json` | 24 | All 24 protocols: 1–15 standard (checklist_ready eligible) + 16–24 advanced DHT (advanced: true, checklist_ready: false). Full steps, timing, cautions, stop rules | Final | Protocols 16–24 must remain hidden behind advanced mode in app UI |
| `claims.json` | 59 | Main KB claims classified by claim_type (8 types) and app_usage (checklist / knowledge_only / protocol / warning / database). High-impact, protocol-linked, and avoid claims prioritized | Final | Social/behavioral claims marked knowledge_only; not turned into daily checklist items |
| `blood_markers.json` | 77 | All blood markers across 11 panels: thyroid (6), sex_hormones (11), metabolic (7), lipids (7), inflammation (1), micronutrients (14), liver (7), kidney (4), bone_mineral (2), cbc (15), dutch (3). Optimal ranges from KB only | Final | `hs_crp` is the correct ID (renamed from `hscRP` in integrity patch). DUTCH markers tagged phase_2_3. MCHC record created for linkability only — detailed logic pending source verification |
| `routines.json` | 11 | Structured daily/weekly/monthly routines with sections and action items: daily, morning, training day, rest day, sleep, weekly, monthly, minimum effective day, nutrition, hair, supplement timing | Final | No advanced DHT protocols appear as default routine items |
| `checklist_items.json` | 44 | Granular checklist items across 13 categories. Each item has frequency, time_of_day, priority, linked_protocols, linked_items, source refs. Covers: sleep, morning light, nutrition, cooking, training, pre/intra/post workout, supplements, bloodwork, hair, weekly review | Final | 0 advanced DHT protocol links in default checklist confirmed |
| `cooking_guides.json` | 12 | Detailed cooking and preparation guides for 9 individual foods + 3 meal patterns (post-workout, pre-workout, evening protein+fat). Includes: prep_method, cooking_method, avoid, timing, notes | Final | All food_id values resolve to existing foods.json IDs. Meal patterns use closest matching food ID |
| `shopping_items.json` | 56 | Shopping/inventory list across 4 categories: supplement (25), food (12), tool (18), other (1). Each item: priority, reason, linked_food_or_supplement, status=not_bought. No invented prices. No internet links | Final | 19 tool items have empty linked_food_or_supplement — correct (tools have no food/supplement equivalent) |
| `app_features.json` | 11 features / 86 subfeatures | Full app feature roadmap across 3 phases. 10 major systems + Integrations & Data Management. Phase labels: phase_1 / phase_2 / phase_3 | Final | Macro & Fuel System is Feature 7, phase_2 only. Advanced DHT protocols (16–24) appear in phase_3 subfeatures only. Feature 11 (Integrations & Data Management) added in final patch |

---

## Record Count Summary

| Category | Count |
|----------|-------|
| Sources | 6 |
| Tags | 51 |
| Foods | 23 |
| Supplements | 37 |
| Protocols | 24 |
| Claims | 59 |
| Blood Markers | 77 |
| Routines | 11 |
| Checklist Items | 44 |
| Cooking Guides | 12 |
| Shopping Items | 56 |
| App Features (top-level) | 11 |
| App Subfeatures | 86 |
| **Total JSON records** | **411** |

---

## Phase Labels (app_features.json)

| Phase | Meaning | Features at top level | Subfeatures |
|-------|---------|----------------------|-------------|
| `phase_1` | Core MVP (Vercel/Next.js static + checklist) | 7 | 39 |
| `phase_2` | Personal execution, tracking, macro system | 3 | 38 |
| `phase_3` | Advanced intelligence, integrations, DUTCH | 1 | 9 |

---

## Key Design Decisions Preserved

1. **Protocols 16–24** — `advanced: true`, `checklist_ready: false` on all. Must be hidden behind advanced mode toggle in app UI.
2. **`hs_crp`** — final correct ID for high-sensitivity CRP marker. Old ID `hscRP` removed.
3. **MCHC** — record created for linkability only. Detailed interpretation logic pending source verification per KB patch note.
4. **DUTCH markers** — tagged for Phase 3. Blood panel is the primary MVP bloodwork system.
5. **Macro & Fuel System** — Phase 2 only. Not a generic calorie tracker — checklist-based macro correction layer using saved meals and day-type targets.
6. **No outside knowledge** — all data sourced exclusively from the 6 ebooks via `biohacking_kb_final_v2.md`.
7. **Social/behavioral claims** — classified `knowledge_only` and `lifestyle_theory`. Not turned into daily checklist items.

---

## Files That May Need Future Updates

| File | Reason |
|------|--------|
| `blood_markers.json` | MCHC logic pending source verification. DUTCH optimal ranges may need expansion. |
| `app_features.json` | Subfeature details will evolve as development progresses. Phase 3 features are roadmap-only. |
| `shopping_items.json` | Prices not stated in KB — could be added from real-world sourcing. Links intentionally empty. |
| `tags.json` | New tags may be needed as app UI expands (e.g. `minimum_effective_day` as a checklist category is currently not a tag). |


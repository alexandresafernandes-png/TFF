# Biohacking KB — Database Schema
**Version:** v2 (from biohacking_kb_final_v2.md)
**Purpose:** Static JSON database for Next.js/Vercel MVP app.
**Rule:** All data sourced strictly from the 6 ebooks as extracted in the KB. No outside knowledge.

---

## sources.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug, e.g. `sleep_recovery` |
| ebook_title | string | Full ebook title |
| shorthand | string | Short label used in source_refs throughout other files |
| notes | string | Any ebook-level caveats |

---

## tags.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| category | string | topic / source / content_type / priority / timing / goal |

---

## foods.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug, e.g. `red_meat` |
| name | string | Display name |
| status | enum | APPROVED_CORE / APPROVED_CONTEXT / PREP_REQUIRED / AVOID / DEPENDS / NOT_MENTIONED |
| category | string | protein / fat / starch / dairy / condiment / other |
| purpose | string | One-line purpose |
| why | string | Mechanism/reason per KB |
| prep_required | boolean | true if prep method matters |
| cooking_method | string | Per KB or "Not clearly stated in KB." |
| timing | string | When to eat (e.g. post-workout, pre-bed) |
| avoid_reason | string | If AVOID, why; else null |
| related_protocols | string[] | Protocol IDs |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## supplements.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug, e.g. `magnesium` |
| name | string | Display name |
| tier | enum | TIER_1 / TIER_2 / TIER_3 / OPTIONAL / CONTEXT_DEPENDENT |
| category | string | mineral / vitamin / amino_acid / adaptogen / nootropic / gut / advanced / sleep / joint / other |
| purpose | string | One-line purpose |
| mechanism | string | How it works per KB |
| dose | string | Dose range from KB |
| timing | string | When to take |
| cautions | string[] | Cautions per KB |
| related_protocols | string[] | Protocol IDs |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## protocols.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| protocol_number | integer | 1–24 |
| category | string | sleep / testosterone / dht / hair / nutrition / gut / blood_work / stress / training |
| goal | string | What it achieves |
| priority | string | critical / core / advanced / optional |
| source_refs | string[] | Source shorthand + page |
| steps | object[] | {order, text} |
| timing | string | When/how often |
| items_needed | string[] | supplements/foods/tools |
| cautions | string[] | Stop rules, warnings |
| checklist_ready | boolean | Can be used in daily checklist |
| advanced | boolean | Protocols 16–24 are advanced |
| tags | string[] | tag IDs |

---

## blood_markers.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug, e.g. `tsh` |
| name | string | Display name |
| panel | string | thyroid / sex_hormones / metabolic / lipids / inflammation / micronutrients / liver / kidney / bone_mineral / cbc / dutch |
| optimal_range | string | From KB |
| standard_range | string | Lab reference range per KB |
| units | string | mIU/L, ng/dL, etc. |
| high_means | string | What elevated means |
| low_means | string | What low means |
| why_it_matters | string | Clinical relevance |
| related_markers | string[] | Marker IDs to read with |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## claims.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| claim | string | The claim text |
| claim_type | enum | actionable_protocol / food_rule / lab_interpretation / mechanistic_concept / lifestyle_theory / avoid_caution / advanced_compound / context_dependent |
| topic | string[] | topic tag IDs |
| source_refs | string[] | Source shorthand + page |
| mechanism | string | How it works |
| practical_implication | string | What to do about it |
| app_usage | enum | checklist / knowledge_only / protocol / warning / database |
| tags | string[] | tag IDs |

---

## routines.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| type | enum | daily / training_day / rest_day / sleep / weekly / monthly |
| sections | object[] | {title, items: string[]} |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## checklist_items.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| title | string | Short display label |
| description | string | Longer explanation per KB |
| frequency | string | daily / training_day / rest_day / weekly / monthly |
| time_of_day | string | morning / pre-workout / intra-workout / post-workout / evening / pre-bed / anytime |
| category | string | sleep / nutrition / training / supplement / hair / lifestyle / lab |
| priority | string | critical / core / optional |
| linked_protocols | string[] | Protocol IDs |
| linked_items | string[] | supplement or food IDs |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## shopping_items.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| category | string | supplement / food / tool / personal_care / water / other |
| priority | string | critical / core / optional |
| reason | string | Why you need it |
| linked_food_or_supplement | string | food or supplement ID |
| estimated_price | string | "Not clearly stated in KB." unless mentioned |
| link | string | null — not sourced |
| status | string | not_bought (default) |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## cooking_guides.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| food_id | string | Links to foods.json |
| food_name | string | Display name |
| prep_method | string | Per KB |
| cooking_method | string | Per KB |
| avoid | string | What NOT to do |
| timing | string | When to eat this food |
| notes | string | Additional KB notes |
| source_refs | string[] | Source shorthand + page |
| tags | string[] | tag IDs |

---

## app_features.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| big_feature_number | string | e.g. "1", "2", "3" |
| subfeatures | object[] | {id, name, phase, notes} |
| priority | string | must_have / nice_to_have / phase_2_3 |
| effectiveness | string | Per KB feature map |
| utility | string | Per KB |
| implementation_speed | string | Per KB |
| phase | string | v1_mvp / v2 / phase_2_3 |
| notes | string | Additional context |

---

## tags.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| name | string | Display name |
| category | string | topic / source / content_type / priority / timing / goal |

---

## sources.json
| Field | Type | Notes |
|-------|------|-------|
| id | string | stable slug |
| ebook_title | string | Full title |
| shorthand | string | Short label |
| notes | string | Caveats |

---

## Rules Applied
1. All data from ebooks only.
2. "Not clearly stated in KB." used when data is missing.
3. Every item has source_refs where available.
4. Every item has tags.
5. IDs are stable slugs.
6. Schemas are consistent across all files.
7. Static JSON only — no DB server needed for MVP.

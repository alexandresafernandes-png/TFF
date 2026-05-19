# TFF — Phase Plan
**Version:** v1.0

---

## Phase 1 — Core MVP (Knowledge Base + Persistence Foundation)

**Goal:** Fully functional private biohacking knowledge base with cloud sync. The operator can access all 411 records of structured KB data, track daily checklist, manage protocols, and have everything synced across devices.

**Stack:**
- Next.js 14+ App Router (TypeScript)
- Tailwind CSS + TFF Design System
- Supabase (Auth + Postgres + Storage provisioned)
- Vercel hosting
- PWA (installable on mobile)

**Screens:** 12 + Onboarding
Dashboard, Knowledge Search, Daily Checklist, Protocol Library, Protocol Detail, Nutrition & Cooking, Food Detail, Supplements, Bloodwork Reference, Shopping List, Routines, Sources/References

**Data:** All 12 JSON files, static import at build time
**User data (Supabase):** user_settings, checklist_completions, active_protocols, shopping_status, notes

**Key Phase 1 capabilities:**
- Full knowledge base search across all JSON data
- 44-item daily checklist with cross-device sync
- 15 standard protocols (advanced 16–24 locked behind toggle)
- 23 foods with status taxonomy
- 37 supplements with tier system
- 77 blood markers across 11 panels
- 56 shopping items with bought tracking
- 11 routines (reference)
- 12 cooking guides
- Source attribution throughout

**Excluded from Phase 1:**
- Macro & Fuel System (Phase 2)
- Bloodwork input/interpretation (Phase 2)
- Any logging beyond notes (Phase 2)
- Advanced DHT protocols default UI (Phase 3)
- All external integrations (Phase 3)

**Deliverable:** Deployed Vercel app + PWA, single operator, fully functional knowledge command center.

---

## Phase 2 — Personal Execution + Tracking + Macro & Fuel

**Goal:** Transform the knowledge base into a personal execution layer. The operator can log their own data, track progress, and use the Macro & Fuel correction system.

**New screens:**
- Bloodwork Input Flow (step-by-step marker entry)
- Bloodwork Results (personal results vs optimal ranges)
- Tracking Hub (central log access)
- Supplement Log
- Training Log
- Symptom Log
- Experiment Log (self-experiments)
- Macro & Fuel System
- Progress Photos

**New Supabase tables:**
- `bloodwork_entries` — marker_id, value, date, notes
- `bloodwork_results` — panel, entry_ids, date
- `saved_meals` — meal_name, components[], macros{protein, carbs, fat, calories}
- `meal_logs` — date, saved_meal_id, day_type
- `macro_logs` — date, day_type, protein_actual, carbs_actual, fat_actual, correction_applied
- `supplement_logs` — supplement_id, date, taken (boolean), notes
- `training_logs` — date, session_type, notes, perceived_effort
- `symptom_logs` — date, symptom_id, severity, notes
- `experiment_logs` — experiment_id, protocol_id, start_date, end_date, observations

**Macro & Fuel System — Phase 2 Architecture:**
```
The Macro & Fuel System is NOT a generic calorie tracker.
It is a checklist-based macro correction layer.

How it works:
1. Operator selects day type: training_day | rest_day | minimum_effective_day
2. Saved meals have stored macros (set once, reused)
3. Operator logs completed meals for the day
4. App compares:
   - Sum of logged meal macros vs day-type macro targets
5. App generates checklist-style corrections:
   - "Add protein source (50g needed)"
   - "Reduce starch (~40g over target)"
   - "Add fat source to evening meal"
6. Corrections displayed as ticks — operator decides to act or skip
7. No macro rings. No calorie circles. No food tracking obsession.
   Interface must maintain TFF command-center aesthetic.

Day-type targets:
- Stored in user_settings or as a separate targets table
- Set by operator (no invented default values)
```

**Export/Backup UI:**
- Export personal data to JSON (bloodwork, logs, settings)
- Upload to Supabase Storage `backups` bucket

**Phase 2 stack additions:**
- No new infrastructure needed — Supabase already provisioned

---

## Phase 3 — Intelligence + Integrations

**Goal:** Connect external data sources and add intelligent interpretation layer.

**Key Phase 3 features:**

### Advanced DHT Protocols
- Protocols 16–24 fully accessible (Advanced Mode unlocked permanently or per-operator choice)
- Dedicated Advanced Protocols section in nav
- Integration with tracking hub (symptom correlation)

### DUTCH Add-on
- DUTCH panel markers (3 in `blood_markers.json`) fully integrated
- DUTCH result input flow
- Interpretation layer (if data from KB supports it)

### External Integrations
- WHOOP: HRV, sleep data, recovery score → auto-populate sleep/recovery logs
- Garmin: training load, heart rate → auto-populate training logs
- Integration auth via OAuth, stored tokens in Supabase

### Bloodwork Interpretation Engine
- Compare personal bloodwork results to optimal_range from `blood_markers.json`
- Generate prioritized action list based on out-of-range markers
- Cross-reference with active protocols
- Flag conflicting supplement/protocol interactions

### Intelligence Layer
- Pattern detection across symptom_logs + bloodwork_entries + supplement_logs
- Identify correlations (e.g. low sleep quality → elevated cortisol pattern)
- Suggest protocol adjustments based on logged data
- Not AI chat — structured rule-based engine derived from KB claims

### Phase 3 stack additions:
- External OAuth providers (WHOOP, Garmin)
- Edge Functions (Supabase) for interpretation engine
- Possibly: AI-assisted search (semantic search over KB) — separate scoped decision

---

## Phase Summary Table

| Feature | Phase |
|---------|-------|
| Dashboard | 1 |
| Knowledge Search | 1 |
| Daily Checklist | 1 |
| Protocol Library (1–15) | 1 |
| Nutrition & Cooking | 1 |
| Supplements | 1 |
| Bloodwork Reference | 1 |
| Shopping List | 1 |
| Routines | 1 |
| Sources / References | 1 |
| Onboarding | 1 |
| Supabase Auth + 5 core tables | 1 |
| PWA (mobile installable) | 1 |
| Cross-device sync (core tables) | 1 |
| Bloodwork Input + Personal Results | 2 |
| Supplement Logging | 2 |
| Training Logging | 2 |
| Symptom Logging | 2 |
| Experiment Logging | 2 |
| Macro & Fuel System | 2 |
| Saved Meals | 2 |
| Meal Logging | 2 |
| Progress Photos | 2 |
| Tracking Hub | 2 |
| Export / Backup UI | 2 |
| Advanced DHT Protocols UI (16–24) | 3 |
| DUTCH Panel Integration | 3 |
| WHOOP Integration | 3 |
| Garmin Integration | 3 |
| Bloodwork Interpretation Engine | 3 |
| Intelligence / Pattern Layer | 3 |
| AI-assisted semantic search | 3 (TBD) |

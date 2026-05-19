# TFF — MVP Scope (Phase 1)
**Version:** v1.1 (micro-patch)

> ⚠️ NOTE TO CODING SESSION: Items below marked `[ ]` are **in scope for Phase 1 — not yet built**.
> Do not interpret these as completed tasks. Build each item per APP_BUILD_PLAN.md step order.

---

## Phase 1 — In Scope (To Be Built)

### Infrastructure
- [ ] Next.js App Router project (TypeScript)
- [ ] Tailwind CSS (utility layer only, design tokens via CSS vars)
- [ ] Hosted on Vercel
- [ ] PWA manifest + service worker (installable on mobile)
- [ ] Supabase project setup (Auth + Postgres + Storage)
- [ ] Supabase Auth: email/password or magic-link
- [ ] RLS policies on all tables
- [ ] Phase 1 tables: user_settings, checklist_completions, active_protocols, shopping_status, notes
- [ ] Supabase Storage buckets provisioned (bloodwork, progress-photos, backups, references)
- [ ] Google Fonts: Geist + JetBrains Mono

### Static Data
- [ ] All 12 JSON files imported from `/data/` at build time
- [ ] TypeScript types generated from JSON schemas
- [ ] Client-side search across all JSON files

### Layout
- [ ] Sidebar (desktop, 220px, scanline texture)
- [ ] Topbar (breadcrumb + title + right slot)
- [ ] Mobile bottom nav (4 tabs + More sheet)
- [ ] Footer: `TFF · BUILT FOR ONE OPERATOR · NOT FOR DISTRIBUTION`
- [ ] Grain overlay
- [ ] Density system (compact/comfortable/roomy)
- [ ] Caps mode (on/off)
- [ ] Accent theme switcher (toxic/blood/bone/cyanide)

### Screens
- [ ] Dashboard (with Supabase-synced checklist progress + active protocols)
- [ ] Knowledge Search (client-side, all JSON)
- [ ] Daily Checklist (44 items, Supabase completion sync)
- [ ] Protocol Library (protocols 1–15, advanced hidden)
- [ ] Protocol Detail (full steps, cautions, source refs)
- [ ] Nutrition & Cooking (foods + cooking guides + meal patterns)
- [ ] Food Detail
- [ ] Supplements (all 37, by tier/timing/stack)
- [ ] Bloodwork Reference (77 markers, 11 panels)
- [ ] Shopping List (56 items, Supabase bought status sync)
- [ ] Routines (11 routines, reference view)
- [ ] Sources / References (6 sources)
- [ ] Onboarding (minimal 3-step, saves to Supabase user_settings)

### Components
- [ ] All design system components per DESIGN_SYSTEM.md
- [ ] Status badges (6 food statuses)
- [ ] Tier badges (5 supplement tiers)
- [ ] Phase badges
- [ ] Priority badges
- [ ] Tick/checkbox (Supabase-backed for checklist + shopping)
- [ ] Progress bars (checklist completion)
- [ ] Drawers (desktop right-panel + mobile bottom sheet)
- [ ] SearchDetailDrawer
- [ ] Loading/empty/error states on all data components
- [ ] Offline banner

### Features
- [ ] Keyboard navigation (1–0, ⌘K)
- [ ] Advanced Mode toggle (OFF by default, persisted in Supabase)
- [ ] Cross-device sync for: checklist, shopping, protocols, settings, notes
- [ ] Client-side search
- [ ] Frequency filter on checklist (Today / Training / Rest / Weekly / All)
- [ ] Panel selector for bloodwork
- [ ] Status/tier filters for foods/supplements
- [ ] Category tabs for protocol library

---

## Phase 1 Excludes

### Features (Phase 2)
- [ ] Bloodwork input and personal result tracking
- [ ] Bloodwork interpretation engine
- [ ] Macro & Fuel System
- [ ] Saved meals / meal logging
- [ ] Meal log database
- [ ] Macro log database
- [ ] Symptom logging
- [ ] Training logging
- [ ] Supplement logging
- [ ] Experiment logging
- [ ] Progress photo upload
- [ ] Tracking Hub
- [ ] Streak analytics beyond simple count
- [ ] Personal analytics dashboard
- [ ] Advanced DHT protocols UI (16–24)
- [ ] Export/backup UI (Supabase Storage buckets provisioned but no UI)

### Features (Phase 3)
- [ ] WHOOP / Garmin integrations
- [ ] AI chat or search
- [ ] Smart bloodwork interpretation
- [ ] DUTCH panel deep integration
- [ ] Advanced ML/intelligence

### Infrastructure
- [ ] Multiple user accounts / sharing
- [ ] Team or social features
- [ ] Paid feature gates
- [ ] External health API connections
- [ ] Automated bloodwork parsing

---

## Scope Guard Rules

If any of these appear in Phase 1 code, they are out of scope and must be removed:

1. Any reference to macros, calories, macro rings, macro targets
2. Any UI showing protocols 16–24 in default views
3. Any external API call except Supabase
4. Any localStorage use for checklist or shopping state
5. Any user account creation beyond single-operator auth
6. Any WHOOP/Garmin/health device connection code
7. Any AI/LLM call within the app
8. Any content not sourced from `/data/*.json`

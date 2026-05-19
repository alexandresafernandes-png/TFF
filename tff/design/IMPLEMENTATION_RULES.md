# TFF — Implementation Rules
**Version:** v1.0 — Hard Rules. Do not override.

---

## Rule 1: Visual Identity — Do Not Redesign

- Do not change the color palette.
- Do not change the typography (Geist + JetBrains Mono).
- Do not introduce new UI patterns not in the design system.
- Do not use component libraries (shadcn, MUI, Chakra) — build from design system primitives.
- Tailwind CSS is allowed as a utility layer only. Use CSS vars for all theme values.
- Border-radius max: 6px on cards, 4px on buttons/badges. No rounded-xl, no rounded-full except pills/dots.
- No box-shadows on cards. Borders only.
- No animations beyond 120–200ms transitions. No springs, no bounces.
- No gamer/cyberpunk neon effects.
- No medical SaaS look (no clinical blue/white).
- No generic health app UI patterns.

---

## Rule 2: Product Name

- Visible app name is **TFF** everywhere.
- Footer: `TFF · BUILT FOR ONE OPERATOR · NOT FOR DISTRIBUTION`
- Remove all instances of VILLAIN.OS from visible UI.
- Internal code variable names may use `tff` prefix.

---

## Rule 3: Data Source Rules

- **All app knowledge content must come from `/data/*.json` only.**
- Do not invent content, claims, protocols, or supplement information.
- Do not pull data from external APIs or the internet.
- Do not use Claude's training knowledge to fill in missing fields.
- If a field is `"Not clearly stated in KB."` — display that string or show `—` in the UI. Never invent a replacement.

### Authoritative sources by screen:
| Screen | JSON source |
|--------|-------------|
| Blood marker ranges | `blood_markers.json` |
| Food statuses | `foods.json` |
| Supplement tiers | `supplements.json` |
| Protocol steps | `protocols.json` |
| Checklist actions | `checklist_items.json` |
| Cooking info | `cooking_guides.json` |
| Shopping data | `shopping_items.json` |
| Features/phases | `app_features.json` |
| Source refs | `sources.json` |
| Tags/taxonomy | `tags.json` |
| Claims | `claims.json` |
| Routines | `routines.json` |

---

## Rule 4: Missing Data Display

When a field is `"Not clearly stated in KB."` or empty:
- Tables: show `—`
- Detail panels: show `Not clearly stated in KB.`
- Never substitute with generic health advice.
- Never interpolate from other fields.

---

## Rule 5: Advanced DHT Protocols

- Protocols 16–24 (`advanced: true`) **must not appear in the default UI.**
- They must not appear in the default Daily Checklist.
- They must not appear in the Protocol Library by default.
- They are only accessible behind an **Advanced Mode toggle**.
- Advanced Mode toggle default: OFF.
- Advanced Mode state stored in Supabase `user_settings.advanced_mode`.
- If Advanced Mode is OFF and a direct URL to an advanced protocol is accessed, redirect to Protocol Library with a message: "Advanced protocols require Advanced Mode."

---

## Rule 6: Phase Boundaries

### Phase 1 — Build
- Dashboard, Knowledge Search, Daily Checklist, Protocol Library (1–15), Protocol Detail, Nutrition & Cooking, Food Detail, Supplements, Bloodwork Reference, Shopping List, Routines, Sources/References, Onboarding (minimal)

### Phase 2 — Do NOT build yet
- Macro & Fuel System
- Bloodwork input/interpretation
- Supplement logging
- Training logging
- Symptom logging
- Experiment logging
- Saved meals
- Meal logs
- Macro logs
- Progress photos
- Personal analytics
- Tracking Hub

### Phase 3 — Do NOT build yet
- Advanced DHT protocols UI
- DUTCH panel deep integration
- WHOOP/Garmin integrations
- AI chat/search
- Bloodwork interpretation engine
- Advanced ML/intelligence layer

---

## Rule 7: No Medical Claims

- Do not add medical disclaimers that weren't in the original design.
- Do not add "consult a doctor" notices to every screen.
- Do not frame the app as medical software.
- Source data is from ebooks. Display source refs as-is.
- The app is a personal knowledge base, not a medical tool.

---

## Rule 8: No External Content

- No internet API calls in the app except: Supabase (auth + data), Google Fonts (loaded once).
- No affiliate links.
- No product purchase links.
- Shopping items: no prices, no URLs, no external links. Field `link` is always empty string.
- No news feeds, no external health content.

---

## Rule 9: Supabase — Required from Phase 1

Supabase must be configured and operational before any user data is written. The following must be set up in Phase 1:

### Auth
- Email/password or magic-link auth
- One user per app (single-operator)
- RLS enabled on all tables

### Phase 1 Tables
| Table | Purpose |
|-------|---------|
| `user_settings` | accent, density, caps, advanced_mode, onboarding_complete, active_goals |
| `checklist_completions` | item_id, user_id, date, completed (boolean) |
| `active_protocols` | protocol_id, user_id, activated_at |
| `shopping_status` | item_id, user_id, bought (boolean), updated_at |
| `notes` | id, user_id, title, body, created_at, updated_at |

### RLS Policy Rule
All tables: `user_id = auth.uid()`. Single operator — no sharing.

### Supabase Storage Buckets (provision now, use later)

All buckets must be **private** (`public: false`). No public bucket access under any circumstance.

| Bucket | Purpose |
|--------|---------|
| `bloodwork` | PDFs/images of blood panels |
| `progress-photos` | Progress photos |
| `backups` | Exported data backups |
| `references` | Uploaded reference files |

**File path convention:** `{user_id}/{file_type}/{filename}`
Example: `a1b2-uuid/bloodwork/panel-jan-2025.pdf`

**Storage RLS policies:** Each bucket must have a policy restricting access so that `(storage.foldername(name))[1] = auth.uid()::text`. Users can only read/write files inside their own `{user_id}/` folder. No cross-user file access. No wildcard public policies.

---

## Rule 10: localStorage — Restricted Use Only

localStorage may ONLY be used for:
- Temporary UI preferences that don't need to sync: sidebar collapsed state, scroll position
- Accent color preference (cosmetic only)
- Density/caps settings (cosmetic only — also sync to Supabase `user_settings`)

localStorage must NOT be used for:
- Checklist completion state
- Shopping bought state
- Active protocols
- Notes
- Any data the user would expect to see on another device

---

## Rule 11: PWA Requirements

The app must be installable as a PWA:
- `manifest.json` with name: TFF, short_name: TFF, theme_color matching `--bg` (#0a0a0c), background_color: #0a0a0c
- Service worker for offline shell
- Icons: 192×192 and 512×512 (dark background, accent-colored TFF wordmark)
- Offline behavior: Show cached static data (JSON), show "Offline — changes will sync" banner for user data operations

---

## Rule 12: Cross-Device Sync

- User must be able to log in on mobile and desktop and see the same state.
- Checklist completions, shopping status, active protocols, notes — all from Supabase.
- Date-keyed completions: one record per item_id + date. Midnight UTC = new day.

---

## Rule 13: Macro & Fuel System — Phase 2 Lock

- The Macro & Fuel System (`feature_7_macro_fuel` in `app_features.json`) is **Phase 2 only**.
- Do not show any macro UI in Phase 1.
- Do not add macro fields to Phase 1 database schema.
- Do not show macro nav item.
- Do not show calorie or macro counts on any Phase 1 screen.
- When Phase 2 arrives: it is a checklist-based macro correction layer, NOT a generic calorie tracker.

---

## Rule 14: No Invented UI

- Do not add screens not defined in APP_SCREENS.md.
- Do not add components not in DESIGN_SYSTEM.md.
- Do not add copy/labels not derived from JSON data or the design system.
- Nav items must match the defined 10-item list exactly.
- No "coming soon" placeholder screens in Phase 1 nav.

---

## Rule 15: Keyboard Navigation (Desktop)

Keys 1–0 navigate to the 10 main screens when focus is not in an input:
```
1 → Dashboard
2 → Knowledge Search
3 → Daily Checklist
4 → Protocol Library
5 → Nutrition & Cooking
6 → Supplements
7 → Bloodwork
8 → Shopping List
9 → Routines
0 → Sources
```
⌘K → opens global search (Knowledge Search screen with focus on search bar).

---

## Rule 16: Responsive Breakpoints

- Desktop: ≥ 768px — sidebar visible, drawer panels for detail
- Mobile: < 768px — sidebar hidden, bottom nav visible, drawers become bottom sheets

No tablet-specific breakpoint needed for Phase 1.

---

## Rule 17: Error Handling

- Supabase errors: catch, log to console, show non-blocking toast notification
- Data load errors: show error state in affected component only (not full page error)
- Offline: detect `navigator.onLine`, show persistent banner, disable write operations gracefully
- Auth errors: redirect to `/login`

---

## Rule 18: Performance

- All JSON data files imported at build time (static — no runtime fetching)
- Supabase queries: only on mount and on user interaction
- No unnecessary re-renders: memoize search results, checklist state
- Images: none in Phase 1 (all UI is text/CSS)
- Fonts: preconnect + preload

---

## Rule 19: Security

- No API keys in client-side code except Supabase anon key (this is by design in Supabase architecture)
- Supabase service key: server-side only (Next.js API routes or Server Components if needed)
- RLS is the security layer — every table must have RLS enabled
- No user data in URL params
- No logging of user health data to analytics
- All Supabase Storage buckets must be `public: false` — no public bucket access
- Storage RLS must restrict by `{user_id}` folder prefix on every bucket
- Auth middleware must protect all app routes — see Rule 20 for correct matcher

---

## Rule 20: Middleware — Route Group Correction

> ⚠️ CRITICAL: The `app/(app)/` folder is a Next.js **route group**. The `(app)` segment does NOT appear in the URL.

**Do NOT use `/app/*` as a middleware matcher. That path does not exist.**

Protected routes (must redirect to `/login` if unauthenticated):
```
/
/search
/checklist
/protocols and /protocols/:path*
/nutrition and /nutrition/:path*
/supplements and /supplements/:path*
/bloodwork
/shopping
/routines
/sources
/onboarding
```

Public routes (middleware must not block):
```
/login
/auth/callback
/_next/* (static assets)
/icons/*
/manifest.json
/sw.js
/favicon.ico
```

Correct middleware matcher pattern:
```typescript
export const config = {
  matcher: [
    '/((?!login|auth|_next/static|_next/image|icons|manifest.json|sw.js|favicon.ico).*)',
  ],
}
```


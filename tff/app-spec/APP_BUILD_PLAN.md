# TFF — App Build Plan
**Version:** v1.0
**Rule:** Execute steps in order. Stop after each step for review. Do not skip ahead.

---

## Step 0 — Project Setup

**Files to create:**
- `package.json` (Next.js 14+, TypeScript, Tailwind)
- `next.config.ts` (PWA plugin, image domains)
- `tailwind.config.ts` (ink color scale, font families)
- `globals.css` (all CSS vars, base classes from DESIGN_SYSTEM.md)
- `public/manifest.json` (PWA manifest)
- `public/sw.js` (service worker shell)
- `.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- `lib/supabase/client.ts` (browser Supabase client)
- `lib/supabase/server.ts` (server Supabase client)

**Dependencies:**
```
next, react, react-dom, typescript
@supabase/supabase-js, @supabase/ssr
tailwindcss, postcss, autoprefixer
next-pwa
lucide-react (icons only)
```

**Validation checks:**
- [ ] `npm run dev` starts without error
- [ ] Tailwind CSS vars resolve correctly in browser
- [ ] Supabase client connects (test with `supabase.auth.getSession()`)
- [ ] PWA manifest loads at `/manifest.json`
- [ ] Google Fonts (Geist + JetBrains Mono) load
- [ ] globals.css: all CSS vars present, all base classes present

**Stop here. Review before Step 1.**

---

## Step 1 — Data Import + Types

**Files to create:**
- `data/sources.json` (copy from package)
- `data/tags.json`
- `data/foods.json`
- `data/supplements.json`
- `data/protocols.json`
- `data/claims.json`
- `data/blood_markers.json`
- `data/routines.json`
- `data/checklist_items.json`
- `data/cooking_guides.json`
- `data/shopping_items.json`
- `data/app_features.json`
- `types/tff.ts` (TypeScript interfaces for all 12 JSON schemas)
- `lib/data.ts` (import all JSONs, export typed constants)

**TypeScript types to define:**
```typescript
Source, Tag, Food, Supplement, Protocol, Claim,
BloodMarker, Routine, ChecklistItem, CookingGuide,
ShoppingItem, AppFeature
```

**Enums to define:**
```typescript
FoodStatus: APPROVED_CORE | APPROVED_CONTEXT | PREP_REQUIRED | AVOID | DEPENDS | NOT_MENTIONED
SupplementTier: TIER_1 | TIER_2 | TIER_3 | OPTIONAL | CONTEXT_DEPENDENT
ClaimType: actionable_protocol | food_rule | lab_interpretation | mechanistic_concept | lifestyle_theory | avoid_caution | advanced_compound | context_dependent
AppUsage: checklist | knowledge_only | protocol | warning | database
BloodPanel: thyroid | sex_hormones | metabolic | lipids | inflammation | micronutrients | liver | kidney | bone_mineral | cbc | dutch
```

**Data sources used:** All 12 JSON files

**Validation checks:**
- [ ] All 12 JSON files import without TypeScript error
- [ ] `lib/data.ts` exports: `FOODS` (23), `SUPPLEMENTS` (37), `PROTOCOLS` (24), `CHECKLIST_ITEMS` (44), `BLOOD_MARKERS` (77), `SHOPPING_ITEMS` (56), `COOKING_GUIDES` (12), `ROUTINES` (11), `CLAIMS` (59), `SOURCES` (6), `TAGS` (51), `APP_FEATURES` (11)
- [ ] `PROTOCOLS.filter(p => p.advanced)` returns exactly 9 items (16–24)
- [ ] `CHECKLIST_ITEMS.length === 44`
- [ ] No TypeScript errors

**Stop here. Review before Step 2.**

---

## Step 2 — Layout + Sidebar + Mobile Nav

**Files to create:**
- `app/layout.tsx` (root layout: fonts, body attrs, providers)
- `app/(app)/layout.tsx` (authenticated app shell: sidebar + topbar + content)
- `components/tff/Sidebar.tsx`
- `components/tff/Topbar.tsx`
- `components/tff/MobileBottomNav.tsx`
- `components/tff/MobileMoreSheet.tsx`
- `components/tff/AppShell.tsx` (composes sidebar + topbar + content area)
- `lib/routes.ts` (route config: id, label, path, keyboard shortcut)
- `hooks/useRoute.ts` (keyboard navigation hook)

**Sidebar spec:**
- 220px fixed left, var(--panel) bg, scan class
- Nav items per routes.ts
- Active state: accent left border + gradient
- Bottom: version micro label

**Topbar spec:**
- ~52px height, var(--panel), border-bottom
- Left: breadcrumb (mono label) + page title
- Right: slot for per-screen actions

**Mobile nav:**
- 4 tabs: Dashboard, Checklist, Search, More
- More → MobileMoreSheet (full remaining nav)
- Bottom safe area padding

**Data sources:** None (layout only)

**Validation checks:**
- [ ] Sidebar renders on desktop (≥768px)
- [ ] Sidebar hidden on mobile (<768px)
- [ ] Bottom nav visible on mobile only
- [ ] Active nav item highlighted correctly
- [ ] Keyboard 1–0 navigates screens
- [ ] More sheet opens/closes correctly
- [ ] Grain overlay visible on body

**Stop here. Review before Step 3.**

---

## Step 3 — Design System Components

**Files to create:**
- `components/tff/Badge.tsx` (status, tier, phase, priority variants)
- `components/tff/Tick.tsx` (checkbox/tick with Supabase write)
- `components/tff/ProgressBar.tsx`
- `components/tff/Drawer.tsx` (right-panel desktop + bottom sheet mobile)
- `components/tff/Card.tsx` (card, card-2, panel surfaces)
- `components/tff/SkeletonRow.tsx`
- `components/tff/EmptyState.tsx`
- `components/tff/ErrorState.tsx`
- `components/tff/Tabs.tsx`
- `components/tff/FilterChips.tsx`
- `components/tff/SectionHeader.tsx` (label class header)
- `components/tff/SourceRef.tsx` (source ref display)
- `components/tff/Toast.tsx` (non-blocking notifications)
- `components/tff/OfflineBanner.tsx`

**Validation checks:**
- [ ] All badge variants render: badge-core, badge-avoid, badge-warn, badge-depends, badge-prep, badge-na
- [ ] Drawer opens right on desktop, slides up from bottom on mobile
- [ ] ProgressBar fills correctly at 0%, 50%, 100%
- [ ] EmptyState + ErrorState render correctly
- [ ] Tabs switch correctly
- [ ] No Tailwind class conflicts with CSS vars

**Stop here. Review before Step 4.**

---

## Step 4 — Supabase Schema + Auth

**Files to create:**
- `supabase/migrations/001_initial_schema.sql` (all Phase 1 tables + RLS)
- `supabase/migrations/002_storage_buckets.sql` (bucket creation)
- `lib/supabase/types.ts` (generated Supabase types)
- `app/login/page.tsx` (magic link / email+password login)
- `app/auth/callback/route.ts` (Supabase auth callback)
- `middleware.ts` (Supabase auth middleware — see route protection note below)

**SQL schema (migration 001):**
```sql
-- user_settings
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  accent text DEFAULT 'toxic',
  density text DEFAULT 'comfortable',
  caps boolean DEFAULT true,
  advanced_mode boolean DEFAULT false,
  onboarding_complete boolean DEFAULT false,
  active_goals text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- checklist_completions
CREATE TABLE checklist_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  item_id text NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id, date)
);

-- active_protocols
CREATE TABLE active_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  protocol_id text NOT NULL,
  activated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, protocol_id)
);

-- shopping_status
CREATE TABLE shopping_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  item_id text NOT NULL,
  bought boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- notes
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text,
  body text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_self" ON user_settings USING (user_id = auth.uid());
CREATE POLICY "checklist_self" ON checklist_completions USING (user_id = auth.uid());
CREATE POLICY "protocols_self" ON active_protocols USING (user_id = auth.uid());
CREATE POLICY "shopping_self" ON shopping_status USING (user_id = auth.uid());
CREATE POLICY "notes_self" ON notes USING (user_id = auth.uid());
```

**Route Protection — middleware.ts**

> ⚠️ IMPORTANT: The `(app)` folder is a Next.js route GROUP only. It does NOT appear in the URL.
> Do NOT use a matcher like `/app/*` — that path does not exist.

Protected routes (redirect to `/login` if unauthenticated):
```
/
/search
/checklist
/protocols
/protocols/:path*
/nutrition
/nutrition/:path*
/supplements
/supplements/:path*
/bloodwork
/shopping
/routines
/sources
/onboarding
```

Public routes (no auth required):
```
/login
/auth/callback
/_next/*
/icons/*
/manifest.json
/sw.js
```

Middleware matcher config:
```typescript
export const config = {
  matcher: [
    '/((?!login|auth|_next/static|_next/image|icons|manifest.json|sw.js|favicon.ico).*)',
  ],
}
```

**Storage Buckets — Private Only**

All 4 storage buckets must be **private** (not public). No bucket should have public read access.

```sql
-- migration 002_storage_buckets.sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('bloodwork',       'bloodwork',       false),
  ('progress-photos', 'progress-photos', false),
  ('backups',         'backups',         false),
  ('references',      'references',      false);

-- Storage RLS policies (restrict by user_id folder)
CREATE POLICY "bloodwork_owner" ON storage.objects
  FOR ALL USING (
    bucket_id = 'bloodwork' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "photos_owner" ON storage.objects
  FOR ALL USING (
    bucket_id = 'progress-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "backups_owner" ON storage.objects
  FOR ALL USING (
    bucket_id = 'backups' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "references_owner" ON storage.objects
  FOR ALL USING (
    bucket_id = 'references' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

File path convention for all uploads: `{user_id}/{file_type}/{filename}`
Example: `a1b2c3-uuid/bloodwork/panel-2024-01.pdf`

**Validation checks:**
- [ ] Login page renders at `/login`
- [ ] Auth redirect works (unauthenticated → `/` redirects to `/login`)
- [ ] `/app/*` path does NOT exist — verify middleware uses correct matcher
- [ ] Magic link / email+password auth flow completes
- [ ] `/auth/callback` is public (no redirect loop)
- [ ] All 5 tables created with RLS
- [ ] All 4 storage buckets created with `public: false`
- [ ] Storage RLS policies in place — user cannot access another user's folder
- [ ] `user_settings` row created on first login

**Stop here. Review before Step 5.**

---

## Step 5 — Dashboard Screen

**Files to create:**
- `app/(app)/page.tsx` (Dashboard route)
- `components/tff/screens/Dashboard.tsx`
- `components/tff/DashboardGreeting.tsx`
- `components/tff/ChecklistProgressCard.tsx`
- `components/tff/ActiveProtocolsCard.tsx`
- `components/tff/QuickChecklist.tsx`
- `components/tff/TodayRoutineCard.tsx`
- `components/tff/SupplementTimingStrip.tsx`
- `components/tff/ShoppingAlertBadge.tsx`
- `hooks/useChecklist.ts` (Supabase checklist state)
- `hooks/useActiveProtocols.ts` (Supabase active protocols)
- `hooks/useShoppingStatus.ts` (Supabase shopping state)

**Data sources:** `checklist_items.json`, `routines.json`, `supplements.json`, Supabase

**Validation checks:**
- [ ] Dashboard loads without error
- [ ] Checklist progress % matches actual completions in Supabase
- [ ] Active protocols list reflects Supabase state
- [ ] Quick checklist shows only `priority: critical` items
- [ ] Supplement timing strip groups by time_of_day
- [ ] Completing checklist item → Supabase write → progress updates
- [ ] Loading skeleton shows during Supabase fetch
- [ ] Mobile layout single-column, no sidebar

**Stop here. Review before Step 6.**

---

## Step 6 — Knowledge Search Screen

**Files to create:**
- `app/(app)/search/page.tsx`
- `components/tff/screens/Search.tsx`
- `components/tff/SearchBar.tsx`
- `components/tff/SearchResultGroup.tsx`
- `components/tff/SearchResultRow.tsx`
- `components/tff/SearchDetailDrawer.tsx`
- `lib/search.ts` (search logic across all JSON files)

**Data sources:** All JSON files (client-side only)

**Search logic:**
- Debounce: 150ms
- Match on: name, purpose/mechanism/why, description/claim fields
- Group results by: Foods, Supplements, Protocols, Claims, Blood Markers
- Sort: exact name match first, then partial

**Validation checks:**
- [ ] Search returns foods on food query
- [ ] Search returns supplements on supplement query
- [ ] SearchDetailDrawer opens on result click (desktop right, mobile bottom sheet)
- [ ] All fields from matched JSON record displayed
- [ ] Empty query → empty results, no error
- [ ] No results → "Not found in KB." message
- [ ] Filter chips restrict by type correctly

**Stop here. Review before Step 7.**

---

## Step 7 — Food, Supplement + Cooking Screens

**Files to create:**
- `app/(app)/nutrition/page.tsx`
- `app/(app)/nutrition/[id]/page.tsx` (Food Detail)
- `app/(app)/supplements/page.tsx`
- `app/(app)/supplements/[id]/page.tsx`
- `components/tff/screens/Nutrition.tsx`
- `components/tff/screens/Supplements.tsx`
- `components/tff/FoodTable.tsx`
- `components/tff/FoodDetailDrawer.tsx`
- `components/tff/CookingGuideCard.tsx`
- `components/tff/SupplementTable.tsx`
- `components/tff/SupplementDetailDrawer.tsx`

**Data sources:** `foods.json`, `cooking_guides.json`, `supplements.json`

**Validation checks:**
- [ ] Food status badges render correctly for all 6 statuses
- [ ] Food filter chips filter correctly
- [ ] FoodDetailDrawer shows all JSON fields, no invented content
- [ ] AVOID foods: avoid_reason displayed in danger style
- [ ] Cooking guides: all 12 render, no invented content
- [ ] Supplement tier badges render for all 5 tiers
- [ ] Supplement cautions render as warning-styled list
- [ ] "My Stack" tab shows empty state if no active protocols
- [ ] Mobile: drawers become bottom sheets

**Stop here. Review before Step 8.**

---

## Step 8 — Protocol Library + Detail

**Files to create:**
- `app/(app)/protocols/page.tsx`
- `app/(app)/protocols/[id]/page.tsx`
- `components/tff/screens/Protocols.tsx`
- `components/tff/ProtocolCard.tsx`
- `components/tff/ProtocolDetail.tsx`
- `hooks/useActiveProtocols.ts` (if not already from Step 5)

**Data sources:** `protocols.json`, `checklist_items.json`, Supabase `active_protocols`

**Validation checks:**
- [ ] Only protocols 1–15 shown by default
- [ ] Protocols 16–24 invisible when Advanced Mode OFF
- [ ] Advanced Mode toggle visible, works, persists to Supabase
- [ ] Protocol steps render as numbered list
- [ ] Cautions render in warning style
- [ ] Source refs render correctly
- [ ] "Add to Active Protocols" writes to Supabase
- [ ] Category filter tabs work correctly
- [ ] Mobile: tap card → navigate to `/protocols/[id]`

**Stop here. Review before Step 9.**

---

## Step 9 — Daily Checklist Screen

**Files to create:**
- `app/(app)/checklist/page.tsx`
- `components/tff/screens/Checklist.tsx`
- `components/tff/ChecklistSection.tsx`
- `components/tff/ChecklistItem.tsx`
- `components/tff/CompletionBar.tsx`
- `components/tff/StreakCounter.tsx`
- `components/tff/FrequencyFilter.tsx`

**Data sources:** `checklist_items.json`, Supabase `checklist_completions`, `active_protocols`

**Validation checks:**
- [ ] All 44 checklist items render (when All filter active)
- [ ] Items grouped correctly by time_of_day
- [ ] Frequency filter (Today/Training/Rest/Weekly) works
- [ ] Tick → Supabase write → UI updates without full reload
- [ ] Priority: critical items have accent dot indicator
- [ ] Linked protocol chip tappable → Protocol Detail
- [ ] Advanced Mode OFF → zero protocols 16–24 visible
- [ ] Completion bar = (completed today / total today) × 100
- [ ] New day (UTC midnight) → fresh state

**Stop here. Review before Step 10.**

---

## Step 10 — Bloodwork Reference + Shopping List + Routines

**Files to create:**
- `app/(app)/bloodwork/page.tsx`
- `app/(app)/shopping/page.tsx`
- `app/(app)/routines/page.tsx`
- `app/(app)/sources/page.tsx`
- `components/tff/screens/Bloodwork.tsx`
- `components/tff/screens/Shopping.tsx`
- `components/tff/screens/Routines.tsx`
- `components/tff/screens/Sources.tsx`
- `components/tff/BloodworkPanel.tsx`
- `components/tff/MarkerRow.tsx`
- `components/tff/MarkerDetailDrawer.tsx`
- `components/tff/ShoppingTable.tsx`
- `components/tff/ShoppingRow.tsx`
- `components/tff/RoutineDetail.tsx`
- `components/tff/SourceCard.tsx`

**Data sources:** `blood_markers.json`, `shopping_items.json`, `routines.json`, `sources.json`, Supabase `shopping_status`

**Validation checks:**
- [ ] All 11 panels selectable, correct markers per panel
- [ ] DUTCH markers show Phase 2/3 badge
- [ ] MarkerDetailDrawer shows high_means, low_means, why_it_matters
- [ ] Shopping tick → Supabase write → persists across reload
- [ ] No prices shown in shopping (all fields empty/not-stated)
- [ ] No external links in shopping
- [ ] All 11 routines render with sections + items
- [ ] All 6 sources render with title, shorthand, notes
- [ ] Mobile layouts correct

**Stop here. Review before Step 11.**

---

## Step 11 — Onboarding

**Files to create:**
- `app/(app)/onboarding/page.tsx`
- `components/tff/screens/Onboarding.tsx`
- Step components: `OnboardingWelcome`, `OnboardingGoals`, `OnboardingFirstProtocol`

**Data sources:** `tags.json` (goal category), `protocols.json` (priority=critical, checklist_ready=true), Supabase `user_settings`

**Validation checks:**
- [ ] Shown to new users (onboarding_complete=false)
- [ ] Step 1: welcome text, no invented claims
- [ ] Step 2: goal tags from tags.json category=goal only
- [ ] Step 3: protocol selector from protocols 1–15, checklist_ready=true
- [ ] Completion → sets onboarding_complete=true in Supabase
- [ ] Skip always available
- [ ] After onboarding → redirect to Dashboard

**Stop here. Review before Step 12.**

---

## Step 12 — Polish + QA

**Tasks:**
- [ ] Audit all screens: no VILLAIN.OS text visible
- [ ] Audit all screens: TFF name correct everywhere
- [ ] Verify all data is from JSON only — no invented content
- [ ] Verify protocols 16–24 invisible in default state
- [ ] Verify Macro & Fuel System has zero UI presence
- [ ] Test cross-device sync: complete checklist item on desktop, verify on mobile
- [ ] Test PWA install on iOS Safari + Android Chrome
- [ ] Test offline behavior: cached static data shows, Supabase writes fail gracefully
- [ ] Keyboard navigation test: 1–0 keys, ⌘K
- [ ] Verify all 6 food status badges render correctly
- [ ] Verify all 5 supplement tier badges render correctly
- [ ] Verify all drawer opens (desktop right, mobile bottom sheet)
- [ ] Verify all empty states
- [ ] Verify all loading states
- [ ] Verify all error states
- [ ] Verify RLS: user can only see their own data
- [ ] Deploy to Vercel
- [ ] Test production build: PWA installable from Vercel URL

**Stop. App is Phase 1 complete.**

# TFF — File Structure
**Framework:** Next.js 14+ App Router (TypeScript)
**Version:** v1.0

```
tff/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, body, providers
│   ├── login/
│   │   └── page.tsx                  # Login screen (magic link / email+password)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # Supabase auth callback handler
│   ├── onboarding/
│   │   └── page.tsx                  # Onboarding flow (new users)
│   └── (app)/                        # Authenticated route group
│       ├── layout.tsx                # App shell: sidebar + topbar + content
│       ├── page.tsx                  # Dashboard (/)
│       ├── search/
│       │   └── page.tsx              # Knowledge Search
│       ├── checklist/
│       │   └── page.tsx              # Daily Checklist
│       ├── protocols/
│       │   ├── page.tsx              # Protocol Library
│       │   └── [id]/
│       │       └── page.tsx          # Protocol Detail
│       ├── nutrition/
│       │   ├── page.tsx              # Nutrition & Cooking
│       │   └── [id]/
│       │       └── page.tsx          # Food Detail
│       ├── supplements/
│       │   ├── page.tsx              # Supplements
│       │   └── [id]/
│       │       └── page.tsx          # Supplement Detail
│       ├── bloodwork/
│       │   └── page.tsx              # Bloodwork Reference
│       ├── shopping/
│       │   └── page.tsx              # Shopping List
│       ├── routines/
│       │   └── page.tsx              # Routines
│       └── sources/
│           └── page.tsx              # Sources / References
│
├── components/
│   ├── tff/                          # TFF-specific components
│   │   ├── AppShell.tsx              # Composes sidebar + topbar + content
│   │   ├── Sidebar.tsx               # 220px left nav (desktop)
│   │   ├── Topbar.tsx                # Breadcrumb + title + right slot
│   │   ├── MobileBottomNav.tsx       # 4-tab mobile nav
│   │   ├── MobileMoreSheet.tsx       # Remaining nav items sheet
│   │   ├── Badge.tsx                 # Status / tier / phase / priority badges
│   │   ├── Tick.tsx                  # Checkbox with Supabase write
│   │   ├── ProgressBar.tsx           # Accent-filled progress bar
│   │   ├── Drawer.tsx                # Right panel (desktop) / bottom sheet (mobile)
│   │   ├── Card.tsx                  # Card surface variants
│   │   ├── Tabs.tsx                  # Tab bar component
│   │   ├── FilterChips.tsx           # Filter chip row
│   │   ├── SectionHeader.tsx         # Label-class section header
│   │   ├── SourceRef.tsx             # Source reference display
│   │   ├── Toast.tsx                 # Non-blocking toast notifications
│   │   ├── OfflineBanner.tsx         # Offline detection banner
│   │   ├── SkeletonRow.tsx           # Loading skeleton
│   │   ├── EmptyState.tsx            # Empty state component
│   │   ├── ErrorState.tsx            # Error state component
│   │   ├── SearchBar.tsx             # Global search input
│   │   ├── SearchResultGroup.tsx     # Result group with header
│   │   ├── SearchResultRow.tsx       # Individual search result
│   │   ├── SearchDetailDrawer.tsx    # Search result full detail
│   │   ├── DashboardGreeting.tsx     # Operator greeting + date
│   │   ├── ChecklistProgressCard.tsx # Today's completion bar
│   │   ├── ActiveProtocolsCard.tsx   # Active protocols list
│   │   ├── QuickChecklist.tsx        # 3 critical items on dashboard
│   │   ├── TodayRoutineCard.tsx      # Today's routine reference
│   │   ├── SupplementTimingStrip.tsx # Supplements by time_of_day
│   │   ├── ShoppingAlertBadge.tsx    # Unmet shopping items count
│   │   ├── ChecklistSection.tsx      # Time-of-day grouped section
│   │   ├── ChecklistItem.tsx         # Individual checklist item + tick
│   │   ├── CompletionBar.tsx         # Checklist % complete bar
│   │   ├── StreakCounter.tsx         # Consecutive completion days
│   │   ├── FrequencyFilter.tsx       # Today/Training/Rest/Weekly tabs
│   │   ├── ProtocolCard.tsx          # Protocol library card
│   │   ├── ProtocolDetail.tsx        # Full protocol detail panel
│   │   ├── FoodTable.tsx             # Foods table with status badges
│   │   ├── FoodDetailDrawer.tsx      # Food full detail
│   │   ├── CookingGuideCard.tsx      # Cooking guide card
│   │   ├── SupplementTable.tsx       # Supplements table with tier badges
│   │   ├── SupplementDetailDrawer.tsx # Supplement full detail
│   │   ├── BloodworkPanel.tsx        # Panel selector + markers table
│   │   ├── MarkerRow.tsx             # Blood marker table row
│   │   ├── MarkerDetailDrawer.tsx    # Marker full detail
│   │   ├── ShoppingTable.tsx         # Shopping list table
│   │   ├── ShoppingRow.tsx           # Shopping item row + tick
│   │   ├── RoutineDetail.tsx         # Routine sections + items
│   │   ├── SourceCard.tsx            # Source/reference card
│   │   └── screens/                  # Screen-level components
│   │       ├── Dashboard.tsx
│   │       ├── Search.tsx
│   │       ├── Checklist.tsx
│   │       ├── Protocols.tsx
│   │       ├── Nutrition.tsx
│   │       ├── Supplements.tsx
│   │       ├── Bloodwork.tsx
│   │       ├── Shopping.tsx
│   │       ├── Routines.tsx
│   │       ├── Sources.tsx
│   │       └── Onboarding.tsx
│   │
│   └── ui/                           # Pure UI primitives (no TFF logic)
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Divider.tsx
│
├── data/                             # Static JSON knowledge base (copied from package)
│   ├── sources.json
│   ├── tags.json
│   ├── foods.json
│   ├── supplements.json
│   ├── protocols.json
│   ├── claims.json
│   ├── blood_markers.json
│   ├── routines.json
│   ├── checklist_items.json
│   ├── cooking_guides.json
│   ├── shopping_items.json
│   └── app_features.json
│
├── lib/
│   ├── data.ts                       # Import + export all typed JSON constants
│   ├── search.ts                     # Client-side search logic
│   ├── utils.ts                      # Shared utility functions
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       ├── server.ts                 # Server Supabase client
│       └── types.ts                  # Generated Supabase DB types
│
├── hooks/
│   ├── useChecklist.ts               # Supabase checklist state + mutations
│   ├── useActiveProtocols.ts         # Supabase active protocols
│   ├── useShoppingStatus.ts          # Supabase shopping bought state
│   ├── useUserSettings.ts            # Supabase user settings
│   ├── useNotes.ts                   # Supabase notes
│   └── useRoute.ts                   # Keyboard navigation hook
│
├── types/
│   └── tff.ts                        # TypeScript types for all 12 JSON schemas + enums
│
├── design/                           # Design documentation (reference only)
│   ├── DESIGN_SYSTEM.md
│   ├── APP_SCREENS.md
│   └── IMPLEMENTATION_RULES.md
│
├── app-spec/                         # Build specification (reference only)
│   ├── MVP_SCOPE.md
│   ├── APP_BUILD_PLAN.md
│   ├── FILE_STRUCTURE.md
│   ├── DATA_USAGE_MAP.md
│   └── PHASE_PLAN.md
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Phase 1 tables + RLS
│       └── 002_storage_buckets.sql   # Storage bucket creation
│
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   ├── icons/
│   │   ├── icon-192.png              # PWA icon 192×192
│   │   └── icon-512.png              # PWA icon 512×512
│   └── fonts/                        # (if self-hosting fonts later)
│
├── middleware.ts                     # Supabase auth middleware — protects /, /search, /checklist, etc.
│                                     # NOTE: (app) is a route group only — /app/* does NOT exist in URLs
├── tailwind.config.ts                # Ink color scale + font families
├── next.config.ts                    # PWA plugin + config
├── tsconfig.json
├── package.json
└── .env.local                        # Supabase URL + anon key (gitignored)
```

---

## Key Conventions

### Route Group — (app)

> ⚠️ `app/(app)/` is a Next.js **route group** folder. The `(app)` segment does NOT appear in the URL.
>
> - `app/(app)/page.tsx` → URL: `/`
> - `app/(app)/checklist/page.tsx` → URL: `/checklist`
> - `app/(app)/protocols/[id]/page.tsx` → URL: `/protocols/some-id`
>
> **Do NOT use `/app/*` as a middleware matcher or route prefix. It does not exist.**

Protected routes (all require auth via middleware):
`/`, `/search`, `/checklist`, `/protocols`, `/nutrition`, `/supplements`, `/bloodwork`, `/shopping`, `/routines`, `/sources`, `/onboarding`

Public routes (no auth): `/login`, `/auth/callback`, static assets

### Import paths
Use `@/` alias for root:
```typescript
import { FOODS } from '@/lib/data'
import { Badge } from '@/components/tff/Badge'
import type { Food } from '@/types/tff'
```

### Data access pattern
```typescript
// Always import from lib/data.ts — never directly from JSON
import { FOODS, SUPPLEMENTS, PROTOCOLS } from '@/lib/data'

// Filter advanced protocols
const standardProtocols = PROTOCOLS.filter(p => !p.advanced)
const advancedProtocols = PROTOCOLS.filter(p => p.advanced)
```

### Supabase pattern
```typescript
// Client components: use client.ts
import { createClient } from '@/lib/supabase/client'

// Server components / API routes: use server.ts
import { createClient } from '@/lib/supabase/server'
```

### Component naming
- All TFF components: PascalCase, in `components/tff/`
- Screen components: in `components/tff/screens/`
- Pure UI: in `components/ui/`
- No default exports except page.tsx files (use named exports for components)

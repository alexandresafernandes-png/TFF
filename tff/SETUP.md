# TFF — Setup Guide

## Phase 1 (current)

No environment variables are required. The app runs fully local-first:

- All content is bundled as static JSON at build time
- Checklist, shopping, and routine state persists in `localStorage`
- No network requests, no auth, no Supabase

```bash
npm install
npm run dev
```

That's it.

---

## Phase 1.5 — Supabase Readiness

When you're ready to wire up Supabase, create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Until these are set:
- All Phase 1 pages work normally (static data, localStorage)
- The `/auth/callback` route redirects to `/login?error=supabase_not_configured`
- The Supabase client throws a descriptive error if called (not a cryptic "undefined is not a URL")
- Settings page shows which env vars are missing

When both vars are set, `hasSupabaseConfig` (from `lib/supabase/status.ts`) returns `true` and the client/server helpers become usable.

---

## Phase 2 — Personal Tracking

Requires Supabase to be configured. Adds:
- User auth (email/password via Supabase Auth)
- Cloud-synced checklist state, personal notes, protocol tracking
- Macro and bloodwork history
- Cross-device sync

---

## Key files

| Path | Purpose |
|------|---------|
| `lib/supabase/status.ts` | `hasSupabaseConfig` / `missingSupabaseEnvNames` — safe to import anywhere |
| `lib/supabase/client.ts` | Browser Supabase client — throws if env vars missing |
| `lib/supabase/server.ts` | Server Supabase client — throws if env vars missing |
| `app/auth/callback/route.ts` | Auth callback — guards against missing env vars |
| `middleware.ts` | Passthrough — does not enforce auth in Phase 1 |
| `lib/supabase/middleware.ts` | Dormant auth session helper — not called yet |

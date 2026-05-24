# TFF — Setup Guide

## Running locally

```bash
npm install
npm run dev
```

Requires Supabase env vars (see Phase 1.5 section below). Without them, all app routes redirect to `/login?error=supabase_not_configured`.

---

## Phase 1.5 — Supabase + Auth UI

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and copy the Project URL and anon key from **Project Settings → API**.

### 2. Set environment variables

**Local development** — create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel** — add the same two vars under **Project Settings → Environment Variables**. Apply to Production, Preview, and Development environments.

### 3. Configure auth redirect URLs in Supabase

In **Authentication → URL Configuration**, add your callback URLs to the **Redirect URLs** allowlist:

```
# Local development
http://localhost:3000/auth/callback

# Vercel preview deployments (replace YOUR_PROJECT with your Vercel project name)
https://YOUR_PROJECT.vercel.app/auth/callback

# Production domain (once you have one)
https://your-domain.com/auth/callback
```

**Primary auth flow:** user enters email + password → `signInWithPassword` → on success, redirected to `/`.

**Magic link (fallback):** available via "Send magic link instead" on the login page. User submits email → Supabase sends a link → link opens `/auth/callback?code=…` → app exchanges code for session → user is redirected to `/`.

To set a password for your Supabase user: go to **Authentication → Users** in the Supabase dashboard, find the user, and use **Send password reset** or set the password directly via the Supabase Auth API.

### 4. What works without env vars

Until the vars are set:
- All Phase 1 pages work normally (static data, localStorage)
- `/login` shows a local-first notice with the form disabled
- `/auth/callback` redirects cleanly to `/login?error=supabase_not_configured`
- The Supabase client helpers throw a descriptive error if called accidentally
- Settings page shows which env vars are missing

When both vars are present, `hasSupabaseConfig` (from `lib/supabase/status.ts`) becomes `true` and the login form activates.

### 5. Route protection — active

All routes inside `app/(app)/` (dashboard, checklist, shopping, routines, protocols, nutrition, supplements, bloodwork, search, sources, settings) require a signed-in Supabase session.

The auth boundary lives in `app/(app)/layout.tsx`. On each request it calls `supabase.auth.getUser()` server-side — if no valid session exists, the user is redirected to `/login`.

Public routes (no session required):
- `/login` — email + password form (magic link available as fallback)
- `/auth/callback` — session exchange after magic link click

**Middleware is intentionally not used for auth.** A prior middleware-based approach caused Vercel Edge runtime issues. The layout-level check is the authoritative auth boundary.

If Supabase env vars are not set, all app routes redirect to `/login?error=supabase_not_configured`.

---

## Phase 1.5 — Final Status

Phase 1.5 is complete. The app is a fully private personal tool requiring authentication.

| Feature | Status |
|---------|--------|
| Supabase auth (email + password, magic link fallback) | ✅ Active |
| Route protection (`app/(app)/layout.tsx`) | ✅ Active |
| Cloud sync — checklist, shopping, routines, protocols, notes | ✅ Active |
| Dashboard personal summary | ✅ Active |
| Auth/session UX (login, settings, sign out) | ✅ Polished |
| PWA manifest | ✅ Correct |
| Mobile layout | ✅ Polished |
| localStorage fallback (all synced pages) | ✅ Always active |
| Middleware auth | ❌ Intentionally not used |

---

## Phase 2 — Personal Tracking

Requires Supabase to be configured (already done). Adds:
- User-specific data (macros, bloodwork history entries)
- Routine streaks and scheduling
- Dashboard trend tracking and live charts
- Enhanced personal health tracking with cloud-persisted profiles

---

## Key files

| Path | Purpose |
|------|---------|
| `lib/supabase/status.ts` | `hasSupabaseConfig` / `missingSupabaseEnvNames` — safe to import in server or client |
| `lib/supabase/client.ts` | Browser Supabase client — throws if env vars missing |
| `lib/supabase/server.ts` | Server Supabase client — throws if env vars missing |
| `lib/supabase/auth-actions.ts` | `signOut()` utility — no-op if Supabase not configured |
| `components/tff/SignOutButton.tsx` | Client sign-out button — shown only when Supabase is configured |
| `app/login/page.tsx` | Login page — email + password (primary); magic link (secondary toggle) |
| `app/auth/callback/route.ts` | Auth callback — guards against missing env vars |
| `app/(app)/layout.tsx` | Auth boundary — redirects to `/login` if no session; uses `supabase.auth.getUser()` server-side |
| `middleware.ts` | Passthrough — intentionally does not enforce auth (Edge runtime incompatibility) |
| `lib/supabase/middleware.ts` | Dormant session helper — not used (auth is in layout, not middleware) |

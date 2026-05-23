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

The magic link flow: user submits email → Supabase sends a link → link opens `/auth/callback?code=…` → app exchanges code for session → user is redirected to `/`.

### 4. What works without env vars

Until the vars are set:
- All Phase 1 pages work normally (static data, localStorage)
- `/login` shows a local-first notice with the form disabled
- `/auth/callback` redirects cleanly to `/login?error=supabase_not_configured`
- The Supabase client helpers throw a descriptive error if called accidentally
- Settings page shows which env vars are missing

When both vars are present, `hasSupabaseConfig` (from `lib/supabase/status.ts`) becomes `true` and the login form activates.

### 5. Auth is prepared, not enforced

Phase 1.5 wires up the auth UI and utilities but does **not** protect any routes. All app pages remain accessible without a session. Route protection is a Phase 2 concern.

---

## Phase 2 — Personal Tracking

Requires Supabase to be configured. Adds:
- Route protection and session enforcement
- Cloud-synced checklist state, personal notes, protocol tracking
- User-specific data (macros, bloodwork history)
- Active protocol tracking and routine streaks
- Cross-device sync via Supabase

---

## Key files

| Path | Purpose |
|------|---------|
| `lib/supabase/status.ts` | `hasSupabaseConfig` / `missingSupabaseEnvNames` — safe to import in server or client |
| `lib/supabase/client.ts` | Browser Supabase client — throws if env vars missing |
| `lib/supabase/server.ts` | Server Supabase client — throws if env vars missing |
| `lib/supabase/auth-actions.ts` | `signOut()` utility — no-op if Supabase not configured |
| `components/tff/SignOutButton.tsx` | Client sign-out button — shown only when Supabase is configured |
| `app/login/page.tsx` | Login page — two states: local-first notice vs. active magic-link form |
| `app/auth/callback/route.ts` | Auth callback — guards against missing env vars |
| `middleware.ts` | Passthrough — does not enforce auth in Phase 1 or 1.5 |
| `lib/supabase/middleware.ts` | Dormant auth session helper — not called yet (Phase 2) |

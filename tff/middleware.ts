// NOTE: Next.js 16+ prefers "proxy.ts" — rename when ready.
// middleware.ts still works and routing is intact.
// See: https://nextjs.org/docs/messages/middleware-to-proxy

import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Correct matcher per IMPLEMENTATION_RULES.md Rule 20:
// Do NOT match /app/* — the (app) route group does not appear in URLs.
// Protected routes are: /, /search, /checklist, /protocols, /nutrition,
//   /supplements, /bloodwork, /shopping, /routines, /sources, /onboarding
// Public routes: /login, /auth, /_next, /icons, /manifest.json, /sw.js, /favicon.ico
export const config = {
  matcher: [
    "/((?!login|auth|_next/static|_next/image|icons|manifest.json|sw.js|favicon.ico|icon-192.png|icon-512.png).*)",
  ],
}

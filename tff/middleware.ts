// Temporary edge-safe middleware to unblock Vercel deployment.
// Auth/session protection is disabled here for now.
// Later we can re-add route protection in an Edge-compatible way.

import { NextResponse } from "next/server"

export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!login|auth|_next/static|_next/image|icons|manifest.json|sw.js|favicon.ico|icon-192.png|icon-512.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

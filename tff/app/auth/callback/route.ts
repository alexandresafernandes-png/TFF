import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { hasSupabaseConfig } from "@/lib/supabase/status"

// Supabase can redirect to the callback with either:
//   ?code=...                       (PKCE — modern default)
//   ?token_hash=...&type=magiclink  (token-hash — older templates / some dashboard settings)
//   ?error=...&error_description=…  (Supabase-side failure — expired, rate-limited, etc.)
// We handle all three.

type EmailOtpType =
  | "magiclink"
  | "email"
  | "recovery"
  | "invite"
  | "email_change"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code      = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type      = searchParams.get("type")
  const next      = searchParams.get("next") ?? "/"
  const sbError   = searchParams.get("error")

  console.log(
    "[auth/callback] hit —",
    "code:", !!code,
    "| token_hash:", !!tokenHash,
    "| type:", type ?? "none",
    "| sb_error:", sbError ?? "none",
  )

  if (!hasSupabaseConfig) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  // Supabase itself returned an error (expired link, rate limit, etc.)
  if (sbError) {
    console.log("[auth/callback] supabase-side error:", sbError)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&reason=provider_error`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Build the success redirect first so Supabase can write auth cookies directly
  // onto the response object — cookies set this way are guaranteed to appear as
  // Set-Cookie headers, which is not always true when writing via cookies() from
  // next/headers and returning a separate NextResponse.redirect().
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        // Read the code_verifier and existing session cookies from the request
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write the new session tokens directly onto the outgoing response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // ── Path A: PKCE code ──────────────────────────────────────────────────────
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    console.log(
      "[auth/callback] exchangeCodeForSession:",
      exchangeError ? `FAILED — ${exchangeError.message}` : "OK",
    )

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed&reason=exchange_failed`,
      )
    }

    // Verify the session is actually present before redirecting
    const { data: { user } } = await supabase.auth.getUser()
    console.log("[auth/callback] getUser after exchange:", !!user)

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=session_not_persisted`)
    }

    return response
  }

  // ── Path B: token_hash (older Supabase email templates) ───────────────────
  if (tokenHash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })
    console.log(
      "[auth/callback] verifyOtp:",
      otpError ? `FAILED — ${otpError.message}` : "OK",
    )

    if (otpError) {
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed&reason=verify_failed`,
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    console.log("[auth/callback] getUser after verifyOtp:", !!user)

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=session_not_persisted`)
    }

    return response
  }

  // ── No valid auth params ───────────────────────────────────────────────────
  console.log("[auth/callback] missing code and token_hash")
  return NextResponse.redirect(`${origin}/login?error=missing_auth_code`)
}

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { hasSupabaseConfig } from "@/lib/supabase/status"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  console.log("[auth/callback] hit — code exists:", !!code)

  if (!hasSupabaseConfig) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  if (!code) {
    console.log("[auth/callback] no code — redirecting to error")
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Build the success response first so auth cookies are set directly on it.
  // Relying on cookies() from next/headers + NextResponse.redirect() does not
  // reliably attach set-cookie headers in all Next.js versions — this explicit
  // approach writes the cookies onto the response object and is always correct.
  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        // Read existing cookies from the incoming request
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write new cookies directly onto the outgoing response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  console.log(
    "[auth/callback] exchange success:", !error,
    error ? `— ${error.message}` : ""
  )

  if (!error) {
    return response
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!hasSupabaseConfig) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // TODO (Step 1): upsert profile here if not using DB trigger
      // const { data: { user } } = await supabase.auth.getUser()
      // if (user) {
      //   await supabase.from("profiles").upsert({
      //     id: user.id,
      //     email: user.email ?? null,
      //   }, { onConflict: "id" })
      // }
      // See also: supabase/migrations/001_initial_tff_schema.sql — OPTION A (trigger)
      // Recommendation: prefer OPTION A (DB trigger in migration 002)

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

import { redirect } from "next/navigation"
import { AppShell } from "@/components/tff/AppShell"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig) {
    redirect("/login?error=supabase_not_configured")
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <AppShell>{children}</AppShell>
}

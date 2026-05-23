import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig) return
  const supabase = createClient()
  await supabase.auth.signOut()
}

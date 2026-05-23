"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "@/lib/supabase/auth-actions"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    router.push("/login")
  }

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={handleSignOut}
      disabled={loading}
      style={{ color: "var(--text-3)" }}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  )
}

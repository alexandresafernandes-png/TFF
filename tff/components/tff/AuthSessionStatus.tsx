"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SignOutButton } from "@/components/tff/SignOutButton"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionState = "loading" | "local" | "unauthenticated" | "authenticated"

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Displays the current auth/session state for the account section in Settings.
 * Safely handles all three modes: no Supabase config, signed out, signed in.
 * Never crashes — all Supabase calls are wrapped with error handling.
 */
export function AuthSessionStatus() {
  const [state, setState] = useState<SessionState>("loading")
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setState("local")
      return
    }
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user?.email) {
          setEmail(session.user.email)
          setState("authenticated")
        } else {
          setState("unauthenticated")
        }
      })
      .catch(() => setState("unauthenticated"))
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <TffCard>
        <TffCardHeader>Account</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
          Checking session…
        </p>
      </TffCard>
    )
  }

  // ── No Supabase config ─────────────────────────────────────────────────────

  if (state === "local") {
    return (
      <TffCard>
        <TffCardHeader>Account</TffCardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              lineHeight: 1.5,
            }}
          >
            Running in local-first mode. No cloud sync configured.
          </p>
          <TffBadge variant="na">Local only</TffBadge>
        </div>
      </TffCard>
    )
  }

  // ── Not signed in ──────────────────────────────────────────────────────────

  if (state === "unauthenticated") {
    return (
      <TffCard>
        <TffCardHeader>Account</TffCardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ marginBottom: 8 }}>
              <TffBadge variant="na">Not signed in</TffBadge>
            </div>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-3)",
                lineHeight: 1.55,
                maxWidth: 380,
              }}
            >
              Sign in to sync your checklist, shopping, routines, protocols, and
              notes across devices. Local data is safe and merges automatically on
              first sign-in.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary" style={{ flexShrink: 0 }}>
            Sign In
          </Link>
        </div>
      </TffCard>
    )
  }

  // ── Signed in ──────────────────────────────────────────────────────────────

  return (
    <TffCard>
      <TffCardHeader>Account</TffCardHeader>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text)",
              fontWeight: 500,
            }}
          >
            {email}
          </p>
          <TffBadge variant="core" dot>
            Cloud sync active
          </TffBadge>
        </div>
        <SignOutButton />
      </div>
    </TffCard>
  )
}

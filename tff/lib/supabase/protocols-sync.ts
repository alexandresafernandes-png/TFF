import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProtocolStatus = "inactive" | "active" | "paused" | "completed"

export interface ProtocolTrackingRow {
  protocol_id: string
  status: ProtocolStatus
  started_at: string | null
  ended_at: string | null
  notes: string | null
}

type FetchResult =
  | { ok: true; data: ProtocolTrackingRow[] }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all protocol_tracking rows for the current user.
 * Protocol tracking is not date-scoped — one row per protocol per user.
 */
export async function fetchProtocolTracking(): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("protocol_tracking")
      .select("protocol_id, status, started_at, ended_at, notes")
      .eq("user_id", session.user.id)

    if (error) throw error
    return { ok: true, data: (data ?? []) as ProtocolTrackingRow[] }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Upsert ────────────────────────────────────────────────────────────────────

/**
 * Upserts a single protocol tracking row. Fire-and-forget — all errors are
 * swallowed; localStorage remains the source of truth.
 */
export async function upsertProtocolTracking(
  protocolId: string,
  entry: {
    status: ProtocolStatus
    started_at: string | null
    ended_at: string | null
    notes: string
  }
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("protocol_tracking").upsert(
      {
        user_id: session.user.id,
        protocol_id: protocolId,
        status: entry.status,
        started_at: entry.started_at ?? null,
        ended_at: entry.ended_at ?? null,
        notes: entry.notes || null,
      },
      { onConflict: "user_id,protocol_id" }
    )
  } catch {
    // Fail silently — localStorage is authoritative
  }
}

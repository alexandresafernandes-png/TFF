import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoutineStatus = "inactive" | "active" | "done"

export interface RoutineCompletionRow {
  routine_id: string
  status: RoutineStatus
}

type FetchResult =
  | { ok: true; data: RoutineCompletionRow[] }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Date helper ───────────────────────────────────────────────────────────────

function todayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetches today's routine_completions for the current user.
 * Returns only rows where status is "active" or "done" — inactive rows are
 * typically absent from the table rather than stored explicitly.
 */
export async function fetchRoutineCompletions(): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("routine_completions")
      .select("routine_id, status")
      .eq("user_id", session.user.id)
      .eq("completion_date", todayLocalDate())
      .in("status", ["active", "done"])

    if (error) throw error
    return { ok: true, data: (data ?? []) as RoutineCompletionRow[] }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Upsert ────────────────────────────────────────────────────────────────────

/**
 * Upserts a single routine completion row for today. Fire-and-forget —
 * all errors are swallowed; localStorage remains the source of truth.
 */
export async function upsertRoutineCompletion(
  routineId: string,
  status: RoutineStatus
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("routine_completions").upsert(
      {
        user_id: session.user.id,
        routine_id: routineId,
        completion_date: todayLocalDate(),
        status,
      },
      { onConflict: "user_id,routine_id,completion_date" }
    )
  } catch {
    // Fail silently — localStorage is authoritative
  }
}

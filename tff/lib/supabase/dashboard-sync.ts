import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Date helper ───────────────────────────────────────────────────────────────

function todayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardNote {
  id: string
  area: string
  entity_id: string | null
  body: string
  updated_at: string
}

export interface DashboardData {
  checklist: {
    completedToday: number
  }
  protocols: {
    active: number
    paused: number
    completed: number
  }
  routines: {
    active: number
    done: number
  }
  shopping: {
    retainerChecked: number
    upgradeChecked: number
  }
  recentNotes: DashboardNote[]
}

type FetchResult =
  | { ok: true; data: DashboardData }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeRows(res: PromiseSettledResult<unknown>): Record<string, unknown>[] {
  if (res.status !== "fulfilled") return []
  const v = res.value as { data: unknown; error: unknown } | null
  if (!v || v.error) return []
  return (v.data as Record<string, unknown>[] | null) ?? []
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a personal summary for the dashboard. All sub-queries run in
 * parallel via Promise.allSettled — a single sub-query failure does not
 * cascade. Returns { ok: false, reason: "unauthenticated" } when Supabase is
 * not configured or no session is active.
 */
export async function fetchDashboardData(): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }

  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const today = todayLocalDate()
    const uid = session.user.id

    const [checklistRes, protocolsRes, routinesRes, shoppingRes, notesRes] =
      await Promise.allSettled([
        supabase
          .from("checklist_completions")
          .select("checklist_item_id")
          .eq("user_id", uid)
          .eq("completed_date", today)
          .eq("completed", true),
        supabase
          .from("protocol_tracking")
          .select("protocol_id, status")
          .eq("user_id", uid)
          .in("status", ["active", "paused", "completed"]),
        supabase
          .from("routine_completions")
          .select("routine_id, status")
          .eq("user_id", uid)
          .eq("completion_date", today)
          .in("status", ["active", "done"]),
        supabase
          .from("shopping_item_status")
          .select("mode, status")
          .eq("user_id", uid)
          .neq("status", "unchecked"),
        supabase
          .from("user_notes")
          .select("id, area, entity_id, body, updated_at")
          .eq("user_id", uid)
          .eq("is_archived", false)
          .order("updated_at", { ascending: false })
          .limit(3),
      ])

    const checklist = safeRows(checklistRes)
    const protocols = safeRows(protocolsRes)
    const routines  = safeRows(routinesRes)
    const shopping  = safeRows(shoppingRes)
    const notes     = safeRows(notesRes)

    return {
      ok: true,
      data: {
        checklist: {
          completedToday: checklist.length,
        },
        protocols: {
          active:    protocols.filter((r) => r.status === "active").length,
          paused:    protocols.filter((r) => r.status === "paused").length,
          completed: protocols.filter((r) => r.status === "completed").length,
        },
        routines: {
          active: routines.filter((r) => r.status === "active").length,
          done:   routines.filter((r) => r.status === "done").length,
        },
        shopping: {
          retainerChecked: shopping.filter((r) => r.mode === "retainer").length,
          upgradeChecked:  shopping.filter((r) => r.mode === "upgrade").length,
        },
        recentNotes: notes as unknown as DashboardNote[],
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

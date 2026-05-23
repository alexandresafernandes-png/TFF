import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Date helper ───────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time (not UTC). */
export function todayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RemoteCompletion {
  checklist_item_id: string
  item_source: string
  completed: boolean
}

export interface RemoteCustomItem {
  id: string
  client_id: string | null
  title: string
  description: string | null
  category: string | null
  priority: string | null
  sort_order: number
  created_at: string
}

export interface ChecklistSyncData {
  completions: RemoteCompletion[]
  customItems: RemoteCustomItem[]
}

type FetchResult =
  | { ok: true; data: ChecklistSyncData }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Initial data fetch ────────────────────────────────────────────────────────

/**
 * Fetches today's completions and all non-archived custom items for the
 * current user. Returns an explicit reason so the caller can set sync status
 * correctly without guessing whether null means "not logged in" or "error".
 */
export async function fetchChecklistData(): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const today = todayLocalDate()

    const [completionsRes, customRes] = await Promise.all([
      supabase
        .from("checklist_completions")
        .select("checklist_item_id, item_source, completed")
        .eq("user_id", session.user.id)
        .eq("completed_date", today),
      supabase
        .from("checklist_custom_items")
        .select("id, client_id, title, description, category, priority, sort_order, created_at")
        .eq("user_id", session.user.id)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true }),
    ])

    if (completionsRes.error) throw completionsRes.error
    if (customRes.error) throw customRes.error

    return {
      ok: true,
      data: {
        completions: (completionsRes.data ?? []) as RemoteCompletion[],
        customItems: (customRes.data ?? []) as RemoteCustomItem[],
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Completion upsert ─────────────────────────────────────────────────────────

/**
 * Upserts a single completion row for today. Fire-and-forget — all errors are
 * swallowed; localStorage remains the source of truth.
 */
export async function upsertCompletion(
  itemId: string,
  itemSource: "app" | "custom",
  completed: boolean
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("checklist_completions").upsert(
      {
        user_id: session.user.id,
        checklist_item_id: itemId,
        completed_date: todayLocalDate(),
        item_source: itemSource,
        completed,
      },
      { onConflict: "user_id,checklist_item_id,completed_date" }
    )
  } catch {
    // Fail silently — localStorage is authoritative
  }
}

// ── Custom item mutations ─────────────────────────────────────────────────────

/**
 * Creates a cloud custom item. Passes the local c_xxx ID as client_id so the
 * app can match remote rows back to local items on future syncs.
 * Returns the new Supabase UUID, or null if creation failed or user is not logged in.
 */
export async function createCloudCustomItem(payload: {
  clientId: string
  title: string
  description: string
  category: string
  priority: string
  sortOrder: number
}): Promise<string | null> {
  if (!hasSupabaseConfig) return null
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null
    const { data, error } = await supabase
      .from("checklist_custom_items")
      .insert({
        user_id: session.user.id,
        client_id: payload.clientId,
        title: payload.title,
        description: payload.description || null,
        category: payload.category || null,
        priority: payload.priority,
        sort_order: payload.sortOrder,
      })
      .select("id")
      .single()
    if (error) throw error
    return (data as { id: string } | null)?.id ?? null
  } catch {
    return null
  }
}

/** Updates a cloud custom item by its Supabase UUID. Fire-and-forget. */
export async function updateCloudCustomItem(
  cloudId: string,
  update: { title: string; description: string; category: string; priority: string }
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase
      .from("checklist_custom_items")
      .update({
        title: update.title,
        description: update.description || null,
        category: update.category || null,
        priority: update.priority,
      })
      .eq("id", cloudId)
      .eq("user_id", session.user.id)
  } catch {
    // Fail silently
  }
}

/** Soft-deletes a cloud custom item by setting is_archived = true. Fire-and-forget. */
export async function archiveCloudCustomItem(cloudId: string): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase
      .from("checklist_custom_items")
      .update({ is_archived: true })
      .eq("id", cloudId)
      .eq("user_id", session.user.id)
  } catch {
    // Fail silently
  }
}

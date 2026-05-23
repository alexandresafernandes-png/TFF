import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ShoppingStatusRow {
  mode: "retainer" | "upgrade"
  item_id: string
  status: string
}

export interface ShoppingCustomRow {
  id: string
  client_id: string | null
  mode: "retainer" | "upgrade"
  name: string
  category: string | null
  priority: string | null
  frequency: string | null
  cost_tier: string | null
  purpose: string | null
  note: string | null
  created_at: string
}

export interface ShoppingSyncData {
  statuses: ShoppingStatusRow[]
  customItems: ShoppingCustomRow[]
}

type FetchResult =
  | { ok: true; data: ShoppingSyncData }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Initial data fetch ────────────────────────────────────────────────────────

/**
 * Fetches all shopping item statuses and non-archived custom items for the
 * current user. Returns an explicit reason so callers can set sync status
 * correctly without guessing whether null means not-logged-in or an error.
 */
export async function fetchShoppingData(): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const [statusRes, customRes] = await Promise.all([
      supabase
        .from("shopping_item_status")
        .select("mode, item_id, status")
        .eq("user_id", session.user.id),
      supabase
        .from("shopping_custom_items")
        .select("id, client_id, mode, name, category, priority, frequency, cost_tier, purpose, note, created_at")
        .eq("user_id", session.user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: true }),
    ])

    if (statusRes.error) throw statusRes.error
    if (customRes.error) throw customRes.error

    return {
      ok: true,
      data: {
        statuses: (statusRes.data ?? []) as ShoppingStatusRow[],
        customItems: (customRes.data ?? []) as ShoppingCustomRow[],
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Status upsert ─────────────────────────────────────────────────────────────

/**
 * Upserts a single status row. Fire-and-forget — all errors are swallowed;
 * localStorage remains the source of truth.
 */
export async function upsertShoppingStatus(
  mode: "retainer" | "upgrade",
  itemId: string,
  status: string
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("shopping_item_status").upsert(
      { user_id: session.user.id, mode, item_id: itemId, status },
      { onConflict: "user_id,mode,item_id" }
    )
  } catch {
    // Fail silently — localStorage is authoritative
  }
}

// ── Custom item mutations ─────────────────────────────────────────────────────

/**
 * Creates a cloud custom shopping item. Passes the local ID as client_id so
 * the app can match remote rows back to local items on future syncs.
 * Returns the new Supabase UUID, or null if creation failed or user is not logged in.
 */
export async function createCloudShoppingItem(payload: {
  clientId: string
  mode: "retainer" | "upgrade"
  name: string
  category: string
  priority: string
  frequency?: string
  costTier?: string
  purpose?: string
  note?: string
}): Promise<string | null> {
  if (!hasSupabaseConfig) return null
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null
    const { data, error } = await supabase
      .from("shopping_custom_items")
      .insert({
        user_id: session.user.id,
        client_id: payload.clientId,
        mode: payload.mode,
        name: payload.name,
        category: payload.category || null,
        priority: payload.priority || null,
        frequency: payload.frequency || null,
        cost_tier: payload.costTier || null,
        purpose: payload.purpose || null,
        note: payload.note || null,
      })
      .select("id")
      .single()
    if (error) throw error
    return (data as { id: string } | null)?.id ?? null
  } catch {
    return null
  }
}

/** Soft-deletes a cloud custom shopping item by setting is_archived = true. Fire-and-forget. */
export async function archiveCloudShoppingItem(cloudId: string): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase
      .from("shopping_custom_items")
      .update({ is_archived: true })
      .eq("id", cloudId)
      .eq("user_id", session.user.id)
  } catch {
    // Fail silently
  }
}

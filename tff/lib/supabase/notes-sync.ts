import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RemoteNote {
  id: string
  area: string
  entity_id: string | null
  title: string | null
  body: string
  created_at: string
  updated_at: string
}

type FetchResult =
  | { ok: true; data: RemoteNote[] }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all non-archived notes for a given area, optionally scoped to an
 * entity. Requires migration 005 (adds is_archived column).
 */
export async function fetchUserNotes(
  area: string,
  entityId?: string
): Promise<FetchResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    let query = supabase
      .from("user_notes")
      .select("id, area, entity_id, title, body, created_at, updated_at")
      .eq("user_id", session.user.id)
      .eq("area", area)
      .eq("is_archived", false)
      .order("created_at", { ascending: true })

    if (entityId !== undefined) {
      query = query.eq("entity_id", entityId)
    }

    const { data, error } = await query
    if (error) throw error
    return { ok: true, data: (data ?? []) as RemoteNote[] }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Creates a cloud note. Returns the new Supabase UUID, or null on failure.
 */
export async function createUserNote(payload: {
  area: string
  entityId?: string
  title?: string
  body: string
}): Promise<string | null> {
  if (!hasSupabaseConfig) return null
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null
    const { data, error } = await supabase
      .from("user_notes")
      .insert({
        user_id: session.user.id,
        area: payload.area,
        entity_id: payload.entityId ?? null,
        title: payload.title || null,
        body: payload.body,
      })
      .select("id")
      .single()
    if (error) throw error
    return (data as { id: string } | null)?.id ?? null
  } catch {
    return null
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

/** Updates the body (and optionally title) of a cloud note. Fire-and-forget. */
export async function updateUserNote(
  cloudId: string,
  patch: { title?: string; body: string }
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase
      .from("user_notes")
      .update({ body: patch.body, title: patch.title || null })
      .eq("id", cloudId)
      .eq("user_id", session.user.id)
  } catch {
    // Fail silently
  }
}

// ── Archive ───────────────────────────────────────────────────────────────────

/** Soft-deletes a cloud note by setting is_archived = true. Fire-and-forget. */
export async function archiveUserNote(cloudId: string): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return
    await supabase
      .from("user_notes")
      .update({ is_archived: true })
      .eq("id", cloudId)
      .eq("user_id", session.user.id)
  } catch {
    // Fail silently
  }
}

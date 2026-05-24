import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimingBlock =
  | "morning"
  | "midday"
  | "pre_workout"
  | "evening"
  | "night"
  | "custom"

export interface SupplementScheduleItem {
  id:           string
  name:         string
  dose_text:    string | null
  timing_block: TimingBlock
  instructions: string | null
  is_active:    boolean
  sort_order:   number
  source:       string
  created_at:   string
}

export interface SupplementScheduleCompletion {
  id:              string
  item_id:         string
  completion_date: string
  completed:       boolean
  completed_at:    string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const TIMING_BLOCK_ORDER: TimingBlock[] = [
  "morning",
  "midday",
  "pre_workout",
  "evening",
  "night",
  "custom",
]

export const TIMING_BLOCK_LABEL: Record<TimingBlock, string> = {
  morning:     "Morning",
  midday:      "Midday",
  pre_workout: "Pre-Workout",
  evening:     "Evening",
  night:       "Night",
  custom:      "Custom",
}

// ── Date helper ───────────────────────────────────────────────────────────────

export function getTodayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function groupItemsByTimingBlock(
  items: SupplementScheduleItem[],
): Map<TimingBlock, SupplementScheduleItem[]> {
  const map = new Map<TimingBlock, SupplementScheduleItem[]>()
  for (const block of TIMING_BLOCK_ORDER) map.set(block, [])
  for (const item of items) {
    if (!item.is_active) continue
    map.get(item.timing_block)?.push(item)
  }
  return map
}

export function calculateSupplementAdherence(
  items: SupplementScheduleItem[],
  completedIds: Set<string>,
): { completed: number; active: number; adherencePct: number } {
  const active = items.filter((i) => i.is_active).length
  const completed = items.filter((i) => i.is_active && completedIds.has(i.id)).length
  const adherencePct = active > 0 ? Math.round((completed / active) * 100) : 0
  return { completed, active, adherencePct }
}

// ── Row normalisers ───────────────────────────────────────────────────────────

function rowToItem(row: Record<string, unknown>): SupplementScheduleItem {
  return {
    id:           String(row.id ?? ""),
    name:         String(row.name ?? ""),
    dose_text:    row.dose_text != null ? String(row.dose_text) : null,
    timing_block: (row.timing_block as TimingBlock) ?? "custom",
    instructions: row.instructions != null ? String(row.instructions) : null,
    is_active:    Boolean(row.is_active ?? true),
    sort_order:   Number(row.sort_order ?? 0),
    source:       String(row.source ?? "manual"),
    created_at:   String(row.created_at ?? ""),
  }
}

function rowToCompletion(row: Record<string, unknown>): SupplementScheduleCompletion {
  return {
    id:              String(row.id ?? ""),
    item_id:         String(row.item_id ?? ""),
    completion_date: String(row.completion_date ?? ""),
    completed:       Boolean(row.completed ?? false),
    completed_at:    row.completed_at != null ? String(row.completed_at) : null,
  }
}

// ── Result types ──────────────────────────────────────────────────────────────

type ItemsResult =
  | { ok: true;  items: SupplementScheduleItem[] }
  | { ok: false; reason: "unauthenticated" | "error" }

type ItemResult =
  | { ok: true;  item: SupplementScheduleItem }
  | { ok: false; reason: "unauthenticated" | "error" }

type CompletionsResult =
  | { ok: true;  completions: SupplementScheduleCompletion[] }
  | { ok: false; reason: "unauthenticated" | "error" }

type VoidResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Fetch items ───────────────────────────────────────────────────────────────

export async function fetchSupplementScheduleItems(): Promise<ItemsResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("supplement_schedule_items")
      .select("id, name, dose_text, timing_block, instructions, is_active, sort_order, source, created_at")
      .eq("user_id", session.user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) return { ok: false, reason: "error" }
    const rows = (data as unknown as Record<string, unknown>[]) ?? []
    return { ok: true, items: rows.map(rowToItem) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Create item ───────────────────────────────────────────────────────────────

export async function createSupplementScheduleItem(
  item: Omit<SupplementScheduleItem, "id" | "created_at">,
): Promise<ItemResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("supplement_schedule_items")
      .insert({
        user_id:      session.user.id,
        name:         item.name,
        dose_text:    item.dose_text,
        timing_block: item.timing_block,
        instructions: item.instructions,
        is_active:    item.is_active,
        sort_order:   item.sort_order,
        source:       item.source,
      })
      .select("id, name, dose_text, timing_block, instructions, is_active, sort_order, source, created_at")
      .single()

    if (error) return { ok: false, reason: "error" }
    return { ok: true, item: rowToItem(data as unknown as Record<string, unknown>) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Update item ───────────────────────────────────────────────────────────────

export async function updateSupplementScheduleItem(
  id: string,
  updates: Partial<Pick<SupplementScheduleItem, "name" | "dose_text" | "timing_block" | "instructions" | "sort_order">>,
): Promise<VoidResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase
      .from("supplement_schedule_items")
      .update(updates)
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Set active / deactivate ───────────────────────────────────────────────────

export async function setSupplementScheduleItemActive(
  id: string,
  isActive: boolean,
): Promise<VoidResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase
      .from("supplement_schedule_items")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Fetch completions for date ────────────────────────────────────────────────

export async function fetchSupplementCompletionsForDate(
  date: string,
): Promise<CompletionsResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("supplement_schedule_completions")
      .select("id, item_id, completion_date, completed, completed_at")
      .eq("user_id", session.user.id)
      .eq("completion_date", date)

    if (error) return { ok: false, reason: "error" }
    const rows = (data as unknown as Record<string, unknown>[]) ?? []
    return { ok: true, completions: rows.map(rowToCompletion) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Upsert completion ─────────────────────────────────────────────────────────

export async function upsertSupplementCompletion(
  itemId: string,
  date: string,
  completed: boolean,
): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from("supplement_schedule_completions").upsert(
      {
        user_id:         session.user.id,
        item_id:         itemId,
        completion_date: date,
        completed,
        completed_at:    completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,item_id,completion_date" },
    )
  } catch {
    // Fire-and-forget — localStorage is authoritative
  }
}

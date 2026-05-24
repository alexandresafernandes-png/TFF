import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Constants ─────────────────────────────────────────────────────────────────

// Denominator matches actual checklist item count (7 groups: 3+3+4+3+2+3+3)
export const CHECKLIST_TOTAL = 21

// A day counts toward streak if score meets this threshold
export const STREAK_THRESHOLD = 70

// ── Date helpers ──────────────────────────────────────────────────────────────

export function todayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

// Returns the date string N days before the given YYYY-MM-DD string (local).
function dateAgo(todayStr: string, daysAgo: number): string {
  const [y, m, d] = todayStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() - daysAgo)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProgressNote {
  id: string
  area: string
  entity_id: string | null
  body: string
  updated_at: string
}

export interface ProgressData {
  checklist: {
    completedToday: number
  }
  routines: {
    doneToday: number
    activeToday: number
  }
  protocols: {
    active: number
    paused: number
    completed: number
  }
  notesToday: ProgressNote[]
}

export interface ProgressSnapshot {
  id: string
  progress_date: string
  score: number
  checklist_completed: number
  checklist_total: number
  routines_completed: number
  routines_active: number
  protocols_active: number
  protocols_completed: number
  notes_count: number
}

export interface DayEntry {
  date: string       // YYYY-MM-DD
  score: number | null
  success: boolean
}

export interface StreakData {
  currentStreak: number
  bestStreak: number
  averageLast7: number
  daysTracked: number
  last7: DayEntry[]
}

type ProgressResult =
  | { ok: true; data: ProgressData }
  | { ok: false; reason: "unauthenticated" | "error" }

type SnapshotsResult =
  | { ok: true; snapshots: ProgressSnapshot[] }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Score formula ─────────────────────────────────────────────────────────────

export function calcScore(data: ProgressData): number {
  const checklistPct = Math.min(data.checklist.completedToday / CHECKLIST_TOTAL, 1)
  const checklistPts = Math.round(checklistPct * 70)
  const routinePts   = Math.min(data.routines.doneToday * 5, 20)
  const protocolPts  = data.protocols.active > 0 ? 10 : 0
  return checklistPts + routinePts + protocolPts
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeRows(res: PromiseSettledResult<unknown>): Record<string, unknown>[] {
  if (res.status !== "fulfilled") return []
  const v = res.value as { data: unknown; error: unknown } | null
  if (!v || v.error) return []
  return (v.data as Record<string, unknown>[] | null) ?? []
}

// ── Fetch today's raw progress data ──────────────────────────────────────────

/**
 * Fetches today's progress data from existing sync tables.
 * All sub-queries run in parallel via Promise.allSettled — a single failure
 * does not cascade. Notes are scoped to items updated today (local date).
 */
export async function fetchProgressData(): Promise<ProgressResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }

  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const today = todayLocalDate()
    const uid = session.user.id

    const [checklistRes, routinesRes, protocolsRes, notesRes] =
      await Promise.allSettled([
        supabase
          .from("checklist_completions")
          .select("checklist_item_id")
          .eq("user_id", uid)
          .eq("completed_date", today)
          .eq("completed", true),
        supabase
          .from("routine_completions")
          .select("routine_id, status")
          .eq("user_id", uid)
          .eq("completion_date", today)
          .in("status", ["active", "done"]),
        supabase
          .from("protocol_tracking")
          .select("protocol_id, status")
          .eq("user_id", uid)
          .in("status", ["active", "paused", "completed"]),
        supabase
          .from("user_notes")
          .select("id, area, entity_id, body, updated_at")
          .eq("user_id", uid)
          .eq("is_archived", false)
          .gte("updated_at", `${today}T00:00:00`)
          .order("updated_at", { ascending: false })
          .limit(5),
      ])

    const checklist = safeRows(checklistRes)
    const routines  = safeRows(routinesRes)
    const protocols = safeRows(protocolsRes)
    const notes     = safeRows(notesRes)

    return {
      ok: true,
      data: {
        checklist: {
          completedToday: checklist.length,
        },
        routines: {
          doneToday:   routines.filter((r) => r.status === "done").length,
          activeToday: routines.filter((r) => r.status === "active").length,
        },
        protocols: {
          active:    protocols.filter((r) => r.status === "active").length,
          paused:    protocols.filter((r) => r.status === "paused").length,
          completed: protocols.filter((r) => r.status === "completed").length,
        },
        notesToday: notes as unknown as ProgressNote[],
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Upsert today's snapshot ───────────────────────────────────────────────────

/**
 * Writes (or updates) today's progress snapshot.
 * Safe to call on every /progress load — unique(user_id, progress_date) prevents
 * duplicates. Errors are swallowed; this is fire-and-forget.
 */
export async function upsertDailyProgressSnapshot(data: ProgressData): Promise<void> {
  if (!hasSupabaseConfig) return
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from("daily_progress_snapshots").upsert(
      {
        user_id:             session.user.id,
        progress_date:       todayLocalDate(),
        score:               calcScore(data),
        checklist_completed: data.checklist.completedToday,
        checklist_total:     CHECKLIST_TOTAL,
        routines_completed:  data.routines.doneToday,
        routines_active:     data.routines.activeToday,
        protocols_active:    data.protocols.active,
        protocols_completed: data.protocols.completed,
        notes_count:         data.notesToday.length,
        metrics:             {},
      },
      { onConflict: "user_id,progress_date" }
    )
  } catch {
    // Silently ignore — snapshot is best-effort
  }
}

// ── Fetch recent snapshots ────────────────────────────────────────────────────

export async function fetchRecentProgressSnapshots(days = 14): Promise<SnapshotsResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const today = todayLocalDate()
    const since = dateAgo(today, days - 1)

    const { data, error } = await supabase
      .from("daily_progress_snapshots")
      .select(
        "id, progress_date, score, checklist_completed, checklist_total, " +
        "routines_completed, routines_active, protocols_active, protocols_completed, notes_count"
      )
      .eq("user_id", session.user.id)
      .gte("progress_date", since)
      .order("progress_date", { ascending: false })

    if (error) return { ok: false, reason: "error" }
    type SnapshotRow = Record<string, unknown>
    const rows = (data ?? []) as unknown as SnapshotRow[]
    const snapshots: ProgressSnapshot[] = rows.map((row) => ({
      id:                  String(row.id ?? ""),
      progress_date:       String(row.progress_date ?? ""),
      score:               Number(row.score ?? 0),
      checklist_completed: Number(row.checklist_completed ?? 0),
      checklist_total:     Number(row.checklist_total ?? 0),
      routines_completed:  Number(row.routines_completed ?? 0),
      routines_active:     Number(row.routines_active ?? 0),
      protocols_active:    Number(row.protocols_active ?? 0),
      protocols_completed: Number(row.protocols_completed ?? 0),
      notes_count:         Number(row.notes_count ?? 0),
    }))
    return { ok: true, snapshots }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Streak calculation ────────────────────────────────────────────────────────

/**
 * Pure function — no I/O. Derives streak stats and last-7-days history
 * from a list of snapshots (any order). todayStr must be a YYYY-MM-DD
 * local date string matching todayLocalDate().
 */
export function calculateStreaks(snapshots: ProgressSnapshot[], todayStr: string): StreakData {
  const byDate = new Map(snapshots.map((s) => [s.progress_date, s]))

  // ── Last 7 days (oldest → newest) ─────────────────────────────────────────
  const last7: DayEntry[] = []
  for (let i = 6; i >= 0; i--) {
    const dateStr = dateAgo(todayStr, i)
    const snap    = byDate.get(dateStr)
    last7.push({
      date:    dateStr,
      score:   snap ? snap.score : null,
      success: snap ? snap.score >= STREAK_THRESHOLD : false,
    })
  }

  // ── Average over last 7 days that have data ────────────────────────────────
  const last7WithData = last7.filter((d) => d.score !== null)
  const averageLast7  =
    last7WithData.length > 0
      ? Math.round(
          last7WithData.reduce((sum, d) => sum + (d.score ?? 0), 0) /
            last7WithData.length
        )
      : 0

  // ── Current streak (going back from today) ─────────────────────────────────
  // If today is already a success, count from today.
  // If today is not yet a success (mid-day, or no snapshot), count from yesterday —
  // this preserves the streak while the day is still in progress.
  const todaySuccess = (byDate.get(todayStr)?.score ?? -1) >= STREAK_THRESHOLD
  const streakStart  = todaySuccess ? 0 : 1

  let currentStreak = 0
  for (let i = streakStart; ; i++) {
    const snap = byDate.get(dateAgo(todayStr, i))
    if (!snap || snap.score < STREAK_THRESHOLD) break
    currentStreak++
  }

  // ── Best streak (over all fetched history) ─────────────────────────────────
  const sorted = [...snapshots].sort((a, b) =>
    a.progress_date.localeCompare(b.progress_date)
  )
  let bestStreak  = 0
  let runStreak   = 0
  let prevDate: string | null = null

  for (const snap of sorted) {
    if (snap.score >= STREAK_THRESHOLD) {
      if (prevDate === null) {
        runStreak = 1
      } else {
        // Compare dates as UTC midnight — diff is exact for calendar days
        const diffMs   = new Date(snap.progress_date).getTime() - new Date(prevDate).getTime()
        const diffDays = Math.round(diffMs / 86_400_000)
        runStreak      = diffDays === 1 ? runStreak + 1 : 1
      }
      if (runStreak > bestStreak) bestStreak = runStreak
      prevDate = snap.progress_date
    } else {
      runStreak = 0
      prevDate  = null
    }
  }

  return {
    currentStreak,
    bestStreak,
    averageLast7,
    daysTracked: snapshots.length,
    last7,
  }
}

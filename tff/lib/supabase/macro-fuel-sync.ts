import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type DayType = "training" | "rest"

export interface MacroTarget {
  calories:  number | null
  protein_g: number | null
  carbs_g:   number | null
  fat_g:     number | null
}

export interface MacroProfile {
  training: MacroTarget
  rest:     MacroTarget
}

export interface FuelMeal {
  id:        string
  name:      string
  calories:  number | null
  protein_g: number | null
  carbs_g:   number | null
  fat_g:     number | null
  time?:     string
  notes?:    string
}

export interface FuelTotals {
  calories:  number
  protein_g: number
  carbs_g:   number
  fat_g:     number
}

export interface DailyFuelLog {
  log_date:         string
  day_type:         DayType
  meals:            FuelMeal[]
  totals:           FuelTotals
  compliance_score: number | null
  notes:            string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const EMPTY_TARGET: MacroTarget = {
  calories:  null,
  protein_g: null,
  carbs_g:   null,
  fat_g:     null,
}

export const EMPTY_PROFILE: MacroProfile = {
  training: { ...EMPTY_TARGET },
  rest:     { ...EMPTY_TARGET },
}

export const EMPTY_TOTALS: FuelTotals = {
  calories:  0,
  protein_g: 0,
  carbs_g:   0,
  fat_g:     0,
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getTodayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

export function getMacroTargetForDay(profile: MacroProfile, dayType: DayType): MacroTarget {
  return dayType === "training" ? profile.training : profile.rest
}

export function calculateFuelTotals(meals: FuelMeal[]): FuelTotals {
  return meals.reduce(
    (acc, m) => ({
      calories:  acc.calories  + (m.calories  ?? 0),
      protein_g: acc.protein_g + (m.protein_g ?? 0),
      carbs_g:   acc.carbs_g   + (m.carbs_g   ?? 0),
      fat_g:     acc.fat_g     + (m.fat_g     ?? 0),
    }),
    { ...EMPTY_TOTALS },
  )
}

// Returns null if any target field is missing — caller should show "Set targets to unlock".
// Formula: sum of (weight × max(0, 1 – (|actual – target| / target) × 2))
// Weights: Calories=30, Protein=30, Carbs=20, Fat=20
export function calculateMacroCompliance(
  totals: FuelTotals,
  target: MacroTarget,
): number | null {
  if (
    target.calories  === null ||
    target.protein_g === null ||
    target.carbs_g   === null ||
    target.fat_g     === null
  ) return null

  const score = (actual: number, tgt: number, weight: number): number =>
    weight * Math.max(0, 1 - (Math.abs(actual - tgt) / tgt) * 2)

  const total =
    score(totals.calories,  target.calories,  30) +
    score(totals.protein_g, target.protein_g, 30) +
    score(totals.carbs_g,   target.carbs_g,   20) +
    score(totals.fat_g,     target.fat_g,     20)

  return Math.round(total)
}

// ── DB row → typed profile ────────────────────────────────────────────────────

function rowToProfile(row: Record<string, unknown>): MacroProfile {
  const n = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))
  return {
    training: {
      calories:  n(row.training_calories),
      protein_g: n(row.training_protein_g),
      carbs_g:   n(row.training_carbs_g),
      fat_g:     n(row.training_fat_g),
    },
    rest: {
      calories:  n(row.rest_calories),
      protein_g: n(row.rest_protein_g),
      carbs_g:   n(row.rest_carbs_g),
      fat_g:     n(row.rest_fat_g),
    },
  }
}

// ── Macro profile async helpers ───────────────────────────────────────────────

type ProfileResult =
  | { ok: true;  profile: MacroProfile }
  | { ok: false; reason: "unauthenticated" | "not_found" | "error" }

type UpsertResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error" }

export async function fetchMacroProfile(): Promise<ProfileResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("macro_profiles")
      .select(
        "training_calories, training_protein_g, training_carbs_g, training_fat_g, " +
        "rest_calories, rest_protein_g, rest_carbs_g, rest_fat_g"
      )
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (error) return { ok: false, reason: "error" }
    if (!data)  return { ok: false, reason: "not_found" }

    return { ok: true, profile: rowToProfile(data as Record<string, unknown>) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

export async function upsertMacroProfile(profile: MacroProfile): Promise<UpsertResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase.from("macro_profiles").upsert(
      {
        user_id:             session.user.id,
        training_calories:   profile.training.calories,
        training_protein_g:  profile.training.protein_g,
        training_carbs_g:    profile.training.carbs_g,
        training_fat_g:      profile.training.fat_g,
        rest_calories:       profile.rest.calories,
        rest_protein_g:      profile.rest.protein_g,
        rest_carbs_g:        profile.rest.carbs_g,
        rest_fat_g:          profile.rest.fat_g,
      },
      { onConflict: "user_id" }
    )

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Daily fuel log async helpers ──────────────────────────────────────────────

type FuelLogResult =
  | { ok: true;  log: DailyFuelLog }
  | { ok: false; reason: "unauthenticated" | "not_found" | "error" }

type UpsertLogResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error" }

export async function fetchDailyFuelLog(date: string): Promise<FuelLogResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data, error } = await supabase
      .from("daily_fuel_logs")
      .select("log_date, day_type, meals, totals, compliance_score, notes")
      .eq("user_id", session.user.id)
      .eq("log_date", date)
      .maybeSingle()

    if (error) return { ok: false, reason: "error" }
    if (!data)  return { ok: false, reason: "not_found" }

    const row = data as Record<string, unknown>
    return {
      ok:  true,
      log: {
        log_date:         String(row.log_date ?? date),
        day_type:         (row.day_type as DayType) ?? "training",
        meals:            (row.meals as FuelMeal[]) ?? [],
        totals:           (row.totals as FuelTotals) ?? { ...EMPTY_TOTALS },
        compliance_score: row.compliance_score !== null && row.compliance_score !== undefined
          ? Number(row.compliance_score)
          : null,
        notes:            (row.notes as string | null) ?? null,
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

export async function upsertDailyFuelLog(
  date: string,
  log: Omit<DailyFuelLog, "log_date">,
): Promise<UpsertLogResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase.from("daily_fuel_logs").upsert(
      {
        user_id:          session.user.id,
        log_date:         date,
        day_type:         log.day_type,
        meals:            log.meals,
        totals:           log.totals,
        compliance_score: log.compliance_score ?? 0,
        notes:            log.notes ?? null,
      },
      { onConflict: "user_id,log_date" }
    )

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

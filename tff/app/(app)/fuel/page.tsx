"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import {
  fetchMacroProfile,
  upsertMacroProfile,
  fetchDailyFuelLog,
  upsertDailyFuelLog,
  getTodayLocalDate,
  getMacroTargetForDay,
  calculateFuelTotals,
  calculateMacroCompliance,
  EMPTY_PROFILE,
  type DayType,
  type MacroProfile,
  type FuelMeal,
  type FuelTotals,
} from "@/lib/supabase/macro-fuel-sync"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileForm {
  training_calories:  string
  training_protein_g: string
  training_carbs_g:   string
  training_fat_g:     string
  rest_calories:      string
  rest_protein_g:     string
  rest_carbs_g:       string
  rest_fat_g:         string
}

interface AddMealForm {
  name:      string
  calories:  string
  protein_g: string
  carbs_g:   string
  fat_g:     string
  time:      string
  notes:     string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function profileToForm(p: MacroProfile): ProfileForm {
  const s = (v: number | null) => (v === null ? "" : String(v))
  return {
    training_calories:  s(p.training.calories),
    training_protein_g: s(p.training.protein_g),
    training_carbs_g:   s(p.training.carbs_g),
    training_fat_g:     s(p.training.fat_g),
    rest_calories:      s(p.rest.calories),
    rest_protein_g:     s(p.rest.protein_g),
    rest_carbs_g:       s(p.rest.carbs_g),
    rest_fat_g:         s(p.rest.fat_g),
  }
}

function formToProfile(f: ProfileForm): MacroProfile {
  const n = (v: string) => (v.trim() === "" ? null : Number(v))
  return {
    training: {
      calories:  n(f.training_calories),
      protein_g: n(f.training_protein_g),
      carbs_g:   n(f.training_carbs_g),
      fat_g:     n(f.training_fat_g),
    },
    rest: {
      calories:  n(f.rest_calories),
      protein_g: n(f.rest_protein_g),
      carbs_g:   n(f.rest_carbs_g),
      fat_g:     n(f.rest_fat_g),
    },
  }
}

const EMPTY_FORM: ProfileForm = {
  training_calories: "", training_protein_g: "", training_carbs_g: "", training_fat_g: "",
  rest_calories: "",     rest_protein_g: "",     rest_carbs_g: "",     rest_fat_g: "",
}

const EMPTY_MEAL_FORM: AddMealForm = {
  name: "", calories: "", protein_g: "", carbs_g: "", fat_g: "", time: "", notes: "",
}

function makeId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NumInput({
  label,
  value,
  onChange,
  unit = "g",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  unit?: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
        {label}
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 72,
            padding: "6px 8px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 3,
            color: "var(--text)",
            fontSize: "var(--t-small)",
            fontFamily: "inherit",
          }}
        />
        <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>{unit}</span>
      </div>
    </div>
  )
}

function MacroRow({
  label,
  actual,
  target,
  unit = "g",
}: {
  label:  string
  actual: number
  target: number | null
  unit?:  string
}) {
  const pct = target ? Math.min(actual / target, 1) : 0
  const over = target !== null && actual > target
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 80px", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-soft)" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em" }}>{label}</span>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.round(pct * 100)}%`,
            background: over ? "var(--warn)" : "var(--accent)",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "var(--t-small)", color: "var(--text)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {actual}{unit}
      </span>
      <span style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {target !== null ? `/ ${target}${unit}` : "— no target"}
      </span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="stack-lg">
      <PageHeader crumb="INDEX · 13 / FUEL" title="Macro &amp; Fuel" subtitle="Loading…" />
      {[0, 1, 2].map((i) => (
        <TffCard key={i}>
          <div style={{ height: 80, background: "var(--border-soft)", borderRadius: 4, opacity: 0.5 }} />
        </TffCard>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FuelPage() {
  const today = getTodayLocalDate()

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing")
  const [profile, setProfile]       = useState<MacroProfile>(EMPTY_PROFILE)
  const [profileForm, setProfileForm] = useState<ProfileForm>(EMPTY_FORM)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved]   = useState(false)

  const [dayType, setDayType]   = useState<DayType>("training")
  const [meals, setMeals]       = useState<FuelMeal[]>([])
  const [logNotes, setLogNotes] = useState<string>("")
  const [logSaving, setLogSaving] = useState(false)

  const [showAddMeal, setShowAddMeal] = useState(false)
  const [mealForm, setMealForm]       = useState<AddMealForm>(EMPTY_MEAL_FORM)

  // ── Load on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.allSettled([
      fetchMacroProfile(),
      fetchDailyFuelLog(today),
    ]).then(([profileRes, logRes]) => {
      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        const p = profileRes.value.profile
        setProfile(p)
        setProfileForm(profileToForm(p))
        setSyncStatus("synced")
      } else if (profileRes.status === "fulfilled" && !profileRes.value.ok) {
        const r = profileRes.value.reason
        if (r === "not_found") {
          setSyncStatus("synced")
        } else if (r === "unauthenticated") {
          setSyncStatus("unauthenticated")
        } else {
          setSyncStatus("error")
        }
      }

      if (logRes.status === "fulfilled" && logRes.value.ok) {
        const log = logRes.value.log
        setDayType(log.day_type)
        setMeals(log.meals)
        setLogNotes(log.notes ?? "")
      }
    })
  }, [today])

  // ── Derived ───────────────────────────────────────────────────────────────

  const totals: FuelTotals = calculateFuelTotals(meals)
  const target = getMacroTargetForDay(profile, dayType)
  const compliance = calculateMacroCompliance(totals, target)

  // ── Save profile ──────────────────────────────────────────────────────────

  const handleSaveProfile = useCallback(async () => {
    setProfileSaving(true)
    const p = formToProfile(profileForm)
    const result = await upsertMacroProfile(p)
    if (result.ok) {
      setProfile(p)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    }
    setProfileSaving(false)
  }, [profileForm])

  // ── Save log ──────────────────────────────────────────────────────────────

  const persistLog = useCallback(async (
    nextMeals: FuelMeal[],
    nextDayType: DayType,
    nextNotes: string,
  ) => {
    setLogSaving(true)
    const nextTotals = calculateFuelTotals(nextMeals)
    const nextTarget = getMacroTargetForDay(profile, nextDayType)
    const nextCompliance = calculateMacroCompliance(nextTotals, nextTarget)
    await upsertDailyFuelLog(today, {
      day_type:         nextDayType,
      meals:            nextMeals,
      totals:           nextTotals,
      compliance_score: nextCompliance,
      notes:            nextNotes || null,
    })
    setLogSaving(false)
  }, [today, profile])

  // ── Add meal ──────────────────────────────────────────────────────────────

  const handleAddMeal = useCallback(async () => {
    if (!mealForm.name.trim()) return
    const meal: FuelMeal = {
      id:        makeId(),
      name:      mealForm.name.trim(),
      calories:  mealForm.calories  ? Number(mealForm.calories)  : null,
      protein_g: mealForm.protein_g ? Number(mealForm.protein_g) : null,
      carbs_g:   mealForm.carbs_g   ? Number(mealForm.carbs_g)   : null,
      fat_g:     mealForm.fat_g     ? Number(mealForm.fat_g)     : null,
      time:      mealForm.time.trim()  || undefined,
      notes:     mealForm.notes.trim() || undefined,
    }
    const nextMeals = [...meals, meal]
    setMeals(nextMeals)
    setMealForm(EMPTY_MEAL_FORM)
    setShowAddMeal(false)
    await persistLog(nextMeals, dayType, logNotes)
  }, [mealForm, meals, dayType, logNotes, persistLog])

  // ── Remove meal ───────────────────────────────────────────────────────────

  const handleRemoveMeal = useCallback(async (id: string) => {
    const nextMeals = meals.filter((m) => m.id !== id)
    setMeals(nextMeals)
    await persistLog(nextMeals, dayType, logNotes)
  }, [meals, dayType, logNotes, persistLog])

  // ── Day type change ───────────────────────────────────────────────────────

  const handleDayTypeChange = useCallback(async (dt: DayType) => {
    setDayType(dt)
    await persistLog(meals, dt, logNotes)
  }, [meals, logNotes, persistLog])

  // ── Save notes ────────────────────────────────────────────────────────────

  const handleSaveNotes = useCallback(async () => {
    await persistLog(meals, dayType, logNotes)
  }, [meals, dayType, logNotes, persistLog])

  // ── Render ────────────────────────────────────────────────────────────────

  if (syncStatus === "syncing") return <Skeleton />

  const targetsSet =
    target.calories !== null ||
    target.protein_g !== null ||
    target.carbs_g !== null ||
    target.fat_g !== null

  const complianceColor =
    compliance === null ? "var(--text-4)" :
    compliance >= 80    ? "var(--accent)"  :
    compliance >= 50    ? "var(--warn)"    :
    "var(--danger)"

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 13 / FUEL"
        title="Macro &amp; Fuel"
        subtitle="Set daily macro targets and log food intake by meal."
      />

      {/* ── A. Hero Stats ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Compliance */}
        <div
          style={{
            flex: 1, minWidth: 120,
            padding: "14px 16px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
          }}
        >
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}>
            COMPLIANCE
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: complianceColor, margin: 0, lineHeight: 1 }}>
            {compliance !== null ? `${compliance}` : "—"}
          </p>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 3 }}>
            {compliance !== null ? "/ 100" : "SET TARGETS"}
          </p>
        </div>

        {/* Day type */}
        <div
          style={{
            flex: 1, minWidth: 120,
            padding: "14px 16px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
          }}
        >
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}>
            DAY TYPE
          </p>
          <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: 0 }}>
            {dayType === "training" ? "Training" : "Rest"}
          </p>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 3 }}>
            TODAY
          </p>
        </div>

        {/* Meals logged */}
        <div
          style={{
            flex: 1, minWidth: 120,
            padding: "14px 16px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
          }}
        >
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}>
            MEALS LOGGED
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>
            {meals.length}
          </p>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 3 }}>
            TODAY
          </p>
        </div>

        {/* Total calories */}
        <div
          style={{
            flex: 1, minWidth: 120,
            padding: "14px 16px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
          }}
        >
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}>
            CALORIES
          </p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>
            {totals.calories}
          </p>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 3 }}>
            {target.calories !== null ? `/ ${target.calories} TARGET` : "NO TARGET SET"}
          </p>
        </div>

        {/* Sync */}
        <div
          style={{
            flex: 1, minWidth: 120,
            padding: "14px 16px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
            SYNC
          </p>
          <SyncBadge status={syncStatus} />
          {logSaving && (
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 2 }}>
              SAVING…
            </p>
          )}
        </div>
      </div>

      {/* ── B. Day Type + Totals vs Targets ──────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <span className="label">Today — {today}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["training", "rest"] as DayType[]).map((dt) => (
              <button
                key={dt}
                onClick={() => void handleDayTypeChange(dt)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 3,
                  border: "1px solid var(--border-soft)",
                  background: dayType === dt ? "var(--accent)" : "var(--card-2)",
                  color: dayType === dt ? "#000" : "var(--text-3)",
                  fontSize: "var(--t-small)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  fontWeight: dayType === dt ? 600 : 400,
                }}
              >
                {dt === "training" ? "Training" : "Rest"}
              </button>
            ))}
          </div>
        </div>

        {/* Macros row */}
        <div style={{ marginBottom: 4 }}>
          <MacroRow label="CALORIES" actual={totals.calories}  target={target.calories}  unit=" kcal" />
          <MacroRow label="PROTEIN"  actual={totals.protein_g} target={target.protein_g} />
          <MacroRow label="CARBS"    actual={totals.carbs_g}   target={target.carbs_g}   />
          <MacroRow label="FAT"      actual={totals.fat_g}     target={target.fat_g}     />
        </div>

        {!targetsSet && (
          <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 10 }}>
            Set macro targets below to unlock the compliance score and target progress bars.
          </p>
        )}

        {/* Compliance */}
        {compliance !== null && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>
              MACRO COMPLIANCE SCORE
            </span>
            <span style={{ fontSize: 24, fontWeight: 700, color: complianceColor, fontVariantNumeric: "tabular-nums" }}>
              {compliance} / 100
            </span>
          </div>
        )}
      </TffCard>

      {/* ── C. Meals Logged ───────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <span className="label">Meals</span>
          <button
            onClick={() => setShowAddMeal((v) => !v)}
            style={{
              padding: "5px 12px",
              background: showAddMeal ? "var(--border-soft)" : "var(--accent)",
              border: "none",
              borderRadius: 3,
              color: showAddMeal ? "var(--text-3)" : "#000",
              fontSize: "var(--t-small)",
              fontFamily: "inherit",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {showAddMeal ? "Cancel" : "+ Add Meal"}
          </button>
        </div>

        {/* Add meal form */}
        {showAddMeal && (
          <TffCard style={{ marginBottom: 10 }}>
            <TffCardHeader>Log a Meal</TffCardHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                  MEAL NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout: rice + beef"
                  value={mealForm.name}
                  onChange={(e) => setMealForm((f) => ({ ...f, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    background: "var(--card-2)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 3,
                    color: "var(--text)",
                    fontSize: "var(--t-small)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <NumInput label="CALORIES (kcal)" value={mealForm.calories} onChange={(v) => setMealForm((f) => ({ ...f, calories: v }))} unit="kcal" />
                <NumInput label="PROTEIN" value={mealForm.protein_g} onChange={(v) => setMealForm((f) => ({ ...f, protein_g: v }))} />
                <NumInput label="CARBS"   value={mealForm.carbs_g}   onChange={(v) => setMealForm((f) => ({ ...f, carbs_g: v }))} />
                <NumInput label="FAT"     value={mealForm.fat_g}     onChange={(v) => setMealForm((f) => ({ ...f, fat_g: v }))} />
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                    TIME (optional)
                  </label>
                  <input
                    type="time"
                    value={mealForm.time}
                    onChange={(e) => setMealForm((f) => ({ ...f, time: e.target.value }))}
                    style={{
                      padding: "6px 8px",
                      background: "var(--card-2)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: 3,
                      color: "var(--text)",
                      fontSize: "var(--t-small)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 4 }}>
                  <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                    NOTES (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Any details about this meal"
                    value={mealForm.notes}
                    onChange={(e) => setMealForm((f) => ({ ...f, notes: e.target.value }))}
                    style={{
                      padding: "6px 8px",
                      background: "var(--card-2)",
                      border: "1px solid var(--border-soft)",
                      borderRadius: 3,
                      color: "var(--text)",
                      fontSize: "var(--t-small)",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => void handleAddMeal()}
                disabled={!mealForm.name.trim()}
                style={{
                  alignSelf: "flex-start",
                  padding: "7px 16px",
                  background: mealForm.name.trim() ? "var(--accent)" : "var(--border-soft)",
                  border: "none",
                  borderRadius: 3,
                  color: mealForm.name.trim() ? "#000" : "var(--text-4)",
                  fontSize: "var(--t-small)",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  cursor: mealForm.name.trim() ? "pointer" : "default",
                }}
              >
                Log Meal
              </button>
            </div>
          </TffCard>
        )}

        {/* Meal list */}
        {meals.length === 0 ? (
          <TffCard>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textAlign: "center", padding: "24px 0" }}>
              No meals logged today. Use &quot;+ Add Meal&quot; to start.
            </p>
          </TffCard>
        ) : (
          <TffCard>
            {meals.map((meal, i) => (
              <div
                key={meal.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < meals.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}>
                      {meal.name}
                    </span>
                    {meal.time && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {meal.time}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {meal.calories !== null && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>
                        {meal.calories} kcal
                      </span>
                    )}
                    {meal.protein_g !== null && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>
                        P {meal.protein_g}g
                      </span>
                    )}
                    {meal.carbs_g !== null && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>
                        C {meal.carbs_g}g
                      </span>
                    )}
                    {meal.fat_g !== null && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-3)" }}>
                        F {meal.fat_g}g
                      </span>
                    )}
                    {meal.calories === null && meal.protein_g === null && meal.carbs_g === null && meal.fat_g === null && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        no macros — manual review needed
                      </span>
                    )}
                  </div>
                  {meal.notes && (
                    <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 3 }}>
                      {meal.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => void handleRemoveMeal(meal.id)}
                  style={{
                    flexShrink: 0,
                    padding: "3px 8px",
                    background: "transparent",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 3,
                    color: "var(--text-4)",
                    fontSize: "var(--t-micro)",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </TffCard>
        )}
      </div>

      {/* ── D. Macro Targets (Profile) ────────────────────────────────────── */}
      <div>
        <SectionHeader>Macro Targets</SectionHeader>
        <TffCard>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0 }}>
              Set daily targets for training and rest days. All fields optional — only set what you know.
            </p>
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0 }}>
              MANUAL ENTRY · MANUAL REVIEW NEEDED
            </p>
          </div>

          {/* Training day targets */}
          <div style={{ marginBottom: 20 }}>
            <p className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 12 }}>
              TRAINING DAY
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <NumInput label="CALORIES" value={profileForm.training_calories}  unit="kcal" onChange={(v) => setProfileForm((f) => ({ ...f, training_calories: v }))} />
              <NumInput label="PROTEIN"  value={profileForm.training_protein_g}           onChange={(v) => setProfileForm((f) => ({ ...f, training_protein_g: v }))} />
              <NumInput label="CARBS"    value={profileForm.training_carbs_g}             onChange={(v) => setProfileForm((f) => ({ ...f, training_carbs_g: v }))} />
              <NumInput label="FAT"      value={profileForm.training_fat_g}               onChange={(v) => setProfileForm((f) => ({ ...f, training_fat_g: v }))} />
            </div>
          </div>

          {/* Rest day targets */}
          <div style={{ marginBottom: 20 }}>
            <p className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 12 }}>
              REST DAY
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <NumInput label="CALORIES" value={profileForm.rest_calories}  unit="kcal" onChange={(v) => setProfileForm((f) => ({ ...f, rest_calories: v }))} />
              <NumInput label="PROTEIN"  value={profileForm.rest_protein_g}           onChange={(v) => setProfileForm((f) => ({ ...f, rest_protein_g: v }))} />
              <NumInput label="CARBS"    value={profileForm.rest_carbs_g}             onChange={(v) => setProfileForm((f) => ({ ...f, rest_carbs_g: v }))} />
              <NumInput label="FAT"      value={profileForm.rest_fat_g}               onChange={(v) => setProfileForm((f) => ({ ...f, rest_fat_g: v }))} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => void handleSaveProfile()}
              disabled={profileSaving}
              style={{
                padding: "7px 16px",
                background: profileSaving ? "var(--border-soft)" : "var(--accent)",
                border: "none",
                borderRadius: 3,
                color: profileSaving ? "var(--text-4)" : "#000",
                fontSize: "var(--t-small)",
                fontFamily: "inherit",
                fontWeight: 600,
                cursor: profileSaving ? "default" : "pointer",
              }}
            >
              {profileSaving ? "Saving…" : "Save Targets"}
            </button>
            {profileSaved && (
              <span className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em" }}>
                SAVED
              </span>
            )}
            {syncStatus === "unauthenticated" && (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                SIGN IN TO SAVE
              </span>
            )}
          </div>
        </TffCard>
      </div>

      {/* ── E. Log Notes ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Day Notes</SectionHeader>
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 10 }}>
            Optional notes for today&apos;s fuel log — how you felt, any deviations, context.
          </p>
          <textarea
            rows={3}
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
            placeholder="Any notes about today's fuel…"
            style={{
              width: "100%",
              padding: "8px 10px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 3,
              color: "var(--text)",
              fontSize: "var(--t-small)",
              fontFamily: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => void handleSaveNotes()}
            style={{
              marginTop: 8,
              padding: "6px 14px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 3,
              color: "var(--text-3)",
              fontSize: "var(--t-small)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Save Notes
          </button>
        </TffCard>
      </div>

      {/* ── F. How to Use ─────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>How to Use</SectionHeader>
        <TffCard>
          {[
            { num: "01", heading: "Set Targets First", body: "Enter your training-day and rest-day macro targets in the Macro Targets section. These are manual — derive from body weight, training volume, and protocol notes. No auto-calculation." },
            { num: "02", heading: "Select Day Type", body: "Toggle Training or Rest at the top of the Today section. This determines which target set is used for the compliance score." },
            { num: "03", heading: "Log Meals as You Eat", body: "Tap '+ Add Meal' after each meal. Name is required. Macros are optional — enter what you know. If macros are unknown, the meal is still logged for count tracking." },
            { num: "04", heading: "Review Compliance", body: "The compliance score appears once targets are set. Score formula: Calories 30pts + Protein 30pts + Carbs 20pts + Fat 20pts. Each macro scores weight × max(0, 1 – deviation × 2). 100 = exact targets." },
            { num: "05", heading: "Notes Are Optional", body: "Use Day Notes to record context — deviations, travel, hunger levels, or anything relevant to the day's fuel choices." },
          ].map((step, i, arr) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                gap: 16,
                padding: "12px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
              }}
            >
              <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", flexShrink: 0, paddingTop: 2 }}>
                {step.num}
              </span>
              <div>
                <p style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)", margin: "0 0 3px" }}>
                  {step.heading}
                </p>
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </TffCard>
      </div>

      {/* ── G. Compliance Formula Reference ──────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <TffCardHeader>Compliance Score Formula</TffCardHeader>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 8px", lineHeight: 1.5 }}>
              Score = Σ (weight × max(0, 1 – (|actual – target| / target) × 2))
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { label: "Calories", weight: 30 },
                { label: "Protein",  weight: 30 },
                { label: "Carbs",    weight: 20 },
                { label: "Fat",      weight: 20 },
              ].map((m) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>{m.label.toUpperCase()}</span>
                  <TffBadge variant="default">{m.weight}pts</TffBadge>
                </div>
              ))}
            </div>
          </div>
          <TffBadge variant="na">Manual Review Needed</TffBadge>
        </div>
      </TffCard>
    </div>
  )
}

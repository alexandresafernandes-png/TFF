"use client"

import { useState, useMemo, useEffect, type CSSProperties } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { StatCard } from "@/components/tff/StatCard"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import { fetchRoutineCompletions, upsertRoutineCompletion } from "@/lib/supabase/routines-sync"
import routinesRaw from "@/data/routines.json"

// ── Types ─────────────────────────────────────────────────────────────────────

interface RoutineSection {
  title: string
  items: string[]
}

interface Routine {
  id: string
  name: string
  type: string
  sections: RoutineSection[]
  source_refs: string[]
  tags: string[]
}

type PageMode = "browse" | "flow" | "phase2"
type DayFilter = "both" | "training" | "rest"

// ── Data ──────────────────────────────────────────────────────────────────────

const ROUTINES = routinesRaw as unknown as Routine[]

// ── Category mapping ──────────────────────────────────────────────────────────

const DISPLAY_CATEGORY: Record<string, string> = {
  routine_morning:            "Morning Foundation",
  routine_minimum_effective:  "Morning Foundation",
  routine_daily:              "Daily System",
  routine_nutrition:          "Daily System",
  routine_training_day:       "Training Day",
  routine_rest_day:           "Rest Day",
  routine_sleep:              "Sleep Preparation",
  routine_supplement_timing:  "Supplement Timing",
  routine_weekly:             "Weekly Reset",
  routine_monthly:            "Monthly Review",
  routine_hair:               "Hair & Scalp",
}

const CATEGORY_ORDER = [
  "Morning Foundation",
  "Daily System",
  "Training Day",
  "Rest Day",
  "Sleep Preparation",
  "Supplement Timing",
  "Weekly Reset",
  "Monthly Review",
  "Hair & Scalp",
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategory(r: Routine): string {
  return DISPLAY_CATEGORY[r.id] ?? "Other"
}

function getPriority(r: Routine): string {
  if (r.tags.includes("pri_critical")) return "Critical"
  if (r.tags.includes("pri_core")) return "Core"
  return "Useful"
}

function getPriorityVariant(r: Routine): "warn" | "core" | "default" {
  if (r.tags.includes("pri_critical")) return "warn"
  if (r.tags.includes("pri_core")) return "core"
  return "default"
}

function getTimings(r: Routine): string[] {
  const t: string[] = []
  if (r.type === "training_day") { t.push("Training Day"); return t }
  if (r.type === "rest_day") { t.push("Rest Day"); return t }
  if (r.type === "sleep") { t.push("Pre-sleep"); return t }
  if (r.type === "weekly") { t.push("Weekly"); return t }
  if (r.type === "monthly") { t.push("Monthly"); return t }
  if (r.tags.includes("time_morning")) t.push("Morning")
  if (r.tags.includes("time_pre_workout")) t.push("Pre-workout")
  if (r.tags.includes("time_post_workout")) t.push("Post-workout")
  if (r.tags.includes("time_pre_bed")) t.push("Pre-sleep")
  if (!t.length) t.push("Daily")
  return t
}

// ── Module-level stats ────────────────────────────────────────────────────────

const TOTAL_ROUTINES = ROUTINES.length
const CORE_COUNT = ROUTINES.filter((r) => r.tags.includes("pri_critical") || r.tags.includes("pri_core")).length
const CATEGORY_COUNT = new Set(Object.values(DISPLAY_CATEGORY)).size

// ── LocalStorage keys ─────────────────────────────────────────────────────────

const LS_ACTIVE    = "tff_routine_active"
const LS_COMPLETED = "tff_routine_completed"

// ── Daily Flow data ───────────────────────────────────────────────────────────

const DAILY_FLOW_STEPS = [
  {
    period: "On Waking",
    label: "Morning Anchor",
    description: "Fixed wake time (±30 min). Get outside within 30–60 min for 5–30 min sunlight. Phone down until after sunlight + movement.",
    routineId: "routine_morning",
    dayType: "both" as const,
  },
  {
    period: "Morning",
    label: "Supplements + First Meal",
    description: "Morning supplement stack with first meal (Boron, D3+K2, B-Complex, Zinc, Selenium, Vitamin C, Magnesium, Creatine). Protein-first breakfast from animal sources.",
    routineId: "routine_supplement_timing",
    dayType: "both" as const,
  },
  {
    period: "Pre-Workout",
    label: "Training Prep",
    description: "Protein-only pre-workout meal (30–40g lean protein, zero carbs, fat ≤5–10g). Optional performance supplements 30–60 min before.",
    routineId: "routine_training_day",
    dayType: "training" as const,
  },
  {
    period: "During Training",
    label: "Intra-Workout",
    description: "Glucose + sodium intra-workout drink (30–50g dextrose + 2g sodium). Start after first 1–2 heavy sets — not before.",
    routineId: "routine_training_day",
    dayType: "training" as const,
  },
  {
    period: "Post-Workout",
    label: "Recovery Window",
    description: "0–30 min anabolic window: 100–200g hot starch + 30–40g lean protein. Fat ≤5–7g. Walk 10–15 min after.",
    routineId: "routine_training_day",
    dayType: "training" as const,
  },
  {
    period: "Afternoon",
    label: "Light Movement (Rest Day)",
    description: "Walk 10–15 min after meals. Light activity only — no heavy CNS demand. Reduce carbs ~25% vs training day.",
    routineId: "routine_rest_day",
    dayType: "rest" as const,
  },
  {
    period: "Evening",
    label: "Wind-Down",
    description: "Last large meal 2–3h before bed. Blue light blockers on 1–2h before bed. No important tasks or problem-solving.",
    routineId: "routine_sleep",
    dayType: "both" as const,
  },
  {
    period: "Pre-Sleep",
    label: "Sleep Protocol",
    description: "Sleep stack 30 min before bed: Magnesium + L-Theanine + Apigenin. Blackout curtains. Earplugs. ASMR/rain sound. Paper book 15 min.",
    routineId: "routine_sleep",
    dayType: "both" as const,
  },
]

// ── Phase 2 features ──────────────────────────────────────────────────────────

const PHASE2_FEATURES = [
  { title: "Routine Completion History", desc: "Log each routine completion and view weekly/monthly consistency trends." },
  { title: "Streaks & Consistency Tracking", desc: "Track consecutive days on core routines. See your longest streaks." },
  { title: "Dashboard Routine Card", desc: "Today's active routines visible at a glance from the main dashboard." },
  { title: "Routine Scheduling & Reminders", desc: "Set routine start times. Push notifications or in-app reminders." },
  { title: "Calendar-Style Planning", desc: "Plan which routines run on which days across the week." },
  { title: "Checklist Integration", desc: "Completing a routine auto-checks its linked checklist items." },
  { title: "Protocol Deep-Links", desc: "Step-by-step protocol view linked directly from routine detail." },
  { title: "Custom Routine Builder", desc: "Combine steps from existing routines and protocols into personal routines." },
  { title: "Supabase Sync", desc: "Cross-device persistence of active routines, completions, and personal notes." },
]

// ── Style constant ────────────────────────────────────────────────────────────

const SEL: CSSProperties = {
  padding: "8px 10px",
  fontSize: "var(--t-small)" as string,
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--text)",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RoutineCard({
  routine,
  active,
  completed,
  onActiveToggle,
  onCompletedToggle,
}: {
  routine: Routine
  active: boolean
  completed: boolean
  onActiveToggle: () => void
  onCompletedToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const timings = getTimings(routine)
  const priorityVariant = getPriorityVariant(routine)
  const priority = getPriority(routine)
  const preview = routine.sections[0]?.items.slice(0, 2) ?? []

  return (
    <TffCard style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <TffBadge variant={priorityVariant}>{priority}</TffBadge>
            <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
              {timings.join(" · ")}
            </span>
            {completed && (
              <span className="mono" style={{ fontSize: 9, color: "#8aca8a", letterSpacing: "0.08em" }}>✓ DONE TODAY</span>
            )}
          </div>
          <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            {routine.name}
          </div>
          {!expanded && preview.map((item, i) => (
            <p key={i} style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "2px 0", lineHeight: 1.5 }}>
              · {item.length > 100 ? item.slice(0, 100) + "…" : item}
            </p>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onCompletedToggle}
              className="mono"
              style={{
                padding: "4px 10px", fontSize: 9, letterSpacing: "0.08em",
                background: completed ? "#1e3a1e" : "transparent",
                border: "1px solid", borderColor: completed ? "#4a8a4a" : "var(--border)",
                borderRadius: 4, color: completed ? "#8aca8a" : "var(--text-4)", cursor: "pointer",
              }}
            >
              {completed ? "✓ DONE" : "DONE"}
            </button>
            <button
              onClick={onActiveToggle}
              className="mono"
              style={{
                padding: "4px 10px", fontSize: 9, letterSpacing: "0.08em",
                background: active ? "var(--accent)" : "transparent",
                border: "1px solid", borderColor: active ? "var(--accent)" : "var(--border)",
                borderRadius: 4, color: active ? "var(--bg)" : "var(--text-3)", cursor: "pointer",
              }}
            >
              {active ? "● ACTIVE" : "ACTIVATE"}
            </button>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mono"
            style={{
              padding: "4px 10px", fontSize: 9, letterSpacing: "0.08em",
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 4, color: "var(--text-4)", cursor: "pointer",
            }}
          >
            {expanded ? "▲ COLLAPSE" : "▼ VIEW"}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          {routine.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 20 }}>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 10 }}
              >
                {section.title.toUpperCase()}
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                {section.items.map((item, ii) => (
                  <li
                    key={ii}
                    style={{
                      fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 6,
                      lineHeight: 1.65, paddingLeft: 14, position: "relative",
                    }}
                  >
                    <span style={{ position: "absolute", left: 0, color: "var(--text-4)" }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 16 }}>
            {routine.source_refs.length > 0 && (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}>
                SOURCES: {routine.source_refs.join(" · ")}
              </span>
            )}
            <span className="mono" style={{ fontSize: 9, color: "#4a8a4a", letterSpacing: "0.06em" }}>
              ✓ TFF-SOURCED
            </span>
          </div>
        </div>
      )}
    </TffCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RoutinesPage() {
  const [mode, setMode] = useState<PageMode>("browse")
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterTiming, setFilterTiming] = useState("all")
  const [dayFilter, setDayFilter] = useState<DayFilter>("both")

  // localStorage state
  const [activeToday, setActiveToday] = useState<Set<string>>(new Set())
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  // Sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")

  // Load
  useEffect(() => {
    try {
      const r1 = localStorage.getItem(LS_ACTIVE)
      if (r1) setActiveToday(new Set(JSON.parse(r1) as string[]))
      const r2 = localStorage.getItem(LS_COMPLETED)
      if (r2) setCompletedToday(new Set(JSON.parse(r2) as string[]))
    } catch (_e) { /* ignore */ }
    setLoaded(true)
  }, [])

  // Persist active
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(LS_ACTIVE, JSON.stringify([...activeToday])) } catch (_e) { /* ignore */ }
  }, [activeToday, loaded])

  // Persist completed
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(LS_COMPLETED, JSON.stringify([...completedToday])) } catch (_e) { /* ignore */ }
  }, [completedToday, loaded])

  // Initial cloud sync — runs once after hydration
  useEffect(() => {
    if (!loaded) return
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }
    setSyncStatus("syncing")

    fetchRoutineCompletions().then((result) => {
      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }

      const rows = result.data

      if (rows.length === 0) {
        // Remote empty — upload local state in background
        activeToday.forEach((id) => void upsertRoutineCompletion(id, "active"))
        completedToday.forEach((id) => void upsertRoutineCompletion(id, "done"))
        setSyncStatus("synced")
        return
      }

      // Remote has data — merge into local state (remote wins for known routines)
      setActiveToday((prev) => {
        const next = new Set(prev)
        for (const row of rows) {
          if (row.status === "active") next.add(row.routine_id)
          else next.delete(row.routine_id)
        }
        return next
      })
      setCompletedToday((prev) => {
        const next = new Set(prev)
        for (const row of rows) {
          if (row.status === "done") next.add(row.routine_id)
          else next.delete(row.routine_id)
        }
        return next
      })

      setSyncStatus("synced")
    })
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = (id: string) => {
    const nowActive = !activeToday.has(id)
    setActiveToday((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
    // Highest-priority status wins: done > active > inactive
    if (nowActive) {
      void upsertRoutineCompletion(id, "active")
    } else {
      void upsertRoutineCompletion(id, completedToday.has(id) ? "done" : "inactive")
    }
  }

  const toggleCompleted = (id: string) => {
    const nowDone = !completedToday.has(id)
    setCompletedToday((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
    if (nowDone) {
      void upsertRoutineCompletion(id, "done")
    } else {
      void upsertRoutineCompletion(id, activeToday.has(id) ? "active" : "inactive")
    }
  }

  const resetToday = () => {
    const allIds = new Set([...activeToday, ...completedToday])
    allIds.forEach((id) => void upsertRoutineCompletion(id, "inactive"))
    setActiveToday(new Set())
    setCompletedToday(new Set())
  }

  const isFiltering = !!(search || filterCategory !== "all" || filterPriority !== "all" || filterTiming !== "all")

  const filtered = useMemo(() => {
    let result = ROUTINES
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.sections.some(
          (s) => s.title.toLowerCase().includes(q) || s.items.some((item) => item.toLowerCase().includes(q))
        )
      )
    }
    if (filterCategory !== "all") {
      result = result.filter((r) => getCategory(r) === filterCategory)
    }
    if (filterPriority !== "all") {
      result = result.filter((r) => getPriority(r) === filterPriority)
    }
    if (filterTiming !== "all") {
      result = result.filter((r) => getTimings(r).includes(filterTiming))
    }
    return result
  }, [search, filterCategory, filterPriority, filterTiming])

  const grouped = useMemo(() => {
    const map: Record<string, Routine[]> = {}
    for (const r of filtered) {
      const cat = getCategory(r)
      if (!map[cat]) map[cat] = []
      map[cat].push(r)
    }
    return map
  }, [filtered])

  const flowSteps = useMemo(
    () => DAILY_FLOW_STEPS.filter((s) => dayFilter === "both" || s.dayType === "both" || s.dayType === dayFilter),
    [dayFilter]
  )

  const MODES = [
    { key: "browse" as const, label: "Browse Routines" },
    { key: "flow" as const,   label: "Daily Flow" },
    { key: "phase2" as const, label: "Phase 2" },
  ]

  return (
    <div>
      <PageHeader
        crumb="INDEX · 09 / ROUTINES"
        title="Routines"
        subtitle="Turn TFF protocols, nutrition, supplements, and sleep into repeatable daily systems."
      />

      {/* ── Stats ── */}
      <div className="page-inset" style={{ paddingBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard count={TOTAL_ROUTINES} label="ROUTINE BLOCKS" />
        <StatCard count={CORE_COUNT} label="CORE / CRITICAL" />
        <StatCard count={CATEGORY_COUNT} label="CATEGORIES" />
        <StatCard count={activeToday.size + completedToday.size} label="ACTIVE TODAY" />
      </div>

      {/* ── Mode tabs ── */}
      <div className="page-inset" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="mono"
              style={{
                padding: "7px 16px",
                fontSize: 10,
                letterSpacing: "0.1em",
                background: mode === m.key ? "var(--accent)" : "var(--panel-2)",
                border: "1px solid",
                borderColor: mode === m.key ? "var(--accent)" : "var(--border)",
                borderRadius: 4,
                color: mode === m.key ? "var(--bg)" : "var(--text-3)",
                cursor: "pointer",
              }}
            >
              {m.label.toUpperCase()}
            </button>
          ))}
          <div style={{ marginLeft: 4 }}>
            <SyncBadge status={syncStatus} />
          </div>
        </div>
      </div>

      {/* ── BROWSE ── */}
      {mode === "browse" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search routines…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1 1 200px",
                padding: "8px 12px",
                fontSize: "var(--t-small)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
                outline: "none",
              }}
            />
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={SEL}>
              <option value="all">All Categories</option>
              {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={SEL}>
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="Core">Core</option>
              <option value="Useful">Useful</option>
            </select>
            <select value={filterTiming} onChange={(e) => setFilterTiming(e.target.value)} style={SEL}>
              <option value="all">All Timings</option>
              <option value="Morning">Morning</option>
              <option value="Pre-workout">Pre-workout</option>
              <option value="Post-workout">Post-workout</option>
              <option value="Pre-sleep">Pre-sleep</option>
              <option value="Training Day">Training Day</option>
              <option value="Rest Day">Rest Day</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            {isFiltering && (
              <button
                onClick={() => { setSearch(""); setFilterCategory("all"); setFilterPriority("all"); setFilterTiming("all") }}
                className="mono"
                style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            {isFiltering ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                {filtered.length} ROUTINE{filtered.length !== 1 ? "S" : ""} FOUND
              </span>
            ) : <span />}
            <div style={{ display: "flex", gap: 8 }}>
              {(activeToday.size > 0 || completedToday.size > 0) && (
                <button
                  onClick={resetToday}
                  className="mono"
                  style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
                >
                  RESET TODAY
                </button>
              )}
            </div>
          </div>

          {/* Grouped routine cards */}
          {filtered.length === 0 ? (
            <TffCard>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No routines match your filters. Try clearing search or adjusting filters.
              </p>
            </TffCard>
          ) : (
            CATEGORY_ORDER.map((cat) => {
              const items = grouped[cat]
              if (!items?.length) return null
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <SectionHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{cat}</span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {items.length} ROUTINE{items.length !== 1 ? "S" : ""}
                      </span>
                    </div>
                  </SectionHeader>
                  {items.map((routine) => (
                    <RoutineCard
                      key={routine.id}
                      routine={routine}
                      active={activeToday.has(routine.id)}
                      completed={completedToday.has(routine.id)}
                      onActiveToggle={() => toggleActive(routine.id)}
                      onCompletedToggle={() => toggleCompleted(routine.id)}
                    />
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── DAILY FLOW ── */}
      {mode === "flow" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <TffBadge variant="core">Phase 1 — TFF Source Structure</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              This daily flow is drawn directly from TFF source material. Training day blocks and rest day blocks are separated below.
              Toggle the view to see how the day structure changes depending on whether you train.
            </p>
          </TffCard>

          {/* Day type toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {(["both", "training", "rest"] as DayFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDayFilter(d)}
                className="mono"
                style={{
                  padding: "6px 14px", fontSize: 9, letterSpacing: "0.1em",
                  background: dayFilter === d ? "var(--accent)" : "var(--panel-2)",
                  border: "1px solid", borderColor: dayFilter === d ? "var(--accent)" : "var(--border)",
                  borderRadius: 4, color: dayFilter === d ? "var(--bg)" : "var(--text-3)", cursor: "pointer",
                }}
              >
                {d === "both" ? "FULL VIEW" : d === "training" ? "TRAINING DAY" : "REST DAY"}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 52, top: 0, bottom: 0, width: 1, background: "var(--border)" }} />

            {flowSteps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
                {/* Time label */}
                <div style={{ width: 48, flexShrink: 0, textAlign: "right" }}>
                  <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.06em", lineHeight: 1.4, display: "block" }}>
                    {step.period.toUpperCase()}
                  </span>
                </div>

                {/* Dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                  background: step.dayType === "both" ? "var(--accent)" : step.dayType === "training" ? "var(--warn, #f59e0b)" : "var(--text-4)",
                  border: "2px solid var(--bg)",
                  position: "relative", zIndex: 1,
                }} />

                {/* Content */}
                <TffCard style={{ flex: 1, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                      {step.label}
                    </div>
                    <span className="mono" style={{
                      fontSize: 8, padding: "2px 6px", borderRadius: 3, flexShrink: 0,
                      background: step.dayType === "training" ? "rgba(245,158,11,0.15)" : step.dayType === "rest" ? "var(--panel-2)" : "var(--panel-2)",
                      color: step.dayType === "training" ? "#f59e0b" : step.dayType === "rest" ? "var(--text-4)" : "var(--accent)",
                      border: "1px solid",
                      borderColor: step.dayType === "training" ? "rgba(245,158,11,0.3)" : "var(--border)",
                      letterSpacing: "0.08em",
                    }}>
                      {step.dayType === "both" ? "ALL DAYS" : step.dayType === "training" ? "TRAINING ONLY" : "REST ONLY"}
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </TffCard>
              </div>
            ))}
          </div>

          {/* Sources note */}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--panel-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}>
              ✓ TFF-SOURCED · All flow blocks drawn from routines.json · TFF 2.0 · Performance Nutrition · Sleep &amp; Recovery · DHT Remastered
            </span>
          </div>
        </div>
      )}

      {/* ── PHASE 2 ── */}
      {mode === "phase2" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <TffBadge variant="depends">Phase 2 — Not Yet Active</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Phase 1 routines are fully browsable and locally trackable. Phase 2 adds personal tracking, streaks, reminders, and cross-device sync via Supabase.
            </p>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: "8px 0 0", lineHeight: 1.6 }}>
              {/* TODO Phase 2: routines table, routine_steps, user_routines, routine_completions, routine_notes
                  Link routines to checklist items, protocols, supplements, nutrition */}
              Planned Supabase tables: <span className="mono">routines · routine_steps · user_routines · routine_completions · routine_notes</span>
            </p>
          </TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASE2_FEATURES.map((f, i) => (
              <TffCard key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0, marginTop: 3, letterSpacing: "0.08em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{f.title}</div>
                    <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              </TffCard>
            ))}
          </div>
        </div>
      )}

      {/* Storage note */}
      <div className="page-inset" style={{ paddingBottom: 32 }}>
        <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
          {syncStatus === "synced" || syncStatus === "syncing"
            ? "ROUTINE STATE SYNCS TO CLOUD · LOCALSTORAGE FALLBACK ACTIVE"
            : "ROUTINE STATE STORED IN BROWSER LOCALSTORAGE"}
        </p>
      </div>
    </div>
  )
}

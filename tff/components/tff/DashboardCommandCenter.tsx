"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { TffProgress } from "@/components/tff/TffProgress"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import {
  fetchProgressData,
  fetchRecentProgressSnapshots,
  calcScore,
  calculateStreaks,
  calculateWeeklyStats,
  todayLocalDate,
  CHECKLIST_TOTAL,
  STREAK_THRESHOLD,
  type ProgressData,
  type ProgressSnapshot,
} from "@/lib/supabase/progress-sync"
import {
  fetchMacroProfile,
  fetchDailyFuelLog,
  calculateMacroCompliance,
  type MacroProfile,
  type DailyFuelLog,
} from "@/lib/supabase/macro-fuel-sync"
import {
  fetchSupplementScheduleItems,
  fetchSupplementCompletionsForDate,
  calculateSupplementAdherence,
  type SupplementScheduleItem,
  type SupplementScheduleCompletion,
} from "@/lib/supabase/supplement-schedule-sync"
import {
  fetchProtocolTracking,
  type ProtocolTrackingRow,
} from "@/lib/supabase/protocols-sync"
import {
  fetchBloodworkTests,
  type BloodworkTest,
} from "@/lib/supabase/bloodwork-tracking-sync"
import protocolsRaw from "@/data/protocols.json"

// ── Protocol name lookup (module-level, runs once) ────────────────────────────

const PROTOCOL_NAME = Object.fromEntries(
  (protocolsRaw as { id: string; name: string }[]).map((p) => [p.id, p.name])
) as Record<string, string>

// ── State type ────────────────────────────────────────────────────────────────

interface CommandData {
  today:           string
  progress:        ProgressData | null
  snapshots:       ProgressSnapshot[]
  macroProfile:    MacroProfile | null
  fuelLog:         DailyFuelLog | null
  suppItems:       SupplementScheduleItem[]
  suppCompletions: SupplementScheduleCompletion[]
  protocols:       ProtocolTrackingRow[]
  bloodworkTests:  BloodworkTest[]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NavArrow({ href }: { href: string }) {
  return (
    <Link
      href={href}
      style={{ fontSize: 13, color: "var(--text-4)", textDecoration: "none", flexShrink: 0 }}
    >
      →
    </Link>
  )
}

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string | number
  label: string
  accent?: boolean
}) {
  return (
    <div>
      <span
        className="mono"
        style={{
          display:    "block",
          fontSize:   "var(--t-h2)",
          fontWeight: 700,
          color:      accent ? "var(--accent)" : "var(--text)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        className="label"
        style={{ display: "block", marginTop: 3, fontSize: "var(--t-micro)" }}
      >
        {label}
      </span>
    </div>
  )
}

function CardHead({ label, href }: { label: string; href: string }) {
  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        marginBottom:   14,
      }}
    >
      <p className="label" style={{ margin: 0 }}>{label}</p>
      <NavArrow href={href} />
    </div>
  )
}

function SkeletonLine({ w = "60%", h = 10 }: { w?: string; h?: number }) {
  return (
    <div
      style={{
        height:     h,
        width:      w,
        background: "var(--border-soft)",
        borderRadius: 3,
        opacity:    0.6,
      }}
    />
  )
}

function SkeletonCard() {
  return (
    <TffCard>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SkeletonLine w="40%" h={9} />
        <SkeletonLine w="55%" h={28} />
        <SkeletonLine w="70%" h={9} />
      </div>
    </TffCard>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardCommandCenter() {
  const today  = useMemo(() => todayLocalDate(), [])
  const [status, setStatus] = useState<SyncStatus>("syncing")
  const [data,   setData]   = useState<CommandData | null>(null)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setStatus("unauthenticated")
      return
    }

    Promise.allSettled([
      fetchProgressData(),
      fetchRecentProgressSnapshots(14),
      fetchMacroProfile(),
      fetchDailyFuelLog(today),
      fetchSupplementScheduleItems(),
      fetchSupplementCompletionsForDate(today),
      fetchProtocolTracking(),
      fetchBloodworkTests(),
    ]).then((results) => {
      const [
        progressRes, snapshotsRes, macroRes, fuelRes,
        suppItemsRes, suppCompRes, protocolsRes, bloodworkRes,
      ] = results

      const progressResult = progressRes.status === "fulfilled" ? progressRes.value : null
      if (progressResult?.ok === false && progressResult.reason === "unauthenticated") {
        setStatus("unauthenticated")
        return
      }

      setData({
        today,
        progress:
          progressResult?.ok ? progressResult.data : null,
        snapshots:
          snapshotsRes.status === "fulfilled" && snapshotsRes.value.ok
            ? snapshotsRes.value.snapshots : [],
        macroProfile:
          macroRes.status === "fulfilled" && macroRes.value.ok
            ? macroRes.value.profile : null,
        fuelLog:
          fuelRes.status === "fulfilled" && fuelRes.value.ok
            ? fuelRes.value.log : null,
        suppItems:
          suppItemsRes.status === "fulfilled" && suppItemsRes.value.ok
            ? suppItemsRes.value.items : [],
        suppCompletions:
          suppCompRes.status === "fulfilled" && suppCompRes.value.ok
            ? suppCompRes.value.completions : [],
        protocols:
          protocolsRes.status === "fulfilled" && protocolsRes.value.ok
            ? protocolsRes.value.data : [],
        bloodworkTests:
          bloodworkRes.status === "fulfilled" && bloodworkRes.value.ok
            ? bloodworkRes.value.tests : [],
      })
      setStatus("synced")
    })
  }, [today])

  // ── Loading ───────────────────────────────────────────────────────────────

  if (status === "syncing") {
    return (
      <div>
        <SectionHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Command Center
            <SyncBadge status="syncing" />
          </div>
        </SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────

  if (status === "unauthenticated") {
    return (
      <div>
        <SectionHeader>Command Center</SectionHeader>
        <TffCard>
          <div
            style={{
              display:        "flex",
              alignItems:     "flex-start",
              justifyContent: "space-between",
              gap:            16,
              flexWrap:       "wrap",
            }}
          >
            <div>
              <TffCardHeader>Sign in to unlock tracking</TffCardHeader>
              <p
                style={{
                  fontSize:  "var(--t-small)",
                  color:     "var(--text-3)",
                  maxWidth:  440,
                  lineHeight: 1.55,
                  margin:    0,
                }}
              >
                Daily progress, streaks, fuel tracking, supplement schedule, active protocols,
                and bloodwork are available after sign-in. Local data merges automatically.
              </p>
            </div>
            <Link href="/login" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Sign In
            </Link>
          </div>
        </TffCard>
      </div>
    )
  }

  if (!data) return null

  // ── Derived values ────────────────────────────────────────────────────────

  const score   = data.progress ? calcScore(data.progress) : null
  const streaks = data.snapshots.length > 0 ? calculateStreaks(data.snapshots, today)      : null
  const weekly  = data.snapshots.length > 0 ? calculateWeeklyStats(data.snapshots, today)  : null

  const completedIds = new Set(
    data.suppCompletions.filter((c) => c.completed).map((c) => c.item_id)
  )
  const suppAdherence = calculateSupplementAdherence(data.suppItems, completedIds)

  const activeProtocols    = data.protocols.filter((p) => p.status === "active")
  const pausedProtocols    = data.protocols.filter((p) => p.status === "paused")
  const completedProtocols = data.protocols.filter((p) => p.status === "completed")

  const totalBWResults = data.bloodworkTests.reduce((s, t) => s + t.result_count, 0)
  const mostRecentBW   = data.bloodworkTests.length > 0 ? data.bloodworkTests[0].test_date : null

  // Macro & fuel for today
  const macroTarget =
    data.fuelLog && data.macroProfile
      ? data.fuelLog.day_type === "training"
        ? data.macroProfile.training
        : data.macroProfile.rest
      : null
  const fuelCompliance =
    data.fuelLog && macroTarget
      ? calculateMacroCompliance(data.fuelLog.totals, macroTarget)
      : null

  // Score presentation
  const scoreStr: string   = score === null ? "—" : String(score)
  const scoreVariant: "core" | "depends" | "warn" =
    score === null ? "warn" :
    score >= STREAK_THRESHOLD ? "core" :
    score >= 50 ? "depends" : "warn"
  const barVariant: "default" | "warn" | "danger" =
    score === null ? "danger" :
    score >= STREAK_THRESHOLD ? "default" :
    score >= 50 ? "warn" : "danger"

  // Setup gaps (factual only)
  const gaps: string[] = []
  if (!data.macroProfile) {
    gaps.push("Macro targets not set.")
  } else {
    const t = data.macroProfile.training
    if (t.calories === null && t.protein_g === null && t.carbs_g === null && t.fat_g === null) {
      gaps.push("Macro targets not set.")
    }
  }
  if (data.suppItems.filter((i) => i.is_active).length === 0) gaps.push("No active supplement items.")
  if (activeProtocols.length === 0)    gaps.push("No active protocols.")
  if (data.bloodworkTests.length === 0) gaps.push("No bloodwork tests logged.")
  if (data.snapshots.length === 0)     gaps.push("Daily progress not yet tracked — visit /progress to start.")

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <SectionHeader>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Command Center
          <SyncBadge status={status} />
        </div>
      </SectionHeader>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        {/* ── 1. Today's Execution ─────────────────────────────────────────── */}
        <TffCard>
          <CardHead label="Today's Execution" href="/progress" />
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Score column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 80 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span
                  className="mono"
                  style={{ fontSize: 42, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}
                >
                  {scoreStr}
                </span>
                <span style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>/100</span>
              </div>
              <TffBadge variant={scoreVariant}>
                {score === null
                  ? "No data"
                  : score >= STREAK_THRESHOLD ? "On Track"
                  : score >= 50 ? "Partial"
                  : "Behind"}
              </TffBadge>
              {score !== null && (
                <div style={{ width: 100 }}>
                  <TffProgress value={score} variant={barVariant} />
                </div>
              )}
            </div>

            {/* Sub-stats column */}
            {data.progress ? (
              <div
                style={{
                  display:             "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                  gap:                 14,
                  flex:                1,
                  minWidth:            200,
                  alignContent:        "start",
                }}
              >
                <Stat
                  value={`${data.progress.checklist.completedToday}/${CHECKLIST_TOTAL}`}
                  label="Checklist"
                />
                <Stat
                  value={data.progress.routines.doneToday}
                  label={
                    data.progress.routines.activeToday > 0
                      ? `Routines done (${data.progress.routines.activeToday} active)`
                      : "Routines done"
                  }
                />
                <Stat
                  value={data.progress.protocols.active}
                  label="Active protocols"
                />
              </div>
            ) : (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No progress data for today — visit{" "}
                <Link href="/progress" style={{ color: "var(--accent)" }}>
                  /progress
                </Link>{" "}
                to record.
              </p>
            )}
          </div>
          <p
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", marginTop: 12, letterSpacing: "0.08em" }}
          >
            {today} · SCORE ≥ {STREAK_THRESHOLD} = SUCCESSFUL DAY
          </p>
        </TffCard>

        {/* ── 2+3. Streak & Macro (2-col) ──────────────────────────────────── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap:                 10,
          }}
        >
          {/* Streak & Consistency */}
          <TffCard>
            <CardHead label="Streak & Consistency" href="/weekly-review" />
            {!streaks ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No snapshots yet. Visit{" "}
                <Link href="/progress" style={{ color: "var(--accent)" }}>/progress</Link>{" "}
                daily to build your history.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Stat value={streaks.currentStreak} label="Current streak"  accent />
                <Stat value={streaks.bestStreak}    label="Best streak" />
                <Stat value={weekly?.averageScore ?? "—"} label="Avg score 7d"       accent />
                <Stat
                  value={weekly ? `${weekly.successfulDays}/7` : "—"}
                  label="Successful days"
                />
              </div>
            )}
            <p
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", marginTop: 12, letterSpacing: "0.08em" }}
            >
              STREAK THRESHOLD: SCORE ≥ {STREAK_THRESHOLD}
            </p>
          </TffCard>

          {/* Macro & Fuel */}
          <TffCard>
            <CardHead label="Macro & Fuel" href="/fuel" />
            {!data.macroProfile ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                Set macro targets to unlock fuel score.
              </p>
            ) : !data.fuelLog ? (
              <div>
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: "0 0 8px" }}>
                  No fuel logged for today.
                </p>
                <TffBadge variant="na">Not logged</TffBadge>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <TffBadge variant={data.fuelLog.day_type === "training" ? "core" : "default"}>
                    {data.fuelLog.day_type === "training" ? "Training Day" : "Rest Day"}
                  </TffBadge>
                  {fuelCompliance !== null && (
                    <TffBadge
                      variant={
                        fuelCompliance >= STREAK_THRESHOLD ? "core"
                        : fuelCompliance >= 50 ? "depends"
                        : "warn"
                      }
                    >
                      {fuelCompliance}% compliance
                    </TffBadge>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Stat
                    value={data.fuelLog.totals.calories}
                    label={`/ ${macroTarget?.calories ?? "—"} kcal`}
                    accent
                  />
                  <Stat
                    value={`${data.fuelLog.totals.protein_g}g`}
                    label={`/ ${macroTarget?.protein_g ?? "—"}g protein`}
                  />
                </div>
              </div>
            )}
          </TffCard>
        </div>

        {/* ── 4+5. Supplements & Protocols (2-col) ─────────────────────────── */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap:                 10,
          }}
        >
          {/* Supplement Schedule */}
          <TffCard>
            <CardHead label="Supplement Schedule" href="/supplement-schedule" />
            {suppAdherence.active === 0 ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No active supplement items yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <Stat value={suppAdherence.completed} label="Completed" accent />
                  <Stat value={Math.max(0, suppAdherence.active - suppAdherence.completed)} label="Remaining" />
                  <Stat value={suppAdherence.active} label="Active items" />
                </div>
                <div>
                  <div
                    style={{
                      display:        "flex",
                      justifyContent: "space-between",
                      marginBottom:   4,
                    }}
                  >
                    <span
                      className="mono"
                      style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
                    >
                      TODAY'S ADHERENCE
                    </span>
                    <span
                      className="mono"
                      style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "0.06em" }}
                    >
                      {suppAdherence.adherencePct}%
                    </span>
                  </div>
                  <TffProgress
                    value={suppAdherence.adherencePct}
                    variant={suppAdherence.adherencePct >= STREAK_THRESHOLD ? "default" : "warn"}
                  />
                </div>
              </div>
            )}
          </TffCard>

          {/* Active Protocols */}
          <TffCard>
            <CardHead label="Active Protocols" href="/protocols" />
            {data.protocols.length === 0 ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No protocols tracked yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {activeProtocols.length    > 0 && <Stat value={activeProtocols.length}    label="Active"    accent />}
                  {pausedProtocols.length    > 0 && <Stat value={pausedProtocols.length}    label="Paused" />}
                  {completedProtocols.length > 0 && <Stat value={completedProtocols.length} label="Completed" />}
                </div>
                {activeProtocols.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {activeProtocols.slice(0, 3).map((p) => (
                      <div key={p.protocol_id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span
                          style={{
                            width:        5,
                            height:       5,
                            borderRadius: "50%",
                            background:   "var(--accent)",
                            flexShrink:   0,
                          }}
                        />
                        <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
                          {PROTOCOL_NAME[p.protocol_id] ?? p.protocol_id}
                        </span>
                      </div>
                    ))}
                    {activeProtocols.length > 3 && (
                      <span style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", paddingLeft: 12 }}>
                        +{activeProtocols.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </TffCard>
        </div>

        {/* ── 6. Bloodwork ─────────────────────────────────────────────────── */}
        <TffCard>
          <CardHead label="Bloodwork" href="/bloodwork-tracking" />
          {data.bloodworkTests.length === 0 ? (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
              No bloodwork tests logged yet.
            </p>
          ) : (
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <Stat value={data.bloodworkTests.length} label="Tests logged"   accent />
              <Stat value={totalBWResults}             label="Total markers" />
              <Stat value={mostRecentBW ?? "—"}        label="Most recent" />
            </div>
          )}
          <p
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", marginTop: 10, letterSpacing: "0.08em" }}
          >
            OBJECTIVE DATA ONLY — NO DIAGNOSIS, NO RANGE INTERPRETATION
          </p>
        </TffCard>

        {/* ── 7. Setup Status (only if gaps exist) ─────────────────────────── */}
        {gaps.length > 0 && (
          <TffCard>
            <TffCardHeader>Setup Status</TffCardHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {gaps.map((gap, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize:       9,
                      color:          "var(--text-4)",
                      letterSpacing:  "0.08em",
                      flexShrink:     0,
                    }}
                  >
                    ·
                  </span>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
                    {gap}
                  </span>
                </div>
              ))}
            </div>
            <p
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", marginTop: 10, letterSpacing: "0.08em" }}
            >
              FACTUAL STATUS ONLY — NO COACHING OR RECOMMENDATIONS
            </p>
          </TffCard>
        )}
      </div>
    </div>
  )
}

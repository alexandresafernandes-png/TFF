"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import {
  fetchRecentProgressSnapshots,
  calculateWeeklyStats,
  todayLocalDate,
  STREAK_THRESHOLD,
  CHECKLIST_TOTAL,
  type WeeklyStats,
  type WeeklyDayEntry,
} from "@/lib/supabase/progress-sync"

// ── Sub-components ─────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "var(--accent)"
  if (score >= 50) return "var(--warn)"
  return "var(--danger)"
}

function Bar({ pct, accent = false }: { pct: number; accent?: boolean }) {
  return (
    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.round(Math.min(pct, 1) * 100)}%`,
          background: accent ? "var(--accent)" : "var(--text-3)",
          borderRadius: 2,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  )
}

function StatBlock({
  value,
  label,
  color,
}: {
  value: number | string
  label: string
  color?: string
}) {
  return (
    <div>
      <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: color ?? "var(--text)" }}>
        {value}
      </span>
      <p
        className="mono"
        style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}
      >
        {label}
      </p>
    </div>
  )
}

function buildInsights(weekly: WeeklyStats): string[] {
  if (weekly.daysTracked === 0) {
    return [
      "No weekly data yet. Log Daily Progress for a few days to unlock the review.",
    ]
  }

  const insights: string[] = []

  const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? "s" : ""}`

  insights.push(
    `${weekly.successfulDays} of ${weekly.daysTracked} tracked ${
      weekly.daysTracked !== 1 ? "days" : "day"
    } reached the ${STREAK_THRESHOLD}+ threshold.`,
  )

  if (weekly.bestDay) {
    const day = new Date(`${weekly.bestDay.date}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    })
    insights.push(`Best tracked day: ${day} with a score of ${weekly.bestDay.score}.`)
  }

  if (weekly.totalChecklistPossible > 0) {
    const pct = Math.round(
      (weekly.totalChecklistCompleted / weekly.totalChecklistPossible) * 100,
    )
    insights.push(`Checklist completion: ${pct}% across tracked days.`)
  }

  const missing = 7 - weekly.daysTracked
  if (missing > 0) {
    insights.push(`${plural(missing, "day")} in the last 7 had no tracking data.`)
  }

  return insights
}

function DayRow({ entry }: { entry: WeeklyDayEntry }) {
  const { date, snapshot } = entry
  const dt      = new Date(`${date}T12:00:00`)
  const dayAbbr = dt.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const hasData = snapshot !== null
  const success = hasData && snapshot.score >= STREAK_THRESHOLD

  return (
    <div
      style={{
        padding: "12px 14px",
        background: success ? "var(--accent-soft)" : "var(--panel-2)",
        border: `1px ${hasData ? "solid" : "dashed"} ${
          success ? "var(--accent-line)" : "var(--border-soft)"
        }`,
        borderRadius: 4,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: hasData ? 7 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            className="mono"
            style={{ fontSize: 10, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.08em" }}
          >
            {dayAbbr}
          </span>
          <span
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}
          >
            {dateStr}
          </span>
        </div>
        {hasData ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: scoreColor(snapshot.score),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {snapshot.score}
            </span>
            <TffBadge variant={success ? "core" : "default"}>
              {success ? "✓" : "✗"}
            </TffBadge>
          </div>
        ) : (
          <span
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
          >
            NO DATA
          </span>
        )}
      </div>

      {/* Detail line */}
      {hasData && (
        <p
          className="mono"
          style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.06em", lineHeight: 1.6 }}
        >
          checklist {snapshot.checklist_completed}/{snapshot.checklist_total || CHECKLIST_TOTAL}
          {" · "}
          routines {snapshot.routines_completed} done / {snapshot.routines_active} active
          {" · "}
          protocols {snapshot.protocols_active} active
          {snapshot.notes_count > 0 ? ` · notes ${snapshot.notes_count}` : ""}
        </p>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 12 / WEEKLY"
        title="Weekly Review"
        subtitle="Loading weekly summary…"
      />
      {[0, 1, 2, 3].map((i) => (
        <TffCard key={i}>
          <div
            style={{
              height: 64,
              background: "var(--border-soft)",
              borderRadius: 4,
              opacity: 0.5,
            }}
          />
        </TffCard>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WeeklyReviewPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing")
  const [weekly, setWeekly]         = useState<WeeklyStats | null>(null)

  useEffect(() => {
    const today = todayLocalDate()
    fetchRecentProgressSnapshots(7).then((result) => {
      if (result.ok) {
        setWeekly(calculateWeeklyStats(result.snapshots, today))
        setSyncStatus("synced")
      } else {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
      }
    })
  }, [])

  if (syncStatus === "syncing") return <Skeleton />

  // ── Error / unauthenticated ───────────────────────────────────────────────────
  if (syncStatus !== "synced" || weekly === null) {
    return (
      <div className="stack-lg">
        <PageHeader
          crumb="INDEX · 12 / WEEKLY"
          title="Weekly Review"
          subtitle="Last 7 days of Daily Progress snapshots."
        />
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
            {syncStatus === "unauthenticated"
              ? "Sign in to view your weekly review."
              : "Could not load weekly data. Check your connection and try again."}
          </p>
        </TffCard>
      </div>
    )
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const checklistPct =
    weekly.totalChecklistPossible > 0
      ? weekly.totalChecklistCompleted / weekly.totalChecklistPossible
      : 0
  const routineEngaged = weekly.totalRoutinesCompleted + weekly.totalRoutinesActive
  const routinePct     = routineEngaged > 0 ? weekly.totalRoutinesCompleted / routineEngaged : 0
  const insights       = buildInsights(weekly)

  function fmtDay(dateStr: string) {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 12 / WEEKLY"
        title="Weekly Review"
        subtitle="Last 7 days of Daily Progress snapshots."
      />

      {/* ── A. Weekly Score Summary ───────────────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span className="label" style={{ margin: 0 }}>Weekly Score Summary</span>
          <SyncBadge status={syncStatus} />
        </div>

        {weekly.daysTracked === 0 ? (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
            No tracking data for the last 7 days. Visit Daily Progress to start recording.
          </p>
        ) : (
          <>
            {/* Primary stats */}
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <span
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: scoreColor(weekly.averageScore),
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {weekly.averageScore}
                </span>
                <p
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 4 }}
                >
                  AVG SCORE
                </p>
              </div>
              <StatBlock
                value={`${weekly.successfulDays} / ${weekly.daysTracked}`}
                label="SUCCESSFUL DAYS"
                color={weekly.successfulDays > 0 ? "var(--accent)" : "var(--text)"}
              />
              <StatBlock value={`${weekly.daysTracked} / 7`} label="DAYS TRACKED" />
            </div>

            {/* Best / Weakest */}
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                paddingTop: 12,
                borderTop: "1px solid var(--border-soft)",
              }}
            >
              <div>
                <span
                  style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}
                >
                  {weekly.bestDay ? weekly.bestDay.score : "—"}
                </span>
                <p
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}
                >
                  BEST · {weekly.bestDay ? fmtDay(weekly.bestDay.date) : "—"}
                </p>
              </div>
              <div>
                <span
                  style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text-3)" }}
                >
                  {weekly.weakestDay ? weekly.weakestDay.score : "—"}
                </span>
                <p
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}
                >
                  WEAKEST · {weekly.weakestDay ? fmtDay(weekly.weakestDay.date) : "—"}
                </p>
              </div>
            </div>

            <p
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 14 }}
            >
              SCORE ≥ {STREAK_THRESHOLD} = SUCCESSFUL DAY
            </p>
          </>
        )}
      </TffCard>

      {/* ── B. Consistency Breakdown ──────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Consistency Breakdown</TffCardHeader>

        {weekly.daysTracked === 0 ? (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>—</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Checklist */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}
                >
                  CHECKLIST
                </span>
                <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                  {weekly.totalChecklistCompleted} / {weekly.totalChecklistPossible}
                </span>
              </div>
              <Bar pct={checklistPct} accent />
              <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 3 }}>
                {Math.round(checklistPct * 100)}% of possible items completed across{" "}
                {weekly.daysTracked} tracked day{weekly.daysTracked !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Routines */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}
                >
                  ROUTINES
                </span>
                <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                  {weekly.totalRoutinesCompleted} done · {weekly.totalRoutinesActive} active
                </span>
              </div>
              {routineEngaged > 0 ? (
                <>
                  <Bar pct={routinePct} />
                  <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 3 }}>
                    {Math.round(routinePct * 100)}% completion rate (done / engaged)
                  </p>
                </>
              ) : (
                <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)" }}>
                  No routine data recorded this week.
                </p>
              )}
            </div>

            {/* Protocols */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}
                >
                  PROTOCOLS
                </span>
                <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                  {weekly.totalProtocolsActive} active-days · {weekly.totalProtocolsCompleted}{" "}
                  completed-days
                </span>
              </div>
              <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)" }}>
                Sum across {weekly.daysTracked} tracked day
                {weekly.daysTracked !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Notes */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span
                  className="mono"
                  style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}
                >
                  NOTES
                </span>
                <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                  {weekly.totalNotes} total
                </span>
              </div>
            </div>
          </div>
        )}
      </TffCard>

      {/* ── C. Last 7 Days ────────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Last 7 Days</TffCardHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {weekly.days.map((entry) => (
            <DayRow key={entry.date} entry={entry} />
          ))}
        </div>
      </TffCard>

      {/* ── D. Weekly Insight ─────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Weekly Insight</TffCardHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((insight, i) => (
            <div key={`insight-${i}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span
                className="mono"
                style={{
                  fontSize: 8,
                  color: "var(--accent)",
                  flexShrink: 0,
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                ▸
              </span>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", lineHeight: 1.55 }}>
                {insight}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 14 }}>
          Objective summaries from snapshot data only. No recommendations or advice.
        </p>
      </TffCard>
    </div>
  )
}

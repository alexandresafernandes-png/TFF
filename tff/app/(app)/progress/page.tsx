"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import {
  fetchProgressData,
  fetchRecentProgressSnapshots,
  upsertDailyProgressSnapshot,
  calculateStreaks,
  calcScore,
  todayLocalDate,
  CHECKLIST_TOTAL,
  STREAK_THRESHOLD,
  type ProgressData,
  type StreakData,
} from "@/lib/supabase/progress-sync"

// ── Sub-components ─────────────────────────────────────────────────────────────

function Bar({ pct, accent = false }: { pct: number; accent?: boolean }) {
  return (
    <div
      style={{
        height: 4,
        background: "var(--border)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.round(pct * 100)}%`,
          background: accent ? "var(--accent)" : "var(--text-3)",
          borderRadius: 2,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  )
}

function ScoreDisplay({ score }: { score: number }) {
  const color =
    score >= 80 ? "var(--accent)" :
    score >= 50 ? "var(--warn)"   :
    "var(--danger)"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span
        style={{
          fontSize: 52,
          fontWeight: 700,
          color,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {score}
      </span>
      <span
        className="mono"
        style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.12em" }}
      >
        / 100
      </span>
    </div>
  )
}

function StatBlock({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)" }}>
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

function Skeleton() {
  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 11 / PROGRESS"
        title="Daily Progress"
        subtitle="Loading today's data…"
      />
      {[0, 1, 2, 3].map((i) => (
        <TffCard key={i}>
          <div
            style={{
              height: 60,
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

export default function ProgressPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing")
  const [data, setData]             = useState<ProgressData | null>(null)
  const [streaks, setStreaks]       = useState<StreakData | null>(null)

  useEffect(() => {
    const today = todayLocalDate()

    Promise.allSettled([
      fetchProgressData(),
      fetchRecentProgressSnapshots(14),
    ]).then(([dataRes, snapsRes]) => {
      // ── Today's data ──────────────────────────────────────────────────────
      if (dataRes.status === "fulfilled" && dataRes.value.ok) {
        const d = dataRes.value.data
        setData(d)
        setSyncStatus("synced")
        // Fire-and-forget snapshot upsert
        void upsertDailyProgressSnapshot(d)
      } else {
        let reason: "unauthenticated" | "error" = "error"
        if (dataRes.status === "fulfilled" && !dataRes.value.ok) {
          reason = dataRes.value.reason
        }
        setSyncStatus(reason === "unauthenticated" ? "unauthenticated" : "error")
      }

      // ── Recent snapshots → streaks ─────────────────────────────────────────
      if (snapsRes.status === "fulfilled" && snapsRes.value.ok) {
        setStreaks(calculateStreaks(snapsRes.value.snapshots, today))
      }
    })
  }, [])

  if (syncStatus === "syncing") return <Skeleton />

  const score        = data ? calcScore(data) : 0
  const checklistPct = data ? Math.min(data.checklist.completedToday / CHECKLIST_TOTAL, 1) : 0
  const totalToday   = data ? data.routines.doneToday + data.routines.activeToday : 0
  const routinePct   = totalToday > 0
    ? Math.min((data?.routines.doneToday ?? 0) / totalToday, 1)
    : 0

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 11 / PROGRESS"
        title="Daily Progress"
        subtitle="Today's execution score and completion summary."
      />

      {/* ── A. Daily Execution Score ──────────────────────────────────────── */}
      <TffCard>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span className="label" style={{ margin: 0 }}>Daily Execution Score</span>
              <SyncBadge status={syncStatus} />
            </div>

            {syncStatus === "error" || syncStatus === "unauthenticated" ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
                {syncStatus === "unauthenticated"
                  ? "Sign in to view your daily score."
                  : "Could not load data. Check your connection."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Checklist */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                      CHECKLIST · {Math.round(checklistPct * 70)} / 70 PTS
                    </span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                      {data?.checklist.completedToday ?? 0} / {CHECKLIST_TOTAL}
                    </span>
                  </div>
                  <Bar pct={checklistPct} accent />
                </div>

                {/* Routines */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                      ROUTINES · {Math.min((data?.routines.doneToday ?? 0) * 5, 20)} / 20 PTS
                    </span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                      {data?.routines.doneToday ?? 0} done
                    </span>
                  </div>
                  <Bar pct={Math.min((data?.routines.doneToday ?? 0) / 4, 1)} />
                </div>

                {/* Protocols */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                      PROTOCOLS · {(data?.protocols.active ?? 0) > 0 ? 10 : 0} / 10 PTS
                    </span>
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                      {data?.protocols.active ?? 0} active
                    </span>
                  </div>
                  <Bar pct={(data?.protocols.active ?? 0) > 0 ? 1 : 0} />
                </div>
              </div>
            )}
          </div>

          {data && syncStatus === "synced" && <ScoreDisplay score={score} />}
        </div>
      </TffCard>

      {/* ── B. Checklist Today ────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Checklist Today</TffCardHeader>
        {data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)" }}>
                {data.checklist.completedToday}
                <span style={{ fontSize: "var(--t-small)", color: "var(--text-4)", fontWeight: 400 }}>
                  {" "}/ {CHECKLIST_TOTAL}
                </span>
              </span>
              <TffBadge
                variant={
                  data.checklist.completedToday >= CHECKLIST_TOTAL
                    ? "core"
                    : data.checklist.completedToday > 0
                    ? "default"
                    : "na"
                }
              >
                {data.checklist.completedToday >= CHECKLIST_TOTAL
                  ? "Complete"
                  : data.checklist.completedToday > 0
                  ? "In Progress"
                  : "Not Started"}
              </TffBadge>
            </div>
            <Bar pct={checklistPct} accent />
            <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)" }}>
              {CHECKLIST_TOTAL} items across 7 habit groups · 70 pts max
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>—</p>
        )}
      </TffCard>

      {/* ── C. Routines Today ────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Routines Today</TffCardHeader>
        {data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 24 }}>
              <StatBlock value={data.routines.doneToday} label="DONE" />
              <div>
                <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text-3)" }}>
                  {data.routines.activeToday}
                </span>
                <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
                  IN PROGRESS
                </p>
              </div>
            </div>
            {totalToday > 0 && <Bar pct={routinePct} />}
            <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)" }}>
              5 pts per completed routine · 20 pts max
            </p>
          </div>
        ) : (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>—</p>
        )}
      </TffCard>

      {/* ── D. Protocols ─────────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Protocols</TffCardHeader>
        {data ? (
          <div style={{ display: "flex", gap: 24 }}>
            <StatBlock value={data.protocols.active} label="ACTIVE" />
            <div>
              <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text-3)" }}>
                {data.protocols.paused}
              </span>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
                PAUSED
              </p>
            </div>
            <div>
              <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text-3)" }}>
                {data.protocols.completed}
              </span>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
                COMPLETED
              </p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>—</p>
        )}
      </TffCard>

      {/* ── E. Notes Today (conditional) ─────────────────────────────────── */}
      {data && data.notesToday.length > 0 && (
        <TffCard>
          <TffCardHeader>Notes Today</TffCardHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.notesToday.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: "10px 12px",
                  background: "var(--panel-2)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 4,
                }}
              >
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-2)",
                    lineHeight: 1.55,
                    margin: "0 0 4px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {note.body}
                </p>
                <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.06em" }}>
                  {note.area}{note.entity_id ? ` · ${note.entity_id}` : ""}
                </span>
              </div>
            ))}
          </div>
        </TffCard>
      )}

      {/* ── F. Streak Engine ─────────────────────────────────────────────── */}
      <TffCard>
        <TffCardHeader>Streak Engine</TffCardHeader>

        <p
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--text-4)",
            letterSpacing: "0.08em",
            marginBottom: 18,
          }}
        >
          STREAK DAY = DAILY EXECUTION SCORE ≥ {STREAK_THRESHOLD}
        </p>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <span
              style={{
                fontSize: "var(--t-h2)",
                fontWeight: 700,
                color: (streaks?.currentStreak ?? 0) > 0 ? "var(--accent)" : "var(--text)",
              }}
            >
              {streaks !== null ? streaks.currentStreak : "—"}
            </span>
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
              CURRENT STREAK
            </p>
          </div>
          <div>
            <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)" }}>
              {streaks !== null ? streaks.bestStreak : "—"}
            </span>
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
              BEST STREAK
            </p>
          </div>
          <div>
            <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)" }}>
              {streaks !== null ? streaks.averageLast7 : "—"}
            </span>
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
              AVG (7D)
            </p>
          </div>
          <div>
            <span style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text-3)" }}>
              {streaks !== null ? streaks.daysTracked : "—"}
            </span>
            <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginTop: 2 }}>
              DAYS TRACKED
            </p>
          </div>
        </div>

        {/* ── Last 7 days ───────────────────────────────────────────────── */}
        <p className="label" style={{ marginBottom: 8 }}>Last 7 Days</p>

        {streaks === null ? (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>Loading history…</p>
        ) : streaks.daysTracked === 0 ? (
          <div
            style={{
              padding: "14px 16px",
              background: "var(--panel-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
            }}
          >
            <p
              className="mono"
              style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}
            >
              HISTORY STARTS TODAY
            </p>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
              Today&apos;s snapshot has been saved. Return tomorrow to see your first streak day.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 4,
            }}
          >
            {streaks.last7.map((day) => {
              const hasData = day.score !== null
              return (
                <div
                  key={day.date}
                  style={{
                    padding: "8px 4px",
                    background: day.success ? "var(--accent-soft)" : "var(--panel-2)",
                    border: `1px ${hasData ? "solid" : "dashed"} ${
                      day.success
                        ? "var(--accent-line)"
                        : "var(--border-soft)"
                    }`,
                    borderRadius: 4,
                    textAlign: "center",
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      fontSize: 7,
                      color: "var(--text-4)",
                      letterSpacing: "0.06em",
                      marginBottom: 5,
                    }}
                  >
                    {/* Use T12:00:00 to avoid UTC-midnight timezone flip */}
                    {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1,
                      color: day.success
                        ? "var(--accent)"
                        : hasData
                        ? "var(--text-3)"
                        : "var(--text-4)",
                    }}
                  >
                    {hasData ? Math.round(day.score as number) : "—"}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <p
          style={{
            fontSize: "var(--t-micro)",
            color: "var(--text-4)",
            marginTop: 12,
          }}
        >
          Trend charts and weekly analytics coming in Phase 2.5.
        </p>
      </TffCard>
    </div>
  )
}

"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { StatCard } from "@/components/tff/StatCard"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import {
  fetchProtocolTracking,
  upsertProtocolTracking,
  type ProtocolStatus,
} from "@/lib/supabase/protocols-sync"
import protocolsRaw from "@/data/protocols.json"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProtocolStep {
  order: number
  text: string
}

interface Protocol {
  id: string
  name: string
  protocol_number: number
  category: string
  goal: string
  priority: string   // "critical" | "core" | "advanced"
  source_refs: string[]
  steps: ProtocolStep[]
  timing: string
  items_needed: string[]
  cautions: string[]
  checklist_ready: boolean
  advanced: boolean
  tags: string[]
}

type Difficulty = "Beginner" | "Intermediate" | "Advanced"

interface TrackingEntry {
  status: ProtocolStatus
  started_at: string | null
  ended_at: string | null
  notes: string
}

const EMPTY_ENTRY: TrackingEntry = { status: "inactive", started_at: null, ended_at: null, notes: "" }

// ── Data ──────────────────────────────────────────────────────────────────────

const PROTOCOLS = protocolsRaw as unknown as Protocol[]

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  sleep:       "Sleep & Recovery",
  nutrition:   "Nutrition & Fuel",
  testosterone:"Testosterone & Hormones",
  gut:         "Gut Health",
  hair:        "Hair & Scalp",
  blood_work:  "Blood Work",
  dht:         "DHT Optimization",
}

// Intentional display order — foundational first, advanced last
const CATEGORY_ORDER = [
  "sleep",
  "nutrition",
  "testosterone",
  "gut",
  "hair",
  "blood_work",
  "dht",
]

// Protocols shown in the "Start Here" strip
const RECOMMENDED_IDS = [
  "protocol_9_hormone_diet",          // #1 — dietary foundation
  "protocol_1_sleep_stack",           // sleep quality
  "protocol_2_morning_light",         // circadian anchor
  "protocol_13_stress_management",    // cortisol control
  "protocol_3_pre_workout_nutrition", // training performance
]

// ── LocalStorage key ──────────────────────────────────────────────────────────

const LS_TRACKING = "tff_protocol_tracking"

// ── Stats (computed once at module level) ─────────────────────────────────────

const TOTAL      = PROTOCOLS.length
const PHASE1     = PROTOCOLS.filter((p) => !p.advanced).length
const ADVANCED   = PROTOCOLS.filter((p) => p.advanced).length
const CATEGORIES = new Set(PROTOCOLS.map((p) => p.category)).size

// ── Helper functions ──────────────────────────────────────────────────────────

function getDifficulty(p: Protocol): Difficulty {
  if (p.advanced) return "Advanced"
  if (p.priority === "critical") return "Beginner"
  return "Intermediate"
}

function getPriorityLabel(p: Protocol): string {
  if (p.priority === "critical") return "Critical"
  if (p.priority === "advanced") return "Advanced"
  return "Core"
}

function getPriorityVariant(p: Protocol): "core" | "warn" | "na" {
  if (p.priority === "critical" || p.priority === "core") return "core"
  if (p.priority === "advanced") return "warn"
  return "na"
}

function getDifficultyVariant(d: Difficulty): "na" | "default" | "warn" {
  if (d === "Beginner")     return "na"
  if (d === "Intermediate") return "default"
  return "warn"
}

function timingShort(timing: string): string {
  const first = timing.split(";")[0].trim()
  return first.length > 44 ? first.slice(0, 41) + "…" : first
}

// Converts "snake_case_id" → "Snake Case Id"
function labelFromSlug(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// Splits a comma-list item (e.g. blood marker string) into individual chips
function itemChips(items: string[]): string[] {
  return items.flatMap((item) =>
    item.includes(",") ? item.split(",").map((s) => s.trim()).filter(Boolean) : [item]
  )
}

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ProtocolStatus, string> = {
  inactive:  "Not Active",
  active:    "Active",
  paused:    "Paused",
  completed: "Completed",
}

const STATUS_BADGE_VARIANT: Record<ProtocolStatus, "core" | "default" | "na"> = {
  inactive:  "na",
  active:    "core",
  paused:    "default",
  completed: "core",
}

// ── ProtocolDetail ────────────────────────────────────────────────────────────

function ProtocolDetail({
  p,
  tracking,
  onStatusChange,
  onNotesChange,
}: {
  p: Protocol
  tracking: TrackingEntry
  onStatusChange: (status: ProtocolStatus) => void
  onNotesChange: (notes: string) => void
}) {
  const [localNotes, setLocalNotes] = useState(tracking.notes)

  // Keep textarea in sync if external tracking changes (e.g. after initial cloud sync)
  useEffect(() => { setLocalNotes(tracking.notes) }, [tracking.notes])

  const chips = itemChips(p.items_needed)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Purpose */}
      <div>
        <p className="label" style={{ marginBottom: 8 }}>Purpose</p>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", lineHeight: 1.65 }}>
          {p.goal}
        </p>
      </div>

      {/* Timing */}
      <div>
        <p className="label" style={{ marginBottom: 8 }}>When &amp; How Often</p>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", lineHeight: 1.65 }}>
          {p.timing}
        </p>
      </div>

      {/* Steps */}
      <div>
        <p className="label" style={{ marginBottom: 8 }}>Step-by-Step</p>
        <div>
          {p.steps.map((step, idx) => (
            <div
              key={step.order}
              style={{
                display: "flex",
                gap: 14,
                padding: "9px 0",
                borderBottom:
                  idx < p.steps.length - 1 ? "1px solid var(--border-soft)" : "none",
                alignItems: "flex-start",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  fontWeight: 700,
                  flexShrink: 0,
                  minWidth: 20,
                  paddingTop: 2,
                }}
              >
                {String(step.order).padStart(2, "0")}
              </span>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-2)",
                  lineHeight: 1.55,
                  flex: 1,
                }}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cautions */}
      {p.cautions.length > 0 && (
        <div>
          <p className="label" style={{ marginBottom: 8 }}>Cautions &amp; Notes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {p.cautions.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "9px 13px",
                  background: "var(--card-2)",
                  borderRadius: 4,
                  borderLeft: "2px solid var(--warn)",
                }}
              >
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", lineHeight: 1.5 }}>
                  {c}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items & Supplements */}
      {chips.length > 0 && (
        <div>
          <p className="label" style={{ marginBottom: 8 }}>Items &amp; Supplements</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {chips.map((item, idx) => (
              <span key={idx} className="badge">
                {item.includes("_") ? labelFromSlug(item) : item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source refs */}
      {p.source_refs.length > 0 && (
        <div>
          <p className="label" style={{ marginBottom: 8 }}>Sources</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {p.source_refs.map((ref) => (
              <p
                key={ref}
                className="mono"
                style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.05em" }}
              >
                {ref}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Tracking */}
      <div>
        <p className="label" style={{ marginBottom: 10 }}>My Tracking</p>

        {/* Status buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {(["inactive", "active", "paused", "completed"] as ProtocolStatus[]).map((s) => {
            const active = tracking.status === s
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className="mono"
                style={{
                  padding: "5px 12px",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  border: "1px solid",
                  borderColor: active
                    ? s === "paused" ? "var(--warn)" : "var(--accent)"
                    : "var(--border)",
                  background: active
                    ? s === "paused" ? "rgba(245,158,11,0.12)" : "var(--accent-soft, rgba(var(--accent-rgb),0.12))"
                    : "transparent",
                  color: active
                    ? s === "paused" ? "var(--warn)" : "var(--accent)"
                    : "var(--text-4)",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              >
                {STATUS_LABELS[s].toUpperCase()}
              </button>
            )
          })}
        </div>

        {/* Date stamps */}
        {(tracking.started_at || tracking.ended_at) && (
          <p
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em", marginBottom: 10 }}
          >
            {tracking.started_at && `STARTED ${new Date(tracking.started_at).toLocaleDateString()}`}
            {tracking.started_at && tracking.ended_at && " · "}
            {tracking.ended_at && `ENDED ${new Date(tracking.ended_at).toLocaleDateString()}`}
          </p>
        )}

        {/* Notes textarea */}
        <textarea
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={() => { if (localNotes !== tracking.notes) onNotesChange(localNotes) }}
          placeholder="Personal notes — saved on blur…"
          rows={3}
          style={{
            width: "100%",
            padding: "8px 12px",
            fontSize: "var(--t-small)",
            background: "var(--panel-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            color: "var(--text)",
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            lineHeight: 1.5,
          }}
        />
      </div>
    </div>
  )
}

// ── ProtocolCard ──────────────────────────────────────────────────────────────

function ProtocolCard({
  p,
  expanded,
  onToggle,
  tracking,
  onStatusChange,
  onNotesChange,
}: {
  p: Protocol
  expanded: boolean
  onToggle: (id: string) => void
  tracking: TrackingEntry
  onStatusChange: (status: ProtocolStatus) => void
  onNotesChange: (notes: string) => void
}) {
  const difficulty = getDifficulty(p)

  return (
    <TffCard>
      {/* Badge row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <TffBadge variant="na">
            {CATEGORY_LABEL[p.category] ?? p.category}
          </TffBadge>
          <TffBadge variant={getPriorityVariant(p)}>{getPriorityLabel(p)}</TffBadge>
          {p.checklist_ready && (
            <TffBadge variant="core" dot>
              Checklist
            </TffBadge>
          )}
          {tracking.status !== "inactive" && (
            <TffBadge variant={STATUS_BADGE_VARIANT[tracking.status]}>
              {tracking.status === "active" ? "● " : ""}{STATUS_LABELS[tracking.status]}
            </TffBadge>
          )}
        </div>
        <TffBadge variant={getDifficultyVariant(difficulty)}>{difficulty}</TffBadge>
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: "var(--t-body)",
          fontWeight: 600,
          color: "var(--text)",
          lineHeight: 1.3,
          marginBottom: 5,
        }}
      >
        <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", marginRight: 8 }}>
          #{p.protocol_number}
        </span>
        {p.name}
      </p>

      {/* Goal */}
      <p
        style={{
          fontSize: "var(--t-small)",
          color: "var(--text-3)",
          lineHeight: 1.5,
          marginBottom: 14,
          // Soft-clip goal text to ~2 lines when collapsed
          maxHeight: expanded ? undefined : "40px",
          overflow:  expanded ? undefined : "hidden",
        }}
      >
        {p.goal}
      </p>

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <p
          className="mono"
          style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.07em" }}
        >
          {timingShort(p.timing).toUpperCase()}
        </p>

        <button
          className="btn btn-sm"
          style={
            expanded
              ? {}
              : {
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                  borderColor: "var(--accent-line)",
                }
          }
          onClick={() => onToggle(p.id)}
        >
          {expanded ? "Close ×" : "View Protocol →"}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            marginTop: 22,
            paddingTop: 22,
            borderTop: "1px solid var(--border)",
          }}
        >
          <ProtocolDetail
            p={p}
            tracking={tracking}
            onStatusChange={onStatusChange}
            onNotesChange={onNotesChange}
          />
        </div>
      )}
    </TffCard>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProtocolLibraryPage() {
  const [expandedId, setExpandedId]       = useState<string | null>(null)
  const [search, setSearch]               = useState("")
  const [catFilter, setCatFilter]         = useState("all")
  const [priFilter, setPriFilter]         = useState("all")
  const [diffFilter, setDiffFilter]       = useState("all")

  // Protocol tracking state
  const [tracking, setTracking]           = useState<Record<string, TrackingEntry>>({})
  const [loaded, setLoaded]               = useState(false)
  const [syncStatus, setSyncStatus]       = useState<SyncStatus>("idle")

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TRACKING)
      if (raw) setTracking(JSON.parse(raw) as Record<string, TrackingEntry>)
    } catch (_e) { /* ignore */ }
    setLoaded(true)
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(LS_TRACKING, JSON.stringify(tracking)) } catch (_e) { /* ignore */ }
  }, [tracking, loaded])

  // Initial cloud sync — runs once after hydration
  useEffect(() => {
    if (!loaded) return
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }
    setSyncStatus("syncing")

    fetchProtocolTracking().then((result) => {
      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }

      const rows = result.data

      if (rows.length === 0) {
        // Remote empty — upload non-inactive local entries in background
        Object.entries(tracking).forEach(([id, entry]) => {
          if (entry.status !== "inactive") void upsertProtocolTracking(id, entry)
        })
        setSyncStatus("synced")
        return
      }

      // Remote has data — merge into local state (remote wins for each tracked protocol)
      const updates: Record<string, TrackingEntry> = {}
      for (const row of rows) {
        updates[row.protocol_id] = {
          status: row.status,
          started_at: row.started_at,
          ended_at: row.ended_at,
          notes: row.notes ?? "",
        }
      }
      setTracking((prev) => ({ ...prev, ...updates }))
      setSyncStatus("synced")
    })
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutation handlers ────────────────────────────────────────────────────────

  function handleStatusChange(protocolId: string, newStatus: ProtocolStatus) {
    const current = tracking[protocolId] ?? EMPTY_ENTRY
    const now = new Date().toISOString()
    const updated: TrackingEntry = {
      ...current,
      status: newStatus,
      started_at:
        newStatus === "active" && !current.started_at ? now : current.started_at,
      ended_at:
        newStatus === "completed" ? (current.ended_at ?? now) :
        newStatus === "active"    ? null :
        current.ended_at,
    }
    setTracking((prev) => ({ ...prev, [protocolId]: updated }))
    void upsertProtocolTracking(protocolId, updated)
  }

  function handleNotesChange(protocolId: string, notes: string) {
    const current = tracking[protocolId] ?? EMPTY_ENTRY
    const updated: TrackingEntry = { ...current, notes }
    setTracking((prev) => ({ ...prev, [protocolId]: updated }))
    void upsertProtocolTracking(protocolId, updated)
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  // ── Filtering ───────────────────────────────────────────────────────────────
  const isFiltering =
    !!search.trim() ||
    catFilter  !== "all" ||
    priFilter  !== "all" ||
    diffFilter !== "all"

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PROTOCOLS.filter((p) => {
      if (q) {
        const haystack = [
          p.name, p.goal, p.category, p.timing,
          ...p.tags, ...p.items_needed,
        ].join(" ").toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (catFilter !== "all" && p.category !== catFilter) return false
      if (priFilter !== "all") {
        if (priFilter === "core"     && !["critical","core"].includes(p.priority)) return false
        if (priFilter === "advanced" && p.priority !== "advanced")                 return false
      }
      if (diffFilter !== "all") {
        const d = getDifficulty(p).toLowerCase()
        if (d !== diffFilter) return false
      }
      return true
    })
  }, [search, catFilter, priFilter, diffFilter])

  // Grouped by category for browse view
  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        cat,
        label: CATEGORY_LABEL[cat] ?? cat,
        protocols: filtered.filter((p) => p.category === cat),
      })).filter((g) => g.protocols.length > 0),
    [filtered]
  )

  function clearFilters() {
    setSearch("")
    setCatFilter("all")
    setPriFilter("all")
    setDiffFilter("all")
  }

  // Recommended protocols
  const recommended = useMemo(
    () =>
      RECOMMENDED_IDS.map((id) => PROTOCOLS.find((p) => p.id === id)).filter(
        (p): p is Protocol => p !== undefined
      ),
    []
  )

  const categories = CATEGORY_ORDER.filter((c) => PROTOCOLS.some((p) => p.category === c))

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 04 / PROTOCOLS"
        title="Protocol Library"
        subtitle="Structured TFF playbooks for sleep, training, recovery, nutrition, supplements, and lifestyle."
      />

      {/* ── Hero stats ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 8,
        }}
      >
        <StatCard label="Total"      count={TOTAL} />
        <StatCard label="Phase 1"    count={PHASE1} />
        <StatCard label="Advanced"   count={ADVANCED} />
        <StatCard label="Categories" count={CATEGORIES} />
      </div>

      {/* ── Recommended stack (browse mode only) ────────────────────────────── */}
      {!isFiltering && (
        <div>
          <SectionHeader>Start Here — Foundation Stack</SectionHeader>
          <TffCard>
            <TffCardHeader>Recommended Sequence</TffCardHeader>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-3)",
                marginBottom: 16,
                lineHeight: 1.55,
              }}
            >
              Build these five protocols before adding anything else. They form the
              dietary, sleep, hormonal, and stress foundation that every advanced
              protocol depends on.
            </p>

            <div>
              {recommended.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setExpandedId(p.id)
                    // Scroll to the card after React renders the expanded state
                    requestAnimationFrame(() =>
                      requestAnimationFrame(() => {
                        document
                          .getElementById(`proto-${p.id}`)
                          ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                      })
                    )
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      idx < recommended.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--accent)",
                      fontWeight: 700,
                      minWidth: 22,
                      flexShrink: 0,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "var(--t-small)",
                        fontWeight: 500,
                        color: "var(--text)",
                        lineHeight: 1.25,
                      }}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        fontSize: "var(--t-micro)",
                        color: "var(--text-4)",
                        marginTop: 2,
                      }}
                    >
                      {CATEGORY_LABEL[p.category] ?? p.category}
                    </p>
                  </div>
                  <TffBadge variant={getPriorityVariant(p)}>
                    {getPriorityLabel(p)}
                  </TffBadge>
                </div>
              ))}
            </div>
          </TffCard>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search — sleep, magnesium, training, recovery, gut, light, nutrition…"
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            style={{ flex: 1, minWidth: 150 }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <select
            value={priFilter}
            onChange={(e) => setPriFilter(e.target.value)}
            style={{ flex: 1, minWidth: 130 }}
          >
            <option value="all">All Priorities</option>
            <option value="core">Core / Critical</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            style={{ flex: 1, minWidth: 130 }}
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {isFiltering && (
            <button className="btn btn-sm btn-ghost" onClick={clearFilters}>
              Clear
            </button>
          )}
          <SyncBadge status={syncStatus} />
        </div>
      </div>

      {/* ── Result count ────────────────────────────────────────────────────── */}
      {isFiltering && (
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
          {filtered.length === 0
            ? "No protocols match."
            : `${filtered.length} ${filtered.length === 1 ? "protocol" : "protocols"} found`}
        </p>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {isFiltering && filtered.length === 0 && (
        <TffCard>
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <p
              style={{
                fontSize: "var(--t-body)",
                color: "var(--text-3)",
                marginBottom: 6,
              }}
            >
              No protocols match your filters.
            </p>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-4)",
                marginBottom: 20,
              }}
            >
              Try a different search term or clear the filters.
            </p>
            <button className="btn btn-sm btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </TffCard>
      )}

      {/* ── Flat results (when filtering) ───────────────────────────────────── */}
      {isFiltering && filtered.length > 0 && (
        <div className="stack-md">
          {filtered.map((p) => (
            <div key={p.id} id={`proto-${p.id}`}>
              <ProtocolCard
                p={p}
                expanded={expandedId === p.id}
                onToggle={toggleExpand}
                tracking={tracking[p.id] ?? EMPTY_ENTRY}
                onStatusChange={(s) => handleStatusChange(p.id, s)}
                onNotesChange={(n) => handleNotesChange(p.id, n)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Grouped browse (default view) ───────────────────────────────────── */}
      {!isFiltering && (
        <div className="stack-lg">
          {grouped.map(({ cat, label, protocols: protos }) => (
            <div key={cat}>
              <SectionHeader>
                {label}
                <span
                  className="mono"
                  style={{ marginLeft: 10, fontSize: 9, color: "var(--text-4)" }}
                >
                  {protos.length} {protos.length === 1 ? "PROTOCOL" : "PROTOCOLS"}
                </span>
              </SectionHeader>
              <div className="stack-md" style={{ marginTop: 0 }}>
                {protos.map((p) => (
                  <div key={p.id} id={`proto-${p.id}`}>
                    <ProtocolCard
                      p={p}
                      expanded={expandedId === p.id}
                      onToggle={toggleExpand}
                      tracking={tracking[p.id] ?? EMPTY_ENTRY}
                      onStatusChange={(s) => handleStatusChange(p.id, s)}
                      onNotesChange={(n) => handleNotesChange(p.id, n)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <TffCard style={{ padding: "14px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <p
            className="mono"
            style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
          >
            {syncStatus === "synced" || syncStatus === "syncing"
              ? "TRACKING SYNCS TO CLOUD · LOCALSTORAGE FALLBACK ACTIVE"
              : "PROTOCOL TRACKING STORED IN BROWSER LOCALSTORAGE"}
          </p>
          <TffBadge variant="na">24 Protocols</TffBadge>
        </div>
      </TffCard>
    </div>
  )
}

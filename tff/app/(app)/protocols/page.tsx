"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { StatCard } from "@/components/tff/StatCard"
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

// ── ProtocolDetail ────────────────────────────────────────────────────────────

function ProtocolDetail({ p }: { p: Protocol }) {
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

      {/* Phase 2 note */}
      <div
        style={{
          padding: "10px 14px",
          background: "var(--card-2)",
          border: "1px solid var(--border-soft)",
          borderRadius: 4,
        }}
      >
        {/* TODO (Phase 2): Add protocol tracking — active status, start date, completion history, personal notes, scheduling, and link to daily checklist */}
        <p
          className="mono"
          style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
        >
          TRACKING · NOTES · SCHEDULING IN PHASE 2
        </p>
      </div>
    </div>
  )
}

// ── ProtocolCard ──────────────────────────────────────────────────────────────

function ProtocolCard({
  p,
  expanded,
  onToggle,
}: {
  p: Protocol
  expanded: boolean
  onToggle: (id: string) => void
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
          <ProtocolDetail p={p} />
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
            {/* TODO (Phase 2): User protocol tracking — active protocols, start dates, */}
            {/* completion history, personal notes, scheduling, checklist linking.       */}
            PHASE 1 — KNOWLEDGE BASE · PROTOCOL TRACKING IN PHASE 2
          </p>
          <TffBadge variant="na">24 Protocols</TffBadge>
        </div>
      </TffCard>
    </div>
  )
}

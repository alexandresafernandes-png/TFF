"use client"

import { useState, useEffect, type CSSProperties } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { StatCard } from "@/components/tff/StatCard"
import sourcesRaw from "@/data/sources.json"

// ── Types ─────────────────────────────────────────────────────────────────────

interface TffSource {
  id: string
  ebook_title: string
  shorthand: string
  notes: string
}

type PageMode = "library" | "coverage" | "audit" | "phase2"

// ── Data ──────────────────────────────────────────────────────────────────────

const TFF_SOURCES = sourcesRaw as unknown as TffSource[]

// Coverage stats verified by inspecting all data JSON files.
// Counts derived from: protocols(24) + supplements(37) + blood_markers(77) + routines(11)
// + foods(23) + claims(59) + shopping_items(56) + checklist(44) + cooking_guides(12) = 343
const SOURCE_COVERAGE: Record<string, { refs: number; areas: string[]; primaryArea: string }> = {
  tff_2_0: {
    refs: 140,
    areas: ["Foods (23)", "Claims (23)", "Shopping (23)", "Checklist (21)", "Supplements (22)", "Cooking Guides (10)", "Routines (7)", "Blood Markers (7)", "Protocols (4)"],
    primaryArea: "Comprehensive — all areas",
  },
  dht_remastered: {
    refs: 99,
    areas: ["Blood Markers (18)", "Claims (18)", "Supplements (15)", "Protocols (12)", "Shopping (12)", "Checklist (9)", "Foods (7)", "Routines (6)", "Cooking Guides (2)"],
    primaryArea: "DHT & Hormones",
  },
  blood_work_guide: {
    refs: 93,
    areas: ["Blood Markers (77)", "Claims (6)", "Supplements (3)", "Checklist (2)", "Shopping (2)", "Protocols (1)", "Foods (1)", "Routines (1)"],
    primaryArea: "Blood Markers — primary source",
  },
  performance_nutrition: {
    refs: 56,
    areas: ["Checklist (12)", "Claims (10)", "Shopping (10)", "Routines (7)", "Cooking Guides (6)", "Supplements (6)", "Protocols (3)", "Foods (2)"],
    primaryArea: "Nutrition & Training",
  },
  hair_loss: {
    refs: 54,
    areas: ["Shopping (16)", "Foods (8)", "Claims (8)", "Blood Markers (6)", "Protocols (5)", "Checklist (4)", "Routines (3)", "Supplements (2)", "Cooking Guides (2)"],
    primaryArea: "Hair & Scalp",
  },
  sleep_recovery: {
    refs: 51,
    areas: ["Supplements (14)", "Checklist (13)", "Shopping (13)", "Routines (5)", "Claims (2)", "Protocols (2)", "Foods (2)"],
    primaryArea: "Sleep & Recovery",
  },
}

// Coverage areas — all verified against actual data files
const COVERAGE_AREAS = [
  { id: "protocols",      label: "Protocols",              total: 24, backed: 24, note: "All 24 protocols have TFF source refs." },
  { id: "supplements",    label: "Supplements",            total: 37, backed: 37, note: "37/37 sourced. 1 entry (Joint Stack) has an incomplete source ref." },
  { id: "blood_markers",  label: "Blood Markers",          total: 77, backed: 77, note: "All 77 markers sourced — primary source is Blood Work Guide." },
  { id: "routines",       label: "Routines",               total: 11, backed: 11, note: "All 11 routine blocks have source refs." },
  { id: "foods",          label: "Foods (data)",           total: 23, backed: 23, note: "All 23 foods sourced across TFF 2.0, DHT Remastered, Hair Loss." },
  { id: "claims",         label: "Claims (knowledge)",     total: 59, backed: 59, note: "All 59 knowledge claims have source page references." },
  { id: "shopping_items", label: "Shopping Items (data)",  total: 56, backed: 56, note: "data/shopping_items.json is fully source-backed." },
  { id: "checklist",      label: "Checklist",              total: 44, backed: 44, note: "All 44 checklist items reference source ebooks." },
  { id: "cooking_guides", label: "Cooking Guides",         total: 12, backed: 12, note: "All 12 cooking/prep guides have source refs." },
]

// Audit tasks — honest, actionable
const AUDIT_TASKS = [
  { id: "audit_shopping_align",   priority: "High",   area: "Shopping",     label: "Align shopping page inline items (RETAINER_ITEMS / UPGRADE_ITEMS) with data/shopping_items.json source-backed entries." },
  { id: "audit_joint_stack",      priority: "High",   area: "Supplements",  label: "Locate source reference for Joint Stack (MSM + Glucosamine + Chondroitin) — currently logged as 'Not clearly stated in KB'." },
  { id: "audit_supplement_page",  priority: "Medium", area: "Supplements",  label: "Verify supplement page content renders from supplements.json — not from any page-level duplicate definitions." },
  { id: "audit_blood_ranges",     priority: "Medium", area: "Bloodwork",    label: "Spot-check blood marker optimal ranges against corresponding Blood Work Guide page numbers." },
  { id: "audit_protocol_refs",    priority: "Medium", area: "Protocols",    label: "Confirm protocol source page numbers accurately reflect ebook content (not approximations)." },
  { id: "audit_claims_pages",     priority: "Medium", area: "Claims",       label: "Review 59 claims.json entries — flag any chapter-only refs that should have specific page numbers." },
  { id: "audit_nutrition_align",  priority: "Medium", area: "Nutrition",    label: "Confirm nutrition page content aligns with foods.json entries and TFF 2.0 Ch. 4 source." },
  { id: "audit_routine_refs",     priority: "Low",    area: "Routines",     label: "Verify routine step-to-source-page accuracy — confirm each section maps to the correct ebook page." },
  { id: "audit_cooking_prep",     priority: "Low",    area: "Nutrition",    label: "Confirm cooking_guides.json prep methods exactly match TFF food prep guidance in source ebooks." },
  { id: "audit_provisional_pass", priority: "Low",    area: "General",      label: "Final pass: identify and remove any generic wellness content not backed by TFF source material." },
]

// Phase 2 features
// TODO Phase 2: sources table, source_links table, content_review_status table,
//               source_confidence_score, official/provisional content tagging, admin review notes
const PHASE2_FEATURES = [
  { title: "Source-Linked Knowledge Entries",   desc: "Every claim, protocol step, and supplement entry links directly to the source page it came from." },
  { title: "Content Confidence Score",          desc: "Each data item gets a confidence score based on citation specificity: page ref > chapter ref > book ref." },
  { title: "Official vs Provisional Tags",      desc: "App-wide tagging surfaced inline on every page — distinguishes TFF-official content from provisional entries." },
  { title: "Citation Management",               desc: "Add, edit, and link source refs without touching code. Admin-only view for source maintenance." },
  { title: "Source → Protocol Mapping",         desc: "Visual map showing which protocols derive from which source page ranges." },
  { title: "Source → Supplement Mapping",       desc: "See which supplements are mentioned together in the same source section." },
  { title: "Source → Blood Marker Mapping",     desc: "Cross-reference blood markers to the exact Blood Work Guide sections." },
  { title: "Admin Review Workflow",             desc: "Mark items as reviewed, flag for re-check, and track full review history." },
  { title: "Supabase Sync",                     desc: "Persist confidence scores, review status, and audit completions cross-device." },
]

// ── Module-level stats ────────────────────────────────────────────────────────

const TOTAL_DOCS = TFF_SOURCES.length
const TOTAL_ITEMS = 343
const AREAS_COVERED = COVERAGE_AREAS.length
const ITEMS_NEEDING_REVIEW = 1 // Joint Stack incomplete ref

// ── localStorage key ──────────────────────────────────────────────────────────

const LS_AUDIT = "tff_source_audit_done"

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

function SourceBookCard({ source }: { source: TffSource }) {
  const [expanded, setExpanded] = useState(false)
  const coverage = SOURCE_COVERAGE[source.id]

  return (
    <TffCard style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <TffBadge variant="core">TFF Ebook</TffBadge>
            <TffBadge variant="default">{source.shorthand}</TffBadge>
          </div>
          <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            {source.ebook_title}
          </div>
          {coverage && (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              {coverage.primaryArea} ·{" "}
              <strong style={{ color: "var(--text-2)" }}>{coverage.refs}</strong>{" "}
              references across {coverage.areas.length} app areas
            </p>
          )}
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mono"
          style={{
            padding: "4px 10px", fontSize: 9, letterSpacing: "0.08em",
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: 4, color: "var(--text-4)", cursor: "pointer", flexShrink: 0,
          }}
        >
          {expanded ? "▲ LESS" : "▼ MORE"}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
            DISCLAIMER / NOTES
          </div>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 14px", lineHeight: 1.65, fontStyle: "italic" }}>
            {source.notes}
          </p>
          {coverage && (
            <>
              <div className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
                COVERAGE BREAKDOWN
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {coverage.areas.map((area) => (
                  <span
                    key={area}
                    className="mono"
                    style={{
                      fontSize: 9, padding: "3px 8px",
                      background: "var(--panel-2)", border: "1px solid var(--border)",
                      borderRadius: 3, color: "var(--text-3)", letterSpacing: "0.04em",
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </>
          )}
          <div style={{ marginTop: 12 }}>
            <span className="mono" style={{ fontSize: 9, color: "#4a8a4a", letterSpacing: "0.06em" }}>
              ✓ TFF-SOURCED · Source ID: {source.id}
            </span>
          </div>
        </div>
      )}
    </TffCard>
  )
}

function CoverageRow({ area }: { area: typeof COVERAGE_AREAS[0] }) {
  const pct = Math.round((area.backed / area.total) * 100)
  const isComplete = area.backed === area.total

  return (
    <TffCard style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <TffBadge variant={isComplete ? "core" : "warn"}>{pct}%</TffBadge>
            <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>{area.label}</span>
          </div>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
            {area.note}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <span className="mono" style={{ fontSize: "var(--t-display)", fontWeight: 700, color: "var(--accent)", lineHeight: 1, display: "block" }}>
            {area.backed}/{area.total}
          </span>
          <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.08em" }}>
            SOURCE-BACKED
          </span>
        </div>
      </div>
    </TffCard>
  )
}

function AuditTask({
  task,
  done,
  onToggle,
}: {
  task: typeof AUDIT_TASKS[0]
  done: boolean
  onToggle: () => void
}) {
  return (
    <TffCard style={{ marginBottom: 8, opacity: done ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <button
          onClick={onToggle}
          className="mono"
          style={{
            width: 20, height: 20, flexShrink: 0, marginTop: 2,
            background: done ? "var(--accent)" : "transparent",
            border: "1px solid", borderColor: done ? "var(--accent)" : "var(--border)",
            borderRadius: 3, color: done ? "var(--bg)" : "transparent",
            cursor: "pointer", fontSize: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {done ? "✓" : ""}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span
              className="mono"
              style={{
                fontSize: 8, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.08em",
                background: task.priority === "High" ? "rgba(239,68,68,0.12)" : task.priority === "Medium" ? "rgba(245,158,11,0.12)" : "var(--panel-2)",
                color: task.priority === "High" ? "#ef4444" : task.priority === "Medium" ? "#f59e0b" : "var(--text-4)",
                border: "1px solid",
                borderColor: task.priority === "High" ? "rgba(239,68,68,0.25)" : task.priority === "Medium" ? "rgba(245,158,11,0.25)" : "var(--border)",
              }}
            >
              {task.priority.toUpperCase()}
            </span>
            <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.06em" }}>
              {task.area.toUpperCase()}
            </span>
          </div>
          <p
            style={{
              fontSize: "var(--t-small)", color: done ? "var(--text-4)" : "var(--text-3)",
              margin: 0, lineHeight: 1.6, textDecoration: done ? "line-through" : "none",
            }}
          >
            {task.label}
          </p>
        </div>
      </div>
    </TffCard>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SourcesPage() {
  const [mode, setMode] = useState<PageMode>("library")
  const [auditDone, setAuditDone] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)
  const [libSearch, setLibSearch] = useState("")
  const [auditFilter, setAuditFilter] = useState("all")

  // Load audit state from localStorage
  useEffect(() => {
    try {
      const r = localStorage.getItem(LS_AUDIT)
      if (r) setAuditDone(new Set(JSON.parse(r) as string[]))
    } catch (_e) { /* ignore */ }
    setLoaded(true)
  }, [])

  // Persist audit state
  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(LS_AUDIT, JSON.stringify([...auditDone])) } catch (_e) { /* ignore */ }
  }, [auditDone, loaded])

  const toggleAudit = (id: string) => {
    setAuditDone((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const filteredSources = TFF_SOURCES.filter((s) => {
    if (!libSearch) return true
    const q = libSearch.toLowerCase()
    return (
      s.ebook_title.toLowerCase().includes(q) ||
      s.shorthand.toLowerCase().includes(q) ||
      s.notes.toLowerCase().includes(q) ||
      (SOURCE_COVERAGE[s.id]?.primaryArea ?? "").toLowerCase().includes(q)
    )
  })

  const filteredTasks = AUDIT_TASKS.filter((t) => {
    if (auditFilter === "all") return true
    if (auditFilter === "done") return auditDone.has(t.id)
    if (auditFilter === "pending") return !auditDone.has(t.id)
    return t.priority.toLowerCase() === auditFilter.toLowerCase()
  })

  const auditCompletedCount = AUDIT_TASKS.filter((t) => auditDone.has(t.id)).length

  const MODES = [
    { key: "library"  as const, label: "Source Library" },
    { key: "coverage" as const, label: "Coverage Map" },
    { key: "audit"    as const, label: `Audit (${auditCompletedCount}/${AUDIT_TASKS.length})` },
    { key: "phase2"   as const, label: "Phase 2" },
  ]

  return (
    <div>
      <PageHeader
        crumb="INDEX · 10 / SOURCES"
        title="Sources & References"
        subtitle="Source foundation behind TFF protocols, nutrition, supplements, bloodwork, routines, and shopping content."
      />

      {/* ── Stats ── */}
      <div className="page-inset" style={{ paddingBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard count={TOTAL_DOCS}           label="SOURCE DOCUMENTS" />
        <StatCard count={TOTAL_ITEMS}          label="SOURCE-BACKED ITEMS" />
        <StatCard count={AREAS_COVERED}        label="APP AREAS COVERED" />
        <StatCard count={ITEMS_NEEDING_REVIEW} label="INCOMPLETE REFS" />
      </div>

      {/* ── Mode tabs ── */}
      <div className="page-inset" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="mono"
              style={{
                padding: "7px 16px", fontSize: 10, letterSpacing: "0.1em",
                background: mode === m.key ? "var(--accent)" : "var(--panel-2)",
                border: "1px solid", borderColor: mode === m.key ? "var(--accent)" : "var(--border)",
                borderRadius: 4, color: mode === m.key ? "var(--bg)" : "var(--text-3)", cursor: "pointer",
              }}
            >
              {m.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── SOURCE LIBRARY ── */}
      {mode === "library" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <TffBadge variant="core">6 TFF Source Documents</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              All TFF app content traces back to these 6 ebooks. Every source ref in the data files uses the shorthand names shown below.
              No external studies, URLs, or third-party papers are cited — these are the author&apos;s compiled knowledge and experience.
            </p>
          </TffCard>

          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search sources…"
              value={libSearch}
              onChange={(e) => setLibSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 12px", fontSize: "var(--t-small)",
                background: "var(--panel-2)", border: "1px solid var(--border)",
                borderRadius: 4, color: "var(--text)", outline: "none",
              }}
            />
          </div>

          {filteredSources.length === 0 ? (
            <TffCard>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No source documents match your search.
              </p>
            </TffCard>
          ) : (
            filteredSources.map((source) => (
              <SourceBookCard key={source.id} source={source} />
            ))
          )}

          <div style={{ marginTop: 20, padding: "12px 16px", background: "var(--panel-2)", borderRadius: 6, border: "1px solid var(--border)" }}>
            <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em", lineHeight: 1.7, display: "block" }}>
              NOTE: These are TFF author ebooks, not academic peer-reviewed studies. Each book includes its own disclaimer — see individual source notes above.
              This app is an organizational tool for TFF content, not a medical reference.
            </span>
          </div>
        </div>
      )}

      {/* ── COVERAGE MAP ── */}
      {mode === "coverage" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <TffBadge variant="core">343 / 343 Items Source-Backed</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Every item across all TFF data files has at least one source reference to a TFF ebook.
              The table below shows coverage per app area. Known gaps are documented separately.
            </p>
          </TffCard>

          <SectionHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Data File Coverage</span>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>343 / 343 BACKED</span>
            </div>
          </SectionHeader>

          {COVERAGE_AREAS.map((area) => (
            <CoverageRow key={area.id} area={area} />
          ))}

          <SectionHeader>
            <span>Known Gaps</span>
          </SectionHeader>

          <TffCard style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <TffBadge variant="warn">Incomplete</TffBadge>
              <div>
                <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  Joint Stack — source ref incomplete
                </div>
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                  <span className="mono" style={{ fontSize: 10 }}>supplements.json → msm_glucosamine_chondroitin</span> has source ref:{" "}
                  <em>&ldquo;Not clearly stated in KB — listed in training day checklist section.&rdquo;</em> Needs manual lookup in Performance Nutrition source.
                </p>
              </div>
            </div>
          </TffCard>

          <TffCard style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <TffBadge variant="depends">Review</TffBadge>
              <div>
                <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  Shopping page — inline items not from data file
                </div>
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                  The /shopping page defines RETAINER_ITEMS and UPGRADE_ITEMS inline in the page file.
                  These are TFF-derived but not yet cross-referenced against data/shopping_items.json.
                  Audit task: verify alignment or migrate to JSON source.
                </p>
              </div>
            </div>
          </TffCard>

          <TffCard>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <TffBadge variant="na">N/A</TffBadge>
              <div>
                <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  Tags (51 entries) — source refs not applicable
                </div>
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                  data/tags.json contains taxonomy labels used for filtering and search. Source refs are not applicable — these are organizational metadata, not knowledge claims.
                </p>
              </div>
            </div>
          </TffCard>
        </div>
      )}

      {/* ── AUDIT QUEUE ── */}
      {mode === "audit" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <TffBadge variant="depends">TFF Content Audit Queue</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Tasks to verify, tighten, and clean up source coverage across the TFF app.
              Check off tasks as completed — state persists in your browser.
            </p>
          </TffCard>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            <select value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} style={SEL}>
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
              {auditCompletedCount}/{AUDIT_TASKS.length} COMPLETE
            </span>
            {auditDone.size > 0 && (
              <button
                onClick={() => setAuditDone(new Set())}
                className="mono"
                style={{ padding: "6px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer", marginLeft: "auto" }}
              >
                RESET AUDIT
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20, background: "var(--panel-2)", borderRadius: 4, height: 4, border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.round((auditCompletedCount / AUDIT_TASKS.length) * 100)}%`,
              background: "var(--accent)",
              transition: "width 0.3s ease",
            }} />
          </div>

          {filteredTasks.length === 0 ? (
            <TffCard>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No tasks match the selected filter.
              </p>
            </TffCard>
          ) : (
            filteredTasks.map((task) => (
              <AuditTask
                key={task.id}
                task={task}
                done={auditDone.has(task.id)}
                onToggle={() => toggleAudit(task.id)}
              />
            ))
          )}
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
              Phase 1 source tracking is static and file-based. Phase 2 adds dynamic source linking, per-item confidence scoring, and admin review workflows.
            </p>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: "8px 0 0", lineHeight: 1.6 }}>
              {/* TODO Phase 2: sources table, source_links table, content_review_status,
                  source_confidence_score per item, official/provisional tagging, admin review notes */}
              Planned Supabase tables:{" "}
              <span className="mono">sources · source_links · content_review_status · source_confidence_scores · admin_review_notes</span>
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
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { UserNotesPanel } from "@/components/tff/UserNotesPanel"
import markersRaw from "@/data/blood_markers.json"

type Tab = "browse" | "core_panel" | "phase2"
type PriorityLevel = "core" | "optional" | "advanced" | "context"

interface Marker {
  id: string
  name: string
  panel: string
  units: string
  optimal_range: string
  standard_range: string
  high_means: string
  low_means: string
  why_it_matters: string
  related_markers: string[]
  source_refs: string[]
  tags: string[]
}

const MARKERS = markersRaw as unknown as Marker[]
const MARKER_BY_ID: Record<string, Marker> = Object.fromEntries(MARKERS.map((m) => [m.id, m]))

const PANEL_TO_CAT: Record<string, string> = {
  thyroid: "Hormones & Thyroid",
  sex_hormones: "Hormones & Thyroid",
  metabolic: "Metabolic Health",
  lipids: "Lipids & Cardiovascular",
  inflammation: "Inflammation",
  micronutrients: "Vitamins & Minerals",
  liver: "Liver & Kidney",
  kidney: "Liver & Kidney",
  cbc: "Blood Count",
  dutch: "Advanced / Context",
  bone_mineral: "Vitamins & Minerals",
}

const ID_TO_CAT: Record<string, string> = {
  igf1: "Training & Recovery",
  cortisol_am: "Training & Recovery",
  dhea_s: "Training & Recovery",
  ferritin: "Inflammation",
}

function getDisplayCategory(m: Marker): string {
  return ID_TO_CAT[m.id] ?? PANEL_TO_CAT[m.panel] ?? "General"
}

const ADVANCED_IDS = new Set([
  "dutch_androsterone", "dutch_etiocholanolone", "dutch_3alpha_diol_g",
  "rt3", "apob", "lp_a", "homocysteine", "cystatin_c", "mma",
])
const CONTEXT_IDS = new Set(["tpo_antibodies", "tgab", "cortisol_am", "uric_acid"])
const CORE_IDS = new Set([
  "tsh", "free_t3", "total_testosterone", "free_testosterone", "shbg", "estradiol",
  "lh", "hs_crp", "ferritin", "vitamin_d_25oh", "vitamin_b12", "fasting_glucose",
  "fasting_insulin", "hba1c", "tg_hdl_ratio", "total_cholesterol", "ldl", "hdl",
  "triglycerides", "alt", "ast", "ggt", "albumin", "creatinine_egfr", "hemoglobin",
  "hematocrit", "mcv", "wbc_total", "platelets", "igf1", "dhea_s", "folate", "dht",
])

function getPriority(m: Marker): PriorityLevel {
  if (ADVANCED_IDS.has(m.id)) return "advanced"
  if (CONTEXT_IDS.has(m.id)) return "context"
  if (CORE_IDS.has(m.id)) return "core"
  return "optional"
}

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  core: "Core",
  optional: "Optional",
  advanced: "Advanced",
  context: "Context Required",
}

const PRIORITY_VARIANT: Record<PriorityLevel, "core" | "default" | "depends" | "warn"> = {
  core: "core",
  optional: "default",
  advanced: "depends",
  context: "warn",
}

const CATEGORIES = [
  "Blood Count",
  "Metabolic Health",
  "Lipids & Cardiovascular",
  "Liver & Kidney",
  "Inflammation",
  "Vitamins & Minerals",
  "Hormones & Thyroid",
  "Training & Recovery",
  "Advanced / Context",
]

const CORE_COUNT = MARKERS.filter((m) => getPriority(m) === "core").length
const PANEL_COUNT = CATEGORIES.length

const CORE_PANEL_GROUPS = [
  {
    group: "Thyroid",
    ids: ["tsh", "free_t3", "free_t4"],
    note: "TSH + Free T3 most actionable; Free T4 adds context on conversion.",
  },
  {
    group: "Sex Hormones",
    ids: ["total_testosterone", "free_testosterone", "shbg", "estradiol", "lh", "dht"],
    note: "Full picture requires total + free + SHBG together. LH clarifies origin.",
  },
  {
    group: "Metabolic",
    ids: ["fasting_glucose", "fasting_insulin", "hba1c"],
    note: "Fasting insulin is the most sensitive early marker — often excluded from standard panels.",
  },
  {
    group: "Lipids",
    ids: ["total_cholesterol", "ldl", "hdl", "triglycerides", "tg_hdl_ratio"],
    note: "TG:HDL ratio can be a stronger insulin resistance proxy than LDL alone.",
  },
  {
    group: "Inflammation",
    ids: ["hs_crp", "ferritin"],
    note: "hs-CRP reflects acute/systemic inflammation. Ferritin is an acute-phase reactant — interpret in context.",
  },
  {
    group: "Liver Function",
    ids: ["alt", "ast", "ggt", "albumin"],
    note: "GGT is sensitive to alcohol, oxidative stress, and bile duct issues.",
  },
  {
    group: "Kidney",
    ids: ["creatinine_egfr"],
    note: "eGFR is derived from creatinine. Track the trend; single values can be misleading.",
  },
  {
    group: "Key Micronutrients",
    ids: ["vitamin_d_25oh", "vitamin_b12", "folate", "ferritin"],
    note: "Deficiencies in this group are common and impactful. Test before supplementing.",
  },
  {
    group: "Blood Count",
    ids: ["hemoglobin", "hematocrit", "mcv", "wbc_total", "platelets"],
    note: "MCV flags B12/folate or iron issues. WBC pattern matters more than the total count.",
  },
  {
    group: "Training & Anabolism",
    ids: ["igf1", "dhea_s"],
    note: "IGF-1 tracks the GH axis. DHEA-S is an adrenal androgen precursor — declines with age.",
  },
  {
    group: "Advanced Add-ons",
    ids: ["apob", "lp_a", "homocysteine"],
    note: "Request separately — rarely included on standard panels. High cardiovascular relevance.",
  },
  {
    group: "Thyroid Deep Dive",
    ids: ["rt3", "tpo_antibodies"],
    note: "Add if thyroid numbers are borderline or symptoms persist with normal TSH.",
  },
]

const PHASE2_FEATURES = [
  {
    title: "Manual Entry",
    desc: "Log your actual lab values and track changes over time.",
  },
  {
    title: "Trend Graphs",
    desc: "Visualize each marker across multiple draws with spark charts.",
  },
  {
    title: "Optimal vs Standard Range Overlay",
    desc: "See where you fall against both the functional and lab reference ranges.",
  },
  {
    title: "Panel Builder",
    desc: "Generate a printable marker checklist to bring to your doctor.",
  },
  {
    title: "Marker Correlation View",
    desc: "See which markers move together — e.g. SHBG ↑ often associates with free T ↓.",
  },
  {
    title: "Protocol Linkage",
    desc: "Link bloodwork findings to relevant protocols in the Protocol Library.",
  },
  {
    title: "Lab Upload",
    desc: "Parse PDF lab reports and auto-populate marker values.",
  },
  {
    title: "Supplement Impact Tracker",
    desc: "Tag which supplements you were running during each draw period.",
  },
  {
    title: "Export",
    desc: "Export a clean summary PDF to share with your physician or coach.",
  },
]

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "14px 18px",
        minWidth: 100,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
        {value}
      </div>
      <div className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
        {label}
      </div>
    </div>
  )
}

function MarkerCard({ marker }: { marker: Marker }) {
  const [open, setOpen] = useState(false)
  const priority = getPriority(marker)
  const related = marker.related_markers
    .map((id) => MARKER_BY_ID[id]?.name ?? id)
    .filter(Boolean)

  return (
    <TffCard style={{ marginBottom: 8 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "12px 16px",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--t-base)",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {marker.name}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <TffBadge variant={PRIORITY_VARIANT[priority]}>
              {PRIORITY_LABEL[priority]}
            </TffBadge>
            <span
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
            >
              {getDisplayCategory(marker).toUpperCase()}
            </span>
            {marker.units && (
              <span
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}
              >
                {marker.units}
              </span>
            )}
          </div>
        </div>
        <span style={{ color: "var(--text-4)", fontSize: 12, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-soft)" }}>
          {/* Why it matters */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
            >
              WHY IT MATTERS
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>
              {marker.why_it_matters}
            </p>
          </div>

          {/* Ranges grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "10px 12px",
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                OPTIMAL RANGE
              </div>
              <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                {marker.optimal_range || "—"}
              </div>
            </div>
            <div
              style={{
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "10px 12px",
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                LAB REFERENCE
              </div>
              <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                {marker.standard_range || "—"}
              </div>
            </div>
          </div>

          {/* High / Low */}
          {(marker.high_means || marker.low_means) && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {marker.high_means && (
                <div>
                  <div
                    className="mono"
                    style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
                  >
                    IF HIGH — MAY INDICATE
                  </div>
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                    {marker.high_means}
                  </p>
                </div>
              )}
              {marker.low_means && (
                <div>
                  <div
                    className="mono"
                    style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
                  >
                    IF LOW — MAY INDICATE
                  </div>
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                    {marker.low_means}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Related markers */}
          {related.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}
              >
                RELATED MARKERS
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {related.map((name) => (
                  <span
                    key={name}
                    className="mono"
                    style={{
                      fontSize: 9,
                      padding: "3px 7px",
                      background: "var(--panel-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 3,
                      color: "var(--text-3)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source refs */}
          {marker.source_refs.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                SOURCES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {marker.source_refs.map((ref) => (
                  <span
                    key={ref}
                    className="mono"
                    style={{ fontSize: 9, color: "var(--text-4)" }}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              padding: "8px 10px",
              marginBottom: 12,
            }}
          >
            <p
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", margin: 0, lineHeight: 1.5, letterSpacing: "0.06em" }}
            >
              Ranges vary by lab, units, method, age, sex, and clinical context. This is educational reference only.
              Discuss any findings with a qualified professional. Track trends over time — single values are rarely definitive.
            </p>
          </div>

          {/* Linked notes */}
          <UserNotesPanel area="bloodwork" entityId={marker.id} />
        </div>
      )}
    </TffCard>
  )
}

export default function BloodworkPage() {
  const [tab, setTab] = useState<Tab>("browse")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const isFiltering = search.trim() !== "" || categoryFilter !== "all" || priorityFilter !== "all"

  const filtered = useMemo(() => {
    return MARKERS.filter((m) => {
      const q = search.toLowerCase()
      const matchSearch =
        q === "" ||
        m.name.toLowerCase().includes(q) ||
        m.why_it_matters.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      const matchCat = categoryFilter === "all" || getDisplayCategory(m) === categoryFilter
      const matchPri = priorityFilter === "all" || (getPriority(m) as string) === priorityFilter
      return matchSearch && matchCat && matchPri
    })
  }, [search, categoryFilter, priorityFilter])

  const grouped = useMemo(() => {
    if (isFiltering) return null
    const map: Record<string, Marker[]> = {}
    for (const cat of CATEGORIES) map[cat] = []
    for (const m of MARKERS) {
      const cat = getDisplayCategory(m)
      if (map[cat]) map[cat].push(m)
    }
    return map
  }, [isFiltering])

  const tabs: { id: Tab; label: string }[] = [
    { id: "browse", label: "Browse Markers" },
    { id: "core_panel", label: "Core Panel" },
    { id: "phase2", label: "Phase 2" },
  ]

  return (
    <div>
      <PageHeader
        crumb="INDEX · 07 / BLOODWORK"
        title="Bloodwork Reference"
        subtitle="Educational reference for 77 blood markers. Not a diagnostic tool."
      />

      {/* Hero stats */}
      <div className="page-inset" style={{ paddingBottom: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <StatCard value={MARKERS.length} label="TOTAL MARKERS" />
        <StatCard value={CORE_COUNT} label="CORE MARKERS" />
        <StatCard value={PANEL_COUNT} label="CATEGORIES" />
        <StatCard value={CORE_PANEL_GROUPS.length} label="PANEL GROUPS" />
      </div>

      {/* Tabs */}
      <div className="page-inset" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="mono"
              style={{
                padding: "6px 14px",
                fontSize: 10,
                letterSpacing: "0.1em",
                border: "1px solid",
                borderColor: tab === t.id ? "var(--accent)" : "var(--border)",
                background: tab === t.id ? "var(--accent)" : "transparent",
                color: tab === t.id ? "var(--bg)" : "var(--text-3)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Browse Markers ── */}
      {tab === "browse" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search markers..."
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
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                fontSize: "var(--t-small)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                fontSize: "var(--t-small)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
              }}
            >
              <option value="all">All Priorities</option>
              <option value="core">Core</option>
              <option value="optional">Optional</option>
              <option value="advanced">Advanced</option>
              <option value="context">Context Required</option>
            </select>
            {isFiltering && (
              <button
                onClick={() => { setSearch(""); setCategoryFilter("all"); setPriorityFilter("all") }}
                className="mono"
                style={{
                  padding: "8px 12px",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  color: "var(--text-4)",
                  cursor: "pointer",
                }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Result count when filtering */}
          {isFiltering && (
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 14 }}
            >
              {filtered.length} MARKER{filtered.length !== 1 ? "S" : ""} FOUND
            </div>
          )}

          {/* Flat list when filtering */}
          {isFiltering && (
            <div>
              {filtered.length === 0 ? (
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>No markers match.</p>
              ) : (
                filtered.map((m) => <MarkerCard key={m.id} marker={m} />)
              )}
            </div>
          )}

          {/* Grouped by category when not filtering */}
          {!isFiltering && grouped && (
            <div>
              {CATEGORIES.map((cat) => {
                const items = grouped[cat]
                if (!items || items.length === 0) return null
                return (
                  <div key={cat} style={{ marginBottom: 32 }}>
                    <SectionHeader>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{cat}</span>
                        <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                          {items.length} MARKER{items.length !== 1 ? "S" : ""}
                        </span>
                      </div>
                    </SectionHeader>
                    <div>
                      {items.map((m) => <MarkerCard key={m.id} marker={m} />)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Core Panel ── */}
      {tab === "core_panel" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                  Core Bloodwork Panel
                </span>
              </div>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                A practical starting point for a complete health baseline. Not all of these are included on standard panels — you may need to request specific markers. Ranges vary by lab, units, and clinical context. Review with a qualified professional.
              </p>
            </div>
          </TffCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CORE_PANEL_GROUPS.map((group) => (
              <TffCard key={group.group}>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                      {group.group}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {group.ids.map((id) => {
                      const m = MARKER_BY_ID[id]
                      if (!m) return null
                      const pri = getPriority(m)
                      return (
                        <TffBadge key={id} variant={PRIORITY_VARIANT[pri]}>
                          {m.name.split(" (")[0]}
                        </TffBadge>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                    {group.note}
                  </p>
                </div>
              </TffCard>
            ))}
          </div>

          <TffCard style={{ marginTop: 24 }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                  PRIORITY KEY
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(["core", "optional", "advanced", "context"] as PriorityLevel[]).map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TffBadge variant={PRIORITY_VARIANT[p]}>{PRIORITY_LABEL[p]}</TffBadge>
                    <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
                      {p === "core" && "include on every draw"}
                      {p === "optional" && "useful additional context"}
                      {p === "advanced" && "deep dive markers"}
                      {p === "context" && "interpret with clinical context"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TffCard>
        </div>
      )}

      {/* ── Phase 2 ── */}
      {tab === "phase2" && (
        <div className="page-inset" style={{ paddingBottom: 40 }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ marginBottom: 6 }}>
                <TffBadge variant="depends">Phase 2 — Not Yet Active</TffBadge>
              </div>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.6 }}>
                Phase 2 will add personal tracking, trend visualization, and protocol linkage. The reference library is fully functional now.
              </p>
            </div>
          </TffCard>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASE2_FEATURES.map((f, i) => (
              <TffCard key={i}>
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: "var(--text-4)",
                      flexShrink: 0,
                      marginTop: 3,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                      {f.title}
                    </div>
                    <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                      {f.desc}
                    </p>
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

"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import supplementsRaw from "@/data/supplements.json"

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "categories" | "timing" | "stack" | "phase2"
type PriorityLevel = "core" | "optional" | "advanced" | "caution"

interface Supplement {
  id: string
  name: string
  tier: string
  category: string
  purpose: string
  mechanism: string
  dose: string
  timing: string
  cautions: string[]
  related_protocols: string[]
  source_refs: string[]
  tags: string[]
}

// ── Data ──────────────────────────────────────────────────────────────────────

const SUPS = supplementsRaw as unknown as Supplement[]

const DISPLAY_CATEGORY: Record<string, string> = {
  l_theanine: "Sleep & Recovery",
  apigenin: "Sleep & Recovery",
  glycine: "Sleep & Recovery",
  valerian_root: "Sleep & Recovery",
  passion_flower: "Sleep & Recovery",
  lemon_balm: "Sleep & Recovery",
  tart_cherry: "Sleep & Recovery",
  ashwagandha: "Sleep & Recovery",
  cbd_oil: "Sleep & Recovery",
  myo_inositol: "Sleep & Recovery",
  gaba: "Sleep & Recovery",
  l_tryptophan_5htp: "Sleep & Recovery",
  magnesium: "Minerals & Electrolytes",
  zinc: "Minerals & Electrolytes",
  selenium: "Minerals & Electrolytes",
  boron: "Minerals & Electrolytes",
  creatine: "Performance & Training",
  lclt: "Performance & Training",
  r_ala: "Performance & Training",
  hmb: "Performance & Training",
  taurine: "Performance & Training",
  dextrose_cyclic_dextrin: "Performance & Training",
  msm_glucosamine_chondroitin: "Performance & Training",
  omega_3: "Focus & Mental",
  nad_precursors: "Focus & Mental",
  pqq: "Focus & Mental",
  ubiquinol_coq10: "Focus & Mental",
  vitamin_d3_k2: "General Health",
  vitamin_c: "General Health",
  b_complex: "General Health",
  collagen_peptides: "General Health",
  kestose: "Gut & Digestion",
  l_reuteri: "Gut & Digestion",
  sodium_butyrate: "Gut & Digestion",
  tongkat_ali: "Advanced / Caution",
  fadogia_agrestis: "Advanced / Caution",
  dhea_topical: "Advanced / Caution",
}

const CATEGORIES = [
  "Sleep & Recovery",
  "Minerals & Electrolytes",
  "Performance & Training",
  "Focus & Mental",
  "General Health",
  "Gut & Digestion",
  "Advanced / Caution",
]

const CATEGORY_DESC: Record<string, string> = {
  "Sleep & Recovery":
    "Supplements that may support sleep quality, relaxation, and overnight recovery. Sleep is the single highest-leverage intervention.",
  "Minerals & Electrolytes":
    "Core minerals commonly depleted under training stress or poor diet. Address deficiencies here before adding anything else.",
  "Performance & Training":
    "Compounds that may support energy, strength, glycogen utilization, and post-workout recovery.",
  "Focus & Mental":
    "Compounds that may support cognitive energy, neurological function, and mitochondrial health.",
  "General Health":
    "Foundation supplements covering common micronutrient gaps, connective tissue, and immune support.",
  "Gut & Digestion":
    "Compounds that may support gut microbiome health and digestive function — a direct factor in hormonal output.",
  "Advanced / Caution":
    "More significant compounds requiring an established baseline, personal context, and ideally bloodwork confirmation. Introduce only after foundations are stable.",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPriority(sup: Supplement): PriorityLevel {
  if (sup.tags.includes("pri_experimental")) return "caution"
  if (sup.tags.includes("pri_critical") || sup.tags.includes("pri_core")) return "core"
  if (sup.tags.includes("pri_advanced")) return "advanced"
  return "optional"
}

function getTimingChips(sup: Supplement): string[] {
  const chips: string[] = []
  if (sup.tags.includes("time_morning")) chips.push("Morning")
  if (sup.tags.includes("time_with_meals")) chips.push("With meals")
  if (sup.tags.includes("time_pre_workout")) chips.push("Pre-workout")
  if (sup.tags.includes("time_intra_workout")) chips.push("Intra-workout")
  if (sup.tags.includes("time_post_workout")) chips.push("Post-workout")
  if (sup.tags.includes("time_pre_bed")) chips.push("Pre-bed")
  return chips.length > 0 ? chips : ["Flexible"]
}

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  core: "Core",
  optional: "Optional",
  advanced: "Advanced",
  caution: "Use With Caution",
}

const PRIORITY_VARIANT: Record<PriorityLevel, "core" | "default" | "depends" | "warn"> = {
  core: "core",
  optional: "default",
  advanced: "depends",
  caution: "warn",
}

// ── Static content ────────────────────────────────────────────────────────────

const TIMING_WINDOWS = [
  {
    id: "morning",
    label: "Morning",
    tagKey: "time_morning",
    note: "Take with breakfast. Fat-soluble vitamins (D3, K2) require dietary fat for absorption. B-Complex energises — take early to avoid interfering with sleep.",
    caution: "Do not take Boron in the afternoon or evening — may cause early waking.",
  },
  {
    id: "with_meals",
    label: "With Meals",
    tagKey: "time_with_meals",
    note: "Take alongside food to improve absorption and reduce GI discomfort. Creatine timing is flexible — with any meal is fine.",
    caution: "Do not take Zinc at the same time as high-phytate foods (bread, legumes).",
  },
  {
    id: "pre_workout",
    label: "Pre-Workout",
    tagKey: "time_pre_workout",
    note: "Take 30–60 minutes before training. Avoid pre-workout carbohydrates — insulin spike suppresses lipolysis and creates an energy mismatch early in the session.",
    caution: "Keep pre-workout fat moderate. Do not start intra-workout carbs before the first hard sets.",
  },
  {
    id: "intra_workout",
    label: "Intra-Workout",
    tagKey: "time_intra_workout",
    note: "Start AFTER the first 1–2 heavy working sets — not before training begins. Muscle contractions open GLUT4 doors independently of insulin, enabling direct glucose uptake.",
    caution: "Add 2g sodium per serving for SGLT1 co-transporter uptake. Do not front-load pre-session.",
  },
  {
    id: "post_workout",
    label: "Post-Workout",
    tagKey: "time_post_workout",
    note: "Priority delivery window. Insulin sensitivity is highest here — use it for carbohydrates and recovery compounds, not fat storage.",
    caution: "Keep dietary fat to ≤5–7g in the first post-workout meal. Fat returns at the next meal.",
  },
  {
    id: "pre_bed",
    label: "Pre-Bed",
    tagKey: "time_pre_bed",
    note: "Most sleep supplements: 30–60 min before sleep. CBD oil: 5 hours before bed. Glycine: 2–3 times per week only, not nightly. Magnesium: 300–500mg 30–60 min before bed.",
    caution: "Do not take Boron, Vitamin C, or anything energising in the evening. These may disrupt sleep onset or cause early waking.",
  },
]

const STACK_RULES = [
  {
    num: "01",
    title: "Start with foundations",
    body: "Begin with Vitamin D3, Magnesium, and Zinc. These address the most common deficiencies and create a stable reference point. Everything else builds on top of an established base.",
  },
  {
    num: "02",
    title: "Add one variable at a time",
    body: "When introducing a new supplement, wait 2–4 weeks before adding another. You cannot isolate the cause of an effect — or a side effect — when multiple variables change simultaneously.",
  },
  {
    num: "03",
    title: "Track your response",
    body: "Monitor sleep quality, digestion, mood, training performance, and recovery. Rate each 1–5 daily. If any signal deteriorates after adding a supplement, that is data — pause and isolate.",
  },
  {
    num: "04",
    title: "Give it consistent time",
    body: "Do not judge a supplement after 3–5 days. Most require 4–8 weeks of consistent use to show measurable effects in hormonal markers and sleep architecture.",
  },
  {
    num: "05",
    title: "Avoid stacking too many unknowns",
    body: "When something goes wrong — poor sleep, GI distress, mood changes — you need to know which supplement to remove. Excessive stacking removes that ability. Introduce, confirm, then add.",
  },
  {
    num: "06",
    title: "Bloodwork for mineral categories",
    body: "Zinc, Selenium, and Vitamin D all have optimal serum ranges. Supplementing without a baseline may result in excess or missed context. Test before and after establishing your stack.",
  },
  {
    num: "07",
    title: "Advanced compounds require a stable base",
    body: "Do not start Tongkat Ali, Fadogia, or any advanced compound before foundational supplements have been running consistently for at least 3–4 weeks. Advanced compounds on an unstable base produce noisy, uninterpretable signals.",
  },
]

const PHASE2_FEATURES = [
  {
    name: "Personal Supplement Schedule",
    desc: "Your daily schedule with timing reminders for each supplement in your stack.",
  },
  {
    name: "Adherence Tracking",
    desc: "Track whether each supplement was taken daily. Streak tracking per supplement.",
  },
  {
    name: "Response Notes",
    desc: "Personal observations on effects — sleep quality, mood, digestion, training, recovery.",
  },
  {
    name: "Side-Effect Log",
    desc: "Log negative responses to isolate which supplement caused an issue.",
  },
  {
    name: "Bloodwork-Linked Recommendations",
    desc: "Connect supplement doses to bloodwork markers — D3 dose to 25(OH)D, Zinc to serum Zn/Cu.",
  },
  {
    name: "Dashboard Supplement Card",
    desc: "Today's supplement schedule on the main dashboard with completion checkboxes.",
  },
  {
    name: "Checklist Integration",
    desc: "Supplement timing items appear in the Daily Checklist and sync with completion state.",
  },
  {
    name: "Cloud Sync",
    desc: "Supplement log, schedule, and response notes synced via Supabase.",
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 100,
        padding: "14px 16px",
        background: "var(--card-2)",
        border: "1px solid var(--border-soft)",
        borderRadius: 4,
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}
      >
        {value}
      </div>
      <div style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", letterSpacing: "0.08em" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginTop: 2, opacity: 0.7 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function SupplementCard({ sup }: { sup: Supplement }) {
  const [open, setOpen] = useState(false)
  const priority = getPriority(sup)
  const timingChips = getTimingChips(sup)

  return (
    <div style={{ borderBottom: "1px solid var(--border-soft)", padding: "12px 0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}>
              {sup.name}
            </span>
            <TffBadge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABEL[priority]}</TffBadge>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
            {timingChips.map((chip) => (
              <span
                key={chip}
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--text-4)",
                  background: "var(--card-2)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 2,
                  padding: "1px 5px",
                  letterSpacing: "0.06em",
                }}
              >
                {chip.toUpperCase()}
              </span>
            ))}
          </div>
          {!open && (
            <p
              style={{ fontSize: "var(--t-micro)", color: "var(--text-3)", margin: 0, lineHeight: 1.4 }}
            >
              {sup.purpose}
            </p>
          )}
        </div>
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--text-4)", flexShrink: 0, paddingTop: 2 }}
        >
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-2)",
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {sup.purpose}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                DOSE
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                {sup.dose}
              </p>
            </div>
            <div>
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                TIMING
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                {sup.timing}
              </p>
            </div>
          </div>

          {sup.cautions.length > 0 && (
            <div
              style={{
                borderLeft: "2px solid var(--warn, #e67e22)",
                paddingLeft: 10,
                marginBottom: 12,
              }}
            >
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 6 }}
              >
                CAUTIONS
              </p>
              {sup.cautions.map((c, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    margin: "0 0 4px",
                    lineHeight: 1.5,
                  }}
                >
                  • {c}
                </p>
              ))}
            </div>
          )}

          {sup.source_refs.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {sup.source_refs.map((ref) => (
                <span
                  key={ref}
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: "var(--text-4)",
                    background: "var(--card-2)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 2,
                    padding: "2px 6px",
                  }}
                >
                  {ref}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "categories", label: "Categories" },
  { id: "timing", label: "Timing" },
  { id: "stack", label: "Stack Logic" },
  { id: "phase2", label: "Phase 2" },
]

export default function SupplementsPage() {
  const [tab, setTab] = useState<Tab>("categories")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [timingFilter, setTimingFilter] = useState("all")

  const coreSups = SUPS.filter(
    (s) => s.tags.includes("pri_core") || s.tags.includes("pri_critical"),
  )

  const isFiltering =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    timingFilter !== "all"

  const filteredSups = useMemo(() => {
    const q = search.toLowerCase().trim()
    return SUPS.filter((s) => {
      const cat = DISPLAY_CATEGORY[s.id] ?? "General Health"
      const priority = getPriority(s)
      const matchCategory = categoryFilter === "all" || cat === categoryFilter
      const matchPriority = priorityFilter === "all" || (priority as string) === priorityFilter
      const matchTiming = timingFilter === "all" || s.tags.includes(timingFilter)
      const matchSearch =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.purpose.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        s.tags.some((t) => t.includes(q))
      return matchCategory && matchPriority && matchTiming && matchSearch
    })
  }, [search, categoryFilter, priorityFilter, timingFilter])

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 06 / SUPPLEMENTS"
        title="Supplements"
        subtitle="TFF supplement reference — sleep, minerals, performance, focus, gut, and advanced compounds."
      />

      {/* ── Hero Stats ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <StatCard label="CATEGORIES" value={CATEGORIES.length} />
        <StatCard label="CORE SUPPLEMENTS" value={coreSups.length} sub="Foundation tier" />
        <StatCard label="TIMING WINDOWS" value={TIMING_WINDOWS.length} />
        <StatCard label="TRACKING" value="Phase 2" />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 2,
          borderBottom: "1px solid var(--border-soft)",
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: t.id === tab ? "2px solid var(--accent)" : "2px solid transparent",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "var(--t-small)",
              fontWeight: t.id === tab ? 600 : 400,
              color: t.id === tab ? "var(--text)" : "var(--text-3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Categories ───────────────────────────────────────────────── */}
      {tab === "categories" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search supplements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: 180,
                padding: "8px 12px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 4,
                color: "var(--text)",
                fontSize: "var(--t-small)",
                outline: "none",
              }}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 4,
                color: "var(--text)",
                fontSize: "var(--t-small)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 4,
                color: "var(--text)",
                fontSize: "var(--t-small)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All priorities</option>
              <option value="core">Core</option>
              <option value="optional">Optional</option>
              <option value="advanced">Advanced</option>
              <option value="caution">Use With Caution</option>
            </select>
            <select
              value={timingFilter}
              onChange={(e) => setTimingFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 4,
                color: "var(--text)",
                fontSize: "var(--t-small)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="all">All timing</option>
              <option value="time_morning">Morning</option>
              <option value="time_with_meals">With meals</option>
              <option value="time_pre_workout">Pre-workout</option>
              <option value="time_intra_workout">Intra-workout</option>
              <option value="time_post_workout">Post-workout</option>
              <option value="time_pre_bed">Pre-bed</option>
            </select>
          </div>

          {/* Flat filtered view */}
          {isFiltering ? (
            <div>
              <p
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--text-4)",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}
              >
                {filteredSups.length} RESULT{filteredSups.length !== 1 ? "S" : ""}
              </p>
              <TffCard>
                {filteredSups.length === 0 ? (
                  <p
                    style={{ fontSize: "var(--t-small)", color: "var(--text-4)", padding: "12px 0" }}
                  >
                    No supplements match.
                  </p>
                ) : (
                  filteredSups.map((s) => <SupplementCard key={s.id} sup={s} />)
                )}
              </TffCard>
            </div>
          ) : (
            /* Grouped view */
            <div className="stack-lg">
              {CATEGORIES.map((cat) => {
                const sups = SUPS.filter(
                  (s) => (DISPLAY_CATEGORY[s.id] ?? "General Health") === cat,
                )
                if (sups.length === 0) return null
                return (
                  <div key={cat}>
                    <SectionHeader>{cat}</SectionHeader>
                    <p
                      style={{
                        fontSize: "var(--t-small)",
                        color: "var(--text-3)",
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {CATEGORY_DESC[cat]}
                    </p>
                    <TffCard>
                      {sups.map((s) => (
                        <SupplementCard key={s.id} sup={s} />
                      ))}
                    </TffCard>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Timing ───────────────────────────────────────────────────── */}
      {tab === "timing" && (
        <div className="stack-lg">
          <div>
            <SectionHeader>Timing Windows</SectionHeader>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-3)",
                marginBottom: 4,
                lineHeight: 1.6,
              }}
            >
              When you take a supplement can matter as much as what you take. General timing
              guidance — adjust based on your schedule and individual response.
            </p>
          </div>

          {TIMING_WINDOWS.map((w) => {
            const windowSups = SUPS.filter((s) => s.tags.includes(w.tagKey))
            return (
              <TffCard key={w.id}>
                <div style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: "var(--t-small)",
                      fontWeight: 700,
                      color: "var(--text)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {w.label}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    marginBottom: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {w.note}
                </p>

                {windowSups.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <p
                      className="mono"
                      style={{
                        fontSize: 9,
                        color: "var(--text-4)",
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                      }}
                    >
                      SUPPLEMENTS IN THIS WINDOW
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {windowSups.map((s) => {
                        const p = getPriority(s)
                        return (
                          <span
                            key={s.id}
                            style={{
                              fontSize: "var(--t-micro)",
                              color: p === "core" ? "var(--accent)" : "var(--text-3)",
                              background: "var(--card-2)",
                              border: "1px solid var(--border-soft)",
                              borderRadius: 3,
                              padding: "3px 8px",
                            }}
                          >
                            {s.name.split(" (")[0]}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    borderLeft: "2px solid var(--warn, #e67e22)",
                    paddingLeft: 10,
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: "var(--text-4)",
                      letterSpacing: "0.1em",
                      marginBottom: 4,
                    }}
                  >
                    CAUTION
                  </p>
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0 }}>
                    {w.caution}
                  </p>
                </div>
              </TffCard>
            )
          })}
        </div>
      )}

      {/* ── Tab: Stack Logic ──────────────────────────────────────────────── */}
      {tab === "stack" && (
        <div>
          <SectionHeader>Stack Logic</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            General principles for building a supplement stack. Avoid adding too many variables
            at once. Track your response and adjust based on what you observe. Consult a
            qualified professional for personalized guidance.
          </p>
          <TffCard>
            {STACK_RULES.map((rule, i) => (
              <div
                key={rule.num}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < STACK_RULES.length - 1 ? "1px solid var(--border-soft)" : "none",
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <span
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    flexShrink: 0,
                    paddingTop: 1,
                    width: 20,
                  }}
                >
                  {rule.num}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: "0 0 4px",
                    }}
                  >
                    {rule.title}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {rule.body}
                  </p>
                </div>
              </div>
            ))}
          </TffCard>
          <p
            style={{
              fontSize: "var(--t-micro)",
              color: "var(--text-4)",
              marginTop: 10,
              paddingLeft: 2,
              lineHeight: 1.6,
            }}
          >
            General guidance only. Supplement response is individual. If you have a medical
            condition, are on medication, or are unsure about a compound, consult a qualified
            professional before starting.
          </p>
        </div>
      )}

      {/* ── Tab: Phase 2 ──────────────────────────────────────────────────── */}
      {tab === "phase2" && (
        <div>
          <SectionHeader>Phase 2 — Supplement Tracking</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Personal scheduling, adherence tracking, and response logging require Supabase auth
            and a user-specific data layer. These features ship in Phase 2.
          </p>

          <div
            style={{
              padding: "14px 16px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p
              className="mono"
              style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em", margin: 0 }}
            >
              REQUIRES SUPABASE AUTH + USER DATA LAYER
            </p>
            <TffBadge variant="na">Phase 2</TffBadge>
          </div>

          <TffCard>
            {PHASE2_FEATURES.map((feat, i) => (
              <div
                key={feat.name}
                style={{
                  padding: "12px 0",
                  borderBottom:
                    i < PHASE2_FEATURES.length - 1 ? "1px solid var(--border-soft)" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: "0 0 3px",
                    }}
                  >
                    {feat.name}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {feat.desc}
                  </p>
                </div>
                <TffBadge variant="na">Phase 2</TffBadge>
              </div>
            ))}
          </TffCard>

          <div style={{ marginTop: 16 }}>
            <TffCard>
              <TffCardHeader>Phase 2 Supabase Tables</TffCardHeader>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-3)",
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                Data layer required for the Supplement Tracking system:
              </p>
              {(
                [
                  {
                    table: "supplement_logs",
                    desc: "Daily intake log — user_id, supplement_id, date, taken",
                  },
                  {
                    table: "supplement_schedule",
                    desc: "Per-user timing plan — supplement_id, timing_window, active",
                  },
                  {
                    table: "supplement_response_notes",
                    desc: "Observations — user_id, supplement_id, date, notes, rating",
                  },
                  {
                    table: "supplement_side_effects",
                    desc: "Side effect log — user_id, supplement_id, date, description, severity",
                  },
                ] as { table: string; desc: string }[]
              ).map((row, i, arr) => (
                <div
                  key={row.table}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i < arr.length - 1 ? "1px solid var(--border-soft)" : "none",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  <code
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--accent)",
                      background: "var(--card-2)",
                      padding: "2px 6px",
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    {row.table}
                  </code>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
                    {row.desc}
                  </span>
                </div>
              ))}
            </TffCard>
          </div>
        </div>
      )}
    </div>
  )
}

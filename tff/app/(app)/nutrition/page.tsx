"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import foodsRaw from "@/data/foods.json"

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "principles" | "foods" | "meals" | "daylogic" | "phase2"

interface Food {
  id: string
  name: string
  status: string
  category: string
  purpose: string | null
  why: string | null
  prep_required: boolean
  cooking_method: string | null
  timing: string | null
  avoid_reason: string | null
  source_refs?: string[]
}

// ── Static data ───────────────────────────────────────────────────────────────

const FOODS = foodsRaw as unknown as Food[]

const PRINCIPLES = [
  {
    num: "01",
    title: "Animal Protein at Every Meal",
    body: "Red meat, eggs, organ meats, and shellfish form the protein foundation. Animal protein provides complete amino acid profiles plus the cofactors — zinc, iron, B12, cholesterol — needed for hormonal production. Adjust amounts based on body weight and training volume.",
  },
  {
    num: "02",
    title: "Carbohydrates Around Training",
    body: "Simple starches — white rice and potatoes — are timed around training. The post-workout window is the primary carb opportunity. Rest days are generally lower-carb and more fat-forward. Carbs support thyroid T3 output, glycogen replenishment, and cortisol management.",
  },
  {
    num: "03",
    title: "Animal Fats as Primary Cooking Fat",
    body: "Butter, ghee, tallow, and coconut oil are the approved cooking fats. These saturated and monounsaturated fats are the structural basis for steroid hormones and do not suppress 5-alpha-reductase. Seed oils are removed from the kitchen entirely.",
  },
  {
    num: "04",
    title: "Eliminate PUFAs Where Possible",
    body: "Polyunsaturated fatty acids — especially GLA, linoleic acid, and DHA in cooking oils — may inhibit 5-alpha-reductase. Seed oils are the primary target: sunflower, canola, soybean, corn. Nuts and seeds as regular snacks are also limited for this reason.",
  },
  {
    num: "05",
    title: "Prioritize Micronutrient Density",
    body: "Liver (beef or lamb) 2–3 times per week and oysters regularly. These are among the most micronutrient-dense foods available. Liver provides vitamin A, B12, folate, copper, and choline. Oysters provide zinc, selenium, iodine, and copper — direct cofactors for hormonal synthesis.",
  },
  {
    num: "06",
    title: "Water as Primary Fluid",
    body: "Water is the baseline fluid. No soda, no fruit juice, no alcohol. Black coffee and plain tea are acceptable. Alcohol disrupts REM sleep, may upregulate aromatase, and can reduce nighttime GH secretion significantly even at moderate doses.",
  },
  {
    num: "07",
    title: "Remove Suppressors First",
    body: "Before optimizing, remove the major dietary suppressors: seed oils, added sugar, soy, standard supermarket dairy, and alcohol. These may suppress testosterone, impair thyroid function, or promote estrogen conversion. Removal is the starting baseline — optimization builds on top of it.",
  },
]

const MEAL_TEMPLATES = [
  {
    name: "Morning Baseline",
    timing: "Upon waking",
    foods: ["3–5 whole eggs (with yolks)", "Black coffee"],
    notes:
      "No significant carbs unless training follows shortly. Simple hormonal support before the day. Egg yolks provide choline and cholesterol — building blocks for steroid hormones.",
    tag: "daily" as const,
  },
  {
    name: "Pre-Workout",
    timing: "60–90 min before training",
    foods: ["Red meat or eggs", "Small carb portion (optional)"],
    notes:
      "Keep fats moderate pre-training. Protein base to support muscle protein synthesis. A small carb portion is optional if training intensity is high.",
    tag: "training" as const,
  },
  {
    name: "Post-Workout",
    timing: "Within 30–60 min after training",
    foods: ["White rice or potatoes", "Lean protein — eggs or lower-fat cut of meat"],
    notes:
      "Priority glycogen window. Keep dietary fat to ≤5–7g in this meal. Insulin sensitivity is highest post-training — use it for carb replenishment. Fat returns at the next meal.",
    tag: "training" as const,
  },
  {
    name: "Rest Day Main Meal",
    timing: "Main meal on non-training days",
    foods: ["Red meat (beef or lamb)", "Whole eggs", "Cooked in tallow, butter, or ghee"],
    notes:
      "Fat-forward and protein-dense. Minimal starch on rest days. This is when cholesterol and saturated fat intake supports ongoing steroidogenesis.",
    tag: "rest" as const,
  },
  {
    name: "Liver Meal",
    timing: "2–3 times per week",
    foods: ["50–100g beef or lamb liver", "Cooked in tallow or butter", "Optional: paired with whole eggs"],
    notes:
      "Nutrient density session. Liver provides vitamin A, B12, folate, and copper — cofactors for every hormonal and metabolic system. Non-negotiable part of the weekly food protocol.",
    tag: "weekly" as const,
  },
  {
    name: "Evening / Sleep-Support",
    timing: "2–3 hours before bed",
    foods: ["3–5 whole eggs", "Optional: 5–10g raw honey (pre-bed only)"],
    notes:
      "Eggs in the evening may support cholesterol availability during sleep — the time when testosterone is primarily synthesized. Raw honey is a context-specific micro-dose only, not a daily sugar source.",
    tag: "daily" as const,
  },
]

type MealTag = "daily" | "training" | "rest" | "weekly"
const MEAL_TAG_LABEL: Record<MealTag, string> = {
  daily: "Daily",
  training: "Training Day",
  rest: "Rest Day",
  weekly: "2–3×/week",
}
const MEAL_TAG_VARIANT: Record<MealTag, "core" | "default" | "depends" | "na"> = {
  daily: "na",
  training: "core",
  rest: "default",
  weekly: "depends",
}

const DAY_RULES = [
  {
    label: "Carbohydrates",
    training: "Higher — white rice or potatoes centered on the post-workout window",
    rest: "Lower — minimal starch, fat-forward meals",
  },
  {
    label: "Protein",
    training: "High throughout — red meat, eggs, shellfish",
    rest: "High — maintained at consistent level",
  },
  {
    label: "Fats",
    training: "Moderate — avoid fats in the post-workout meal (≤5–7g)",
    rest: "Higher — fat-forward, cook in tallow, butter, or ghee",
  },
  {
    label: "Meal Timing",
    training: "Structured around training — pre, post windows matter",
    rest: "Flexible — 2–3 meals, less rigid timing",
  },
  {
    label: "Hydration",
    training: "Higher demand — electrolytes if sweating heavily",
    rest: "Standard maintenance — water as primary fluid",
  },
  {
    label: "Focus Foods",
    training: "Post-workout: white rice + lean protein (low fat)",
    rest: "Red meat + eggs + liver when scheduled",
  },
]

const PHASE2_FEATURES = [
  {
    name: "Macro Targets",
    desc: "Daily protein, carb, and fat targets calculated from body weight and training volume.",
  },
  {
    name: "Training / Rest Day Split",
    desc: "Automated carb cycling display based on your scheduled training days.",
  },
  {
    name: "Meal Timing Blocks",
    desc: "Visual timeline showing optimal eating windows mapped to your specific training schedule.",
  },
  {
    name: "Saved Meals",
    desc: "Build and save custom meal combinations from the approved food list for quick logging.",
  },
  {
    name: "Macro Compliance Score",
    desc: "Daily score tracking adherence to macro targets across all meals.",
  },
  {
    name: "Dashboard Macro Card",
    desc: "Live macro progress visible on the main dashboard — protein, carbs, fats at a glance.",
  },
  {
    name: "Checklist Meal Actions",
    desc: "Mark meals eaten directly from the daily checklist, which auto-logs the macros.",
  },
  {
    name: "Cloud Sync",
    desc: "Meal log, macro targets, and training-day history synced via Supabase.",
  },
]

const STATUS_VARIANT: Record<string, "core" | "default" | "prep" | "avoid" | "depends"> = {
  APPROVED_CORE: "core",
  APPROVED_CONTEXT: "default",
  PREP_REQUIRED: "prep",
  AVOID: "avoid",
  DEPENDS: "depends",
}

const STATUS_LABEL: Record<string, string> = {
  APPROVED_CORE: "Core",
  APPROVED_CONTEXT: "Contextual",
  PREP_REQUIRED: "Prep Required",
  AVOID: "Avoid",
  DEPENDS: "Context-Dependent",
}

const TABS: Tab[] = ["principles", "foods", "meals", "daylogic", "phase2"]
const TAB_LABELS: Record<Tab, string> = {
  principles: "Principles",
  foods: "Foods",
  meals: "Meal Templates",
  daylogic: "Training vs Rest",
  phase2: "Phase 2",
}

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
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text)",
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
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

function FoodCard({ food }: { food: Food }) {
  const [open, setOpen] = useState(false)
  const isAvoid = food.status === "AVOID"
  const variant = STATUS_VARIANT[food.status] ?? "default"

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: food.purpose || food.avoid_reason ? 3 : 0,
            }}
          >
            <span
              style={{
                fontSize: "var(--t-small)",
                fontWeight: 600,
                color: isAvoid ? "var(--text-2)" : "var(--text)",
              }}
            >
              {food.name}
            </span>
            <TffBadge variant={variant}>{STATUS_LABEL[food.status]}</TffBadge>
          </div>
          {food.purpose && (
            <p
              style={{
                fontSize: "var(--t-micro)",
                color: "var(--text-3)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {food.purpose}
            </p>
          )}
          {food.avoid_reason && !open && (
            <p
              style={{
                fontSize: "var(--t-micro)",
                color: "var(--text-3)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {food.avoid_reason.slice(0, 110)}
              {food.avoid_reason.length > 110 ? "…" : ""}
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
          {food.why && (
            <div style={{ marginBottom: 10 }}>
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                WHY
              </p>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {food.why}
              </p>
            </div>
          )}
          {food.avoid_reason && (
            <div
              style={{
                marginBottom: 10,
                borderLeft: "2px solid var(--warn, #e67e22)",
                paddingLeft: 10,
              }}
            >
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                AVOID REASON
              </p>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {food.avoid_reason}
              </p>
            </div>
          )}
          {food.timing && (
            <div style={{ marginBottom: 8 }}>
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                TIMING
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0 }}>
                {food.timing}
              </p>
            </div>
          )}
          {food.prep_required && food.cooking_method && (
            <div style={{ marginBottom: 8 }}>
              <p
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
              >
                PREP METHOD
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0 }}>
                {food.cooking_method}
              </p>
            </div>
          )}
          {food.source_refs && food.source_refs.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {food.source_refs.map((ref) => (
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

export default function NutritionPage() {
  const [tab, setTab] = useState<Tab>("principles")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const coreFoods = FOODS.filter((f) => f.status === "APPROVED_CORE")
  const contextFoods = FOODS.filter((f) => f.status === "APPROVED_CONTEXT")
  const prepFoods = FOODS.filter((f) => f.status === "PREP_REQUIRED")
  const dependsFoods = FOODS.filter((f) => f.status === "DEPENDS")
  const avoidFoods = FOODS.filter((f) => f.status === "AVOID")

  const isFiltering = search.trim() !== "" || statusFilter !== "all"

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase().trim()
    return FOODS.filter((f) => {
      const matchStatus = statusFilter === "all" || f.status === statusFilter
      const matchSearch =
        q === "" ||
        f.name.toLowerCase().includes(q) ||
        (f.purpose ?? "").toLowerCase().includes(q) ||
        (f.why ?? "").toLowerCase().includes(q) ||
        (f.avoid_reason ?? "").toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [search, statusFilter])

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 05 / NUTRITION"
        title="Nutrition & Fuel"
        subtitle="The food framework that supports hormonal optimization and performance."
      />

      {/* ── Hero Stats ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <StatCard label="TOTAL FOODS" value={FOODS.length} />
        <StatCard label="CORE APPROVED" value={coreFoods.length} sub="Hard foundation" />
        <StatCard label="MEAL TEMPLATES" value={MEAL_TEMPLATES.length} />
        <StatCard label="MACRO TRACKING" value="Phase 2" />
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
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "none",
              border: "none",
              borderBottom: t === tab ? "2px solid var(--accent)" : "2px solid transparent",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "var(--t-small)",
              fontWeight: t === tab ? 600 : 400,
              color: t === tab ? "var(--text)" : "var(--text-3)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Tab: Principles ───────────────────────────────────────────────── */}
      {tab === "principles" && (
        <div>
          <SectionHeader>7 Core Fuel Principles</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            General dietary guidelines for hormonal and metabolic support. Adjust based on
            individual response and goals. This is not medical advice.
          </p>
          <TffCard>
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.num}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    i < PRINCIPLES.length - 1 ? "1px solid var(--border-soft)" : "none",
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
                  {p.num}
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
                    {p.title}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </TffCard>
        </div>
      )}

      {/* ── Tab: Foods ────────────────────────────────────────────────────── */}
      {tab === "foods" && (
        <div>
          {/* Search + Filter */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search foods..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="all">All statuses</option>
              <option value="APPROVED_CORE">Core Approved</option>
              <option value="APPROVED_CONTEXT">Contextual</option>
              <option value="PREP_REQUIRED">Prep Required</option>
              <option value="DEPENDS">Context-Dependent</option>
              <option value="AVOID">Avoid</option>
            </select>
          </div>

          {/* Filtered flat view */}
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
                {filteredFoods.length} RESULT{filteredFoods.length !== 1 ? "S" : ""}
              </p>
              <TffCard>
                {filteredFoods.length === 0 ? (
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-4)",
                      padding: "12px 0",
                    }}
                  >
                    No foods match.
                  </p>
                ) : (
                  filteredFoods.map((f) => <FoodCard key={f.id} food={f} />)
                )}
              </TffCard>
            </div>
          ) : (
            /* Grouped view */
            <div className="stack-lg">
              <div>
                <SectionHeader>Core Approved</SectionHeader>
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Foundation foods. Eat these regularly — they support hormonal health and
                  performance.
                </p>
                <TffCard>
                  {coreFoods.map((f) => (
                    <FoodCard key={f.id} food={f} />
                  ))}
                </TffCard>
              </div>

              <div>
                <SectionHeader>Contextual / Timing-Dependent</SectionHeader>
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Approved when timing and sourcing are right. Context matters.
                </p>
                <TffCard>
                  {contextFoods.map((f) => (
                    <FoodCard key={f.id} food={f} />
                  ))}
                </TffCard>
              </div>

              {prepFoods.length > 0 && (
                <div>
                  <SectionHeader>Prep Required</SectionHeader>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    Requires specific preparation before consuming. Unprepared versions are not
                    approved.
                  </p>
                  <TffCard>
                    {prepFoods.map((f) => (
                      <FoodCard key={f.id} food={f} />
                    ))}
                  </TffCard>
                </div>
              )}

              {dependsFoods.length > 0 && (
                <div>
                  <SectionHeader>Context-Dependent</SectionHeader>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    Special-use items. Not general daily foods — specific use cases and doses only.
                  </p>
                  <TffCard>
                    {dependsFoods.map((f) => (
                      <FoodCard key={f.id} food={f} />
                    ))}
                  </TffCard>
                </div>
              )}

              <div>
                <SectionHeader>Remove / Avoid</SectionHeader>
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}
                >
                  These foods may suppress hormones, impair thyroid function, or promote
                  inflammation. General guidance — adjust based on individual response.
                </p>
                <TffCard>
                  {avoidFoods.map((f) => (
                    <FoodCard key={f.id} food={f} />
                  ))}
                </TffCard>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Meals ────────────────────────────────────────────────────── */}
      {tab === "meals" && (
        <div>
          <SectionHeader>Meal Templates</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Reference templates based on TFF protocols. Adapt to your schedule and food
            availability. Structural guides, not rigid prescriptions.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MEAL_TEMPLATES.map((m) => (
              <TffCard key={m.name}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--t-small)",
                      fontWeight: 700,
                      color: "var(--text)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {m.name}
                  </span>
                  <TffBadge variant={MEAL_TAG_VARIANT[m.tag]}>
                    {MEAL_TAG_LABEL[m.tag]}
                  </TffBadge>
                </div>

                <p
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: "var(--text-4)",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  TIMING
                </p>
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-2)",
                    marginBottom: 12,
                  }}
                >
                  {m.timing}
                </p>

                <p
                  className="mono"
                  style={{
                    fontSize: 9,
                    color: "var(--text-4)",
                    letterSpacing: "0.1em",
                    marginBottom: 6,
                  }}
                >
                  FOODS
                </p>
                <ul style={{ margin: "0 0 12px", paddingLeft: 16 }}>
                  {m.foods.map((food) => (
                    <li
                      key={food}
                      style={{
                        fontSize: "var(--t-small)",
                        color: "var(--text-2)",
                        marginBottom: 3,
                      }}
                    >
                      {food}
                    </li>
                  ))}
                </ul>

                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-3)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {m.notes}
                </p>
              </TffCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Day Logic ────────────────────────────────────────────────── */}
      {tab === "daylogic" && (
        <div>
          <SectionHeader>Training Day vs Rest Day</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Carbohydrate intake cycles with training load. Adjust amounts based on your
            training volume and individual response.
          </p>

          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 1fr",
              gap: 1,
              marginBottom: 1,
            }}
          >
            <div />
            <div
              style={{
                padding: "10px 14px",
                background: "var(--accent)",
                borderRadius: "4px 0 0 0",
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--bg)",
                  letterSpacing: "0.12em",
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                TRAINING DAY
              </p>
            </div>
            <div
              style={{
                padding: "10px 14px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderLeft: "none",
                borderRadius: "0 4px 0 0",
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: 9,
                  color: "var(--text-4)",
                  letterSpacing: "0.12em",
                  margin: 0,
                }}
              >
                REST DAY
              </p>
            </div>
          </div>

          {/* Table rows */}
          <div
            style={{
              border: "1px solid var(--border-soft)",
              borderRadius: "0 0 4px 4px",
              overflow: "hidden",
            }}
          >
            {DAY_RULES.map((rule, i) => (
              <div
                key={rule.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 1fr",
                  borderBottom:
                    i < DAY_RULES.length - 1 ? "1px solid var(--border-soft)" : "none",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRight: "1px solid var(--border-soft)",
                    background: "var(--card-2)",
                  }}
                >
                  <p
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: "var(--text-4)",
                      letterSpacing: "0.08em",
                      margin: 0,
                    }}
                  >
                    {rule.label.toUpperCase()}
                  </p>
                </div>
                <div style={{ padding: "12px 14px", borderRight: "1px solid var(--border-soft)" }}>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-2)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {rule.training}
                  </p>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-3)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {rule.rest}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <TffCard>
              <TffCardHeader>Post-Workout Fat Rule</TffCardHeader>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                The most critical timing rule on training days: keep dietary fat to ≤5–7g in the
                first post-workout meal. Insulin sensitivity peaks after training — this window is
                for carbohydrates (white rice or potatoes), not fat. Combining significant fat with
                the post-workout carb load may slow glycogen synthesis and blunt the anabolic
                window. Fat returns at the next meal.
              </p>
            </TffCard>
          </div>
        </div>
      )}

      {/* ── Tab: Phase 2 ──────────────────────────────────────────────────── */}
      {tab === "phase2" && (
        <div>
          <SectionHeader>Phase 2 — Macro &amp; Fuel System</SectionHeader>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Macro tracking, meal logging, and personalized carb cycling require Supabase auth
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
                Data layer required for the Macro &amp; Fuel System:
              </p>
              {(
                [
                  {
                    table: "macro_targets",
                    desc: "Per-user daily macros — protein_g, carb_g, fat_g, calories",
                  },
                  {
                    table: "meal_log",
                    desc: "Daily meal entries — user_id, meal_template_id, date, macros_json",
                  },
                  {
                    table: "saved_meals",
                    desc: "User-saved custom meal combinations from approved foods",
                  },
                  {
                    table: "training_day_type",
                    desc: "Training vs rest day schedule — user_id, date, type",
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

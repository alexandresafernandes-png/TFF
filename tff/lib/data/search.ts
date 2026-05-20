import {
  getFoods,
  getSupplements,
  getProtocols,
  getBloodMarkers,
  getCookingGuides,
  getShoppingItems,
  getClaims,
} from "@/lib/data/loaders"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ContentType =
  | "food"
  | "supplement"
  | "protocol"
  | "claim"
  | "blood_marker"
  | "cooking"
  | "shopping"

export type FilterType = ContentType | "all"

export type BadgeVariant =
  | "core"
  | "warn"
  | "prep"
  | "avoid"
  | "depends"
  | "na"
  | "default"

export interface SearchResult {
  id: string
  type: ContentType
  title: string
  description: string
  badge?: string
  badgeVariant?: BadgeVariant
  sourceRefs?: string[]
}

interface IndexEntry {
  result: SearchResult
  searchText: string
}

// ─── Module-level cache — built once per browser session ──────────────────

let _index: IndexEntry[] | null = null

export function buildSearchIndex(): IndexEntry[] {
  if (_index) return _index

  const entries: IndexEntry[] = []

  // Foods
  for (const f of getFoods()) {
    entries.push({
      result: {
        id: `food:${f.id}`,
        type: "food",
        title: f.name,
        description: f.purpose || f.why,
        badge: f.status,
        badgeVariant: foodStatusVariant(f.status),
        sourceRefs: f.source_refs,
      },
      searchText: [f.name, f.category, f.status, f.purpose, f.why]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Supplements
  for (const s of getSupplements()) {
    entries.push({
      result: {
        id: `supplement:${s.id}`,
        type: "supplement",
        title: s.name,
        description: s.purpose,
        badge: s.tier,
        badgeVariant: tierVariant(s.tier),
        sourceRefs: s.source_refs,
      },
      searchText: [s.name, s.tier, s.purpose, s.timing, ...(s.cautions ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Protocols — standard only (advanced === false)
  for (const p of getProtocols().filter((p) => !p.advanced)) {
    entries.push({
      result: {
        id: `protocol:${p.id}`,
        type: "protocol",
        title: p.name,
        description: p.goal,
        badge: p.priority,
        badgeVariant: priorityVariant(p.priority),
        sourceRefs: p.source_refs,
      },
      searchText: [
        p.name,
        p.category,
        p.goal,
        ...(p.steps ?? []).map((s) => s.text),
        ...(p.cautions ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Claims
  for (const c of getClaims()) {
    entries.push({
      result: {
        id: `claim:${c.id}`,
        type: "claim",
        title: c.claim.length > 90 ? c.claim.slice(0, 90) + "…" : c.claim,
        description: c.practical_implication || c.mechanism,
        badge: c.claim_type,
        badgeVariant: "default",
        sourceRefs: c.source_refs,
      },
      searchText: [
        c.claim,
        ...(c.topic ?? []),
        c.claim_type,
        c.mechanism,
        c.practical_implication,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Blood markers
  for (const m of getBloodMarkers()) {
    entries.push({
      result: {
        id: `blood_marker:${m.id}`,
        type: "blood_marker",
        title: m.name,
        description: m.why_it_matters,
        badge: m.panel,
        badgeVariant: "default",
        sourceRefs: m.source_refs,
      },
      searchText: [m.name, m.panel, m.optimal_range, m.why_it_matters]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Cooking guides
  for (const g of getCookingGuides()) {
    entries.push({
      result: {
        id: `cooking:${g.id}`,
        type: "cooking",
        title: g.food_name,
        description: g.notes || g.cooking_method,
        badge: "cooking guide",
        badgeVariant: "default",
        sourceRefs: g.source_refs,
      },
      searchText: [g.food_name, g.prep_method, g.cooking_method, g.avoid, g.timing]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  // Shopping items
  for (const s of getShoppingItems()) {
    entries.push({
      result: {
        id: `shopping:${s.id}`,
        type: "shopping",
        title: s.name,
        description: s.reason,
        badge: s.priority,
        badgeVariant: priorityVariant(s.priority),
        sourceRefs: s.source_refs,
      },
      searchText: [s.name, s.category, s.priority, s.reason]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })
  }

  _index = entries
  return _index
}

export function searchKnowledgeBase(query: string, filter: FilterType): SearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase().trim()
  return buildSearchIndex()
    .filter(
      (e) =>
        (filter === "all" || e.result.type === filter) &&
        e.searchText.includes(q)
    )
    .map((e) => e.result)
}

// ─── Badge variant helpers ────────────────────────────────────────────────

function foodStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "APPROVED_CORE":
      return "core"
    case "APPROVED_CONTEXT":
    case "APPROVED_SECONDARY":
    case "APPROVED_CONDITIONAL":
      return "warn"
    case "PREP_REQUIRED":
      return "prep"
    case "AVOID":
      return "avoid"
    case "DEPENDS":
      return "depends"
    case "NOT_MENTIONED":
      return "na"
    default:
      return "default"
  }
}

function tierVariant(tier: string): BadgeVariant {
  switch (tier) {
    case "TIER_1":
      return "core"
    case "TIER_2":
      return "warn"
    case "TIER_3":
      return "depends"
    case "OPTIONAL":
      return "na"
    case "CONTEXT_DEPENDENT":
      return "prep"
    default:
      return "default"
  }
}

function priorityVariant(priority: string): BadgeVariant {
  switch (priority) {
    case "critical":
      return "warn"
    case "core":
    case "high":
      return "default"
    default:
      return "na"
  }
}

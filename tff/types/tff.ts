// ─── TFF Data Types — matched to actual /data JSON schemas ───────────────────
// Last updated: Step 0.5 micro-patch
// Source of truth: inspect each /data/*.json file directly

export type Priority = "critical" | "high" | "medium" | "low" | string

// Supplement tiers (matches supplements.json tier field)
export type Tier =
  | "TIER_1"
  | "TIER_2"
  | "TIER_3"
  | "OPTIONAL"
  | "CONTEXT_DEPENDENT"
  | string

// Feature phases
export type Phase = "phase_1" | "phase_2" | "phase_3" | string

// ─── Tag ─────────────────────────────────────────────────────────────────────
export interface Tag {
  id: string
  name: string
  category: string
}

// ─── Source ──────────────────────────────────────────────────────────────────
export interface Source {
  id: string
  ebook_title: string
  shorthand: string
  notes: string
}

// ─── Food ────────────────────────────────────────────────────────────────────
export type FoodStatus =
  | "APPROVED_CORE"
  | "APPROVED_CONTEXT"
  | "PREP_REQUIRED"
  | "AVOID"
  | "DEPENDS"
  | "NOT_MENTIONED"
  // Legacy aliases present in data
  | "APPROVED_SECONDARY"
  | "APPROVED_CONDITIONAL"
  | string

export interface Food {
  id: string
  name: string
  status: FoodStatus
  category: string
  purpose: string
  why: string
  prep_required: boolean
  cooking_method: string | null
  timing: string | null
  avoid_reason: string | null
  related_protocols: string[]
  source_refs: string[]
  tags: string[]
}

// ─── Supplement ───────────────────────────────────────────────────────────────
export interface Supplement {
  id: string
  name: string
  tier: Tier
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

// ─── Protocol ────────────────────────────────────────────────────────────────
export interface ProtocolStep {
  order: number
  text: string
}

export interface Protocol {
  id: string
  name: string
  protocol_number: number
  category: string
  goal: string
  priority: Priority
  source_refs: string[]
  steps: ProtocolStep[]
  timing: string
  items_needed: string[]
  cautions: string[]
  checklist_ready: boolean
  advanced: boolean
  tags: string[]
}

// ─── BloodMarker ─────────────────────────────────────────────────────────────
export interface BloodMarker {
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

// ─── Claim ────────────────────────────────────────────────────────────────────
export interface Claim {
  id: string
  claim: string
  claim_type: string
  topic: string[]
  source_refs: string[]
  mechanism: string
  practical_implication: string
  app_usage: string
  tags: string[]
}

// ─── Routine ──────────────────────────────────────────────────────────────────
export interface RoutineSection {
  title: string
  items: string[]
}

export interface Routine {
  id: string
  name: string
  type: string
  sections: RoutineSection[]
  source_refs: string[]
  tags: string[]
}

// ─── ChecklistItem ────────────────────────────────────────────────────────────
export type ChecklistFrequency = "daily" | "weekly" | "monthly" | string
export type TimeOfDay = "morning" | "evening" | "anytime" | "night" | string

export interface ChecklistItem {
  id: string
  title: string
  description: string
  frequency: ChecklistFrequency
  time_of_day: TimeOfDay
  category: string
  priority: Priority
  linked_protocols: string[]
  linked_items: string[]
  source_refs: string[]
  tags: string[]
}

// ─── CookingGuide ─────────────────────────────────────────────────────────────
export interface CookingGuide {
  id: string
  food_id: string
  food_name: string
  prep_method: string
  cooking_method: string
  avoid: string
  timing: string
  notes: string
  source_refs: string[]
  tags: string[]
}

// ─── ShoppingItem ─────────────────────────────────────────────────────────────
export type ShoppingItemStatus = "not_bought" | "bought" | "pending" | "purchased" | "skipped" | string

export interface ShoppingItem {
  id: string
  name: string
  category: string
  priority: Priority
  reason: string
  linked_food_or_supplement: string
  estimated_price: string
  link: string
  status: ShoppingItemStatus
  source_refs: string[]
  tags: string[]
}

// ─── AppFeature ───────────────────────────────────────────────────────────────
export interface AppSubfeature {
  id: string
  name: string
  phase: Phase
  notes: string
}

export interface AppFeature {
  id: string
  name: string
  big_feature_number: string
  subfeatures: AppSubfeature[]
  priority: Priority
  effectiveness: string
  utility: string
  implementation_speed: string
  phase: Phase
  notes: string
}

// ─── Supabase user-scoped types (mirrors DB schema) ──────────────────────────
export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserSetting {
  id: string
  user_id: string
  key: string
  value: unknown
  updated_at: string
}

export interface ChecklistCompletion {
  id: string
  user_id: string
  checklist_item_id: string
  completed_date: string
  notes: string | null
  created_at: string
}

export interface UserShoppingStatus {
  id: string
  user_id: string
  shopping_item_id: string
  status: ShoppingItemStatus
  updated_at: string
}

export interface ActiveProtocol {
  id: string
  user_id: string
  protocol_id: string
  started_at: string
  ended_at: string | null
  active: boolean
}

export interface PersonalNote {
  id: string
  user_id: string
  entity_type: "food" | "supplement" | "protocol" | "blood_marker" | "general"
  entity_id: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface UserDayState {
  id: string
  user_id: string
  date: string
  state: Record<string, unknown>
  updated_at: string
}

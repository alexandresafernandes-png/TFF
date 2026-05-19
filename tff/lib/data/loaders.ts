import type {
  Food,
  Supplement,
  Protocol,
  BloodMarker,
  ChecklistItem,
  CookingGuide,
  ShoppingItem,
  AppFeature,
  Source,
  Tag,
  Claim,
  Routine,
} from "@/types/tff"

import foodsRaw from "@/data/foods.json"
import supplementsRaw from "@/data/supplements.json"
import protocolsRaw from "@/data/protocols.json"
import bloodMarkersRaw from "@/data/blood_markers.json"
import checklistItemsRaw from "@/data/checklist_items.json"
import cookingGuidesRaw from "@/data/cooking_guides.json"
import shoppingItemsRaw from "@/data/shopping_items.json"
import appFeaturesRaw from "@/data/app_features.json"
import sourcesRaw from "@/data/sources.json"
import tagsRaw from "@/data/tags.json"
import claimsRaw from "@/data/claims.json"
import routinesRaw from "@/data/routines.json"

// All casts go through unknown first — JSON inference can differ from typed interfaces
// Types are validated structurally at dev time via types/tff.ts

export function getFoods(): Food[] {
  return foodsRaw as unknown as Food[]
}

export function getSupplements(): Supplement[] {
  return supplementsRaw as unknown as Supplement[]
}

export function getProtocols(): Protocol[] {
  return protocolsRaw as unknown as Protocol[]
}

export function getBloodMarkers(): BloodMarker[] {
  return bloodMarkersRaw as unknown as BloodMarker[]
}

export function getChecklistItems(): ChecklistItem[] {
  return checklistItemsRaw as unknown as ChecklistItem[]
}

export function getCookingGuides(): CookingGuide[] {
  return cookingGuidesRaw as unknown as CookingGuide[]
}

export function getShoppingItems(): ShoppingItem[] {
  return shoppingItemsRaw as unknown as ShoppingItem[]
}

export function getAppFeatures(): AppFeature[] {
  return appFeaturesRaw as unknown as AppFeature[]
}

export function getSources(): Source[] {
  return sourcesRaw as unknown as Source[]
}

export function getTags(): Tag[] {
  return tagsRaw as unknown as Tag[]
}

export function getClaims(): Claim[] {
  return claimsRaw as unknown as Claim[]
}

export function getRoutines(): Routine[] {
  return routinesRaw as unknown as Routine[]
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getFoodById(id: string): Food | undefined {
  return getFoods().find((f) => f.id === id)
}

export function getSupplementById(id: string): Supplement | undefined {
  return getSupplements().find((s) => s.id === id)
}

export function getProtocolById(id: string): Protocol | undefined {
  return getProtocols().find((p) => p.id === id)
}

export function getBloodMarkerById(id: string): BloodMarker | undefined {
  return getBloodMarkers().find((m) => m.id === id)
}

export function getChecklistItemById(id: string): ChecklistItem | undefined {
  return getChecklistItems().find((c) => c.id === id)
}

export function getShoppingItemById(id: string): ShoppingItem | undefined {
  return getShoppingItems().find((s) => s.id === id)
}

export function getItemsByTag(tag: string): {
  foods: Food[]
  supplements: Supplement[]
  protocols: Protocol[]
} {
  return {
    foods: getFoods().filter((f) => f.tags?.includes(tag)),
    supplements: getSupplements().filter((s) => s.tags?.includes(tag)),
    protocols: getProtocols().filter((p) => p.tags?.includes(tag)),
  }
}

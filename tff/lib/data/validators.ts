import type { Food, Supplement, Protocol } from "@/types/tff"

export function isValidFood(item: unknown): item is Food {
  if (typeof item !== "object" || item === null) return false
  const f = item as Record<string, unknown>
  return typeof f.id === "string" && typeof f.name === "string"
}

export function isValidSupplement(item: unknown): item is Supplement {
  if (typeof item !== "object" || item === null) return false
  const s = item as Record<string, unknown>
  return typeof s.id === "string" && typeof s.name === "string"
}

export function isValidProtocol(item: unknown): item is Protocol {
  if (typeof item !== "object" || item === null) return false
  const p = item as Record<string, unknown>
  return typeof p.id === "string" && typeof p.name === "string"
}

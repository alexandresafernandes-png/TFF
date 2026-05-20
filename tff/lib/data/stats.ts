import {
  getFoods,
  getSupplements,
  getProtocols,
  getBloodMarkers,
  getChecklistItems,
  getCookingGuides,
  getShoppingItems,
  getClaims,
} from "@/lib/data/loaders"

export interface DataStats {
  foods: number
  supplements: number
  protocols: number
  bloodMarkers: number
  checklistItems: number
  cookingGuides: number
  shoppingItems: number
  claims: number
  total: number
}

export function getDataStats(): DataStats {
  const foods = getFoods().length
  const supplements = getSupplements().length
  const protocols = getProtocols().length
  const bloodMarkers = getBloodMarkers().length
  const checklistItems = getChecklistItems().length
  const cookingGuides = getCookingGuides().length
  const shoppingItems = getShoppingItems().length
  const claims = getClaims().length

  return {
    foods,
    supplements,
    protocols,
    bloodMarkers,
    checklistItems,
    cookingGuides,
    shoppingItems,
    claims,
    total:
      foods +
      supplements +
      protocols +
      bloodMarkers +
      checklistItems +
      cookingGuides +
      shoppingItems +
      claims,
  }
}

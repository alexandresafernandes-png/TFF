import { TffBadge } from "./TffBadge"
import type { FoodStatus } from "@/types/tff"

type StatusBadgeProps = {
  status: FoodStatus | string
  className?: string
}

const STATUS_CONFIG: Record<string, { variant: "core" | "warn" | "prep" | "avoid" | "depends" | "na"; label: string }> = {
  APPROVED_CORE:    { variant: "core",    label: "Core" },
  APPROVED_CONTEXT: { variant: "warn",    label: "Context" },
  PREP_REQUIRED:    { variant: "prep",    label: "Prep Required" },
  AVOID:            { variant: "avoid",   label: "Avoid" },
  DEPENDS:          { variant: "depends", label: "Depends" },
  NOT_MENTIONED:    { variant: "na",      label: "—" },
  // Legacy aliases from data
  APPROVED_SECONDARY:    { variant: "warn", label: "Secondary" },
  APPROVED_CONDITIONAL:  { variant: "prep", label: "Conditional" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { variant: "na" as const, label: status }
  return (
    <TffBadge variant={config.variant} dot className={className}>
      {config.label}
    </TffBadge>
  )
}

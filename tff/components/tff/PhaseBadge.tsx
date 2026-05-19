import { TffBadge } from "./TffBadge"

type PhaseBadgeProps = {
  phase: string
  className?: string
}

const PHASE_CONFIG: Record<string, { variant: "default" | "warn" | "na"; label: string }> = {
  phase_1: { variant: "default", label: "Phase 1" },
  phase_2: { variant: "warn",    label: "Phase 2" },
  phase_3: { variant: "na",      label: "Phase 3" },
}

export function PhaseBadge({ phase, className }: PhaseBadgeProps) {
  const config = PHASE_CONFIG[phase] ?? { variant: "na" as const, label: phase }
  return (
    <TffBadge variant={config.variant} className={className}>
      {config.label}
    </TffBadge>
  )
}

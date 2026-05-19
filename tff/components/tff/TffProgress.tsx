import { cn } from "@/lib/utils/cn"

interface TffProgressProps {
  value: number // 0–100
  variant?: "default" | "warn" | "danger"
  className?: string
}

export function TffProgress({ value, variant = "default", className }: TffProgressProps) {
  const fillClass = {
    default: "",
    warn:    "bar-fill-warn",
    danger:  "bar-fill-danger",
  }[variant]

  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("bar-track", className)}>
      <div
        className={cn("bar-fill", fillClass)}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

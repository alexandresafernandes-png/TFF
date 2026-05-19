"use client"

import { cn } from "@/lib/utils/cn"

interface TffBadgeProps {
  children: React.ReactNode
  variant?: "default" | "core" | "warn" | "prep" | "avoid" | "depends" | "na"
  dot?: boolean
  className?: string
}

export function TffBadge({
  children,
  variant = "default",
  dot = false,
  className,
}: TffBadgeProps) {
  const variantClass = {
    default: "",
    core: "badge-core",
    warn: "badge-warn",
    prep: "badge-prep",
    avoid: "badge-avoid",
    depends: "badge-depends",
    na: "badge-na",
  }[variant]

  return (
    <span className={cn("badge", variantClass, className)}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

"use client"

import { cn } from "@/lib/utils/cn"

interface TffButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "ghost" | "danger"
  size?: "default" | "sm"
  children: React.ReactNode
}

export function TffButton({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: TffButtonProps) {
  const variantClass = {
    default:  "",
    primary:  "btn-primary",
    ghost:    "btn-ghost",
    danger:   "btn-danger",
  }[variant]

  const sizeClass = size === "sm" ? "btn-sm" : ""

  return (
    <button
      className={cn("btn", variantClass, sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  )
}

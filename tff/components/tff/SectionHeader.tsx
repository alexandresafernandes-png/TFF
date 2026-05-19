import { cn } from "@/lib/utils/cn"

interface SectionHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <div
      className={cn("label", className)}
      style={{
        padding: "10px 0 8px",
        borderBottom: "1px solid var(--border-soft)",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  )
}

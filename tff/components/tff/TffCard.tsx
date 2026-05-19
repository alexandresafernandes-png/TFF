import { cn } from "@/lib/utils/cn"

interface TffCardProps {
  children: React.ReactNode
  className?: string
  nested?: boolean
  style?: React.CSSProperties
}

export function TffCard({ children, className, nested = false, style }: TffCardProps) {
  return (
    <div
      className={cn(nested ? "card-2" : "card", className)}
      style={{ padding: "20px 22px", ...style }}
    >
      {children}
    </div>
  )
}

export function TffCardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("label", className)}
      style={{ marginBottom: 12 }}
    >
      {children}
    </div>
  )
}

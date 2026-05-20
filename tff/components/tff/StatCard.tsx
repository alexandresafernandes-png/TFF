import { TffCard } from "./TffCard"

interface StatCardProps {
  label: string
  count: number
}

export function StatCard({ label, count }: StatCardProps) {
  return (
    <TffCard>
      <span
        className="mono"
        style={{
          display: "block",
          fontSize: "var(--t-display)",
          fontWeight: 700,
          color: "var(--accent)",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {count}
      </span>
      <span className="label">{label}</span>
    </TffCard>
  )
}

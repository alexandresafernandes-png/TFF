import Link from "next/link"

interface QuickActionCardProps {
  label: string
  href: string
  description: string
}

export function QuickActionCard({ label, href, description }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="action-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "16px 18px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        textDecoration: "none",
        transition: "background 120ms, border-color 120ms",
      }}
    >
      <span className="label" style={{ color: "var(--text)" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--t-small)",
          color: "var(--text-3)",
          lineHeight: 1.4,
        }}
      >
        {description}
      </span>
    </Link>
  )
}

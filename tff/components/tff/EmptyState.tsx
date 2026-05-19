interface EmptyStateProps {
  heading: string
  sub?: string
  action?: React.ReactNode
}

export function EmptyState({ heading, sub, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        textAlign: "center",
        gap: 8,
      }}
    >
      {/* Tactical minus glyph — no emoji, no illustration */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: "var(--text-4)", marginBottom: 8 }}
      >
        <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
      </svg>
      <p style={{ fontSize: "var(--t-h3)", color: "var(--text-2)", fontWeight: 500 }}>
        {heading}
      </p>
      {sub && (
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>{sub}</p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

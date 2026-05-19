interface PageHeaderProps {
  crumb: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ crumb, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        paddingBottom: 24,
        borderBottom: "1px solid var(--border)",
        marginBottom: 24,
      }}
    >
      <div>
        <p className="label" style={{ marginBottom: 6 }}>{crumb}</p>
        <h1
          style={{
            fontSize: "var(--t-h1)",
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}

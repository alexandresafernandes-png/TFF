interface LoadingStateProps {
  rows?: number
}

export function LoadingState({ rows = 4 }: LoadingStateProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 44, width: "100%", opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

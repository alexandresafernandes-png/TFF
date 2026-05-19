"use client"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  message = "Could not load — check data source.",
  onRetry,
}: ErrorStateProps) {
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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: "var(--danger)", marginBottom: 8 }}
      >
        <path
          d="M12 4L2 20h20L12 4zm0 3.5L19.5 19h-15L12 7.5zM11 11v4h2v-4h-2zm0 5v2h2v-2h-2z"
          fill="currentColor"
        />
      </svg>
      <p style={{ fontSize: "var(--t-h3)", color: "var(--text-2)", fontWeight: 500 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm"
          style={{ marginTop: 12 }}
        >
          Retry
        </button>
      )}
    </div>
  )
}

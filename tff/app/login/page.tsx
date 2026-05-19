export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card"
        style={{
          width: 360,
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Product mark */}
        <div style={{ marginBottom: 32 }}>
          <p
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-4)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Operator Access
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "0.06em",
            }}
          >
            TFF
          </h1>
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              marginTop: 6,
            }}
          >
            Private command center.
          </p>
        </div>

        {/* Auth placeholder — wired in Step 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label
              className="kv-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="operator@tff.private"
              style={{
                width: "100%",
                background: "#0e0e11",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
                fontFamily: "'Geist', sans-serif",
                fontSize: "var(--t-body)",
                padding: "9px 12px",
                outline: "none",
              }}
              readOnly
            />
          </div>

          <div>
            <label
              className="kv-label"
              style={{ display: "block", marginBottom: 6 }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••"
              style={{
                width: "100%",
                background: "#0e0e11",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
                fontFamily: "'Geist', sans-serif",
                fontSize: "var(--t-body)",
                padding: "9px 12px",
                outline: "none",
              }}
              readOnly
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            disabled
          >
            Access TFF
          </button>
        </div>

        {/* Status */}
        <div
          style={{
            marginTop: 24,
            padding: "10px 14px",
            background: "var(--card-2)",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
          }}
        >
          <p
            className="mono"
            style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}
          >
            SUPABASE AUTH · CONFIGURE IN STEP 2
          </p>
        </div>
      </div>
    </div>
  )
}

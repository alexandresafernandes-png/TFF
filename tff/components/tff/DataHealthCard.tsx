import { TffCard, TffCardHeader } from "./TffCard"
import { TffBadge } from "./TffBadge"

interface DataHealthCardProps {
  totalRecords: number
  supabaseReady: boolean
}

export function DataHealthCard({ totalRecords, supabaseReady }: DataHealthCardProps) {
  return (
    <TffCard>
      <TffCardHeader>Data Package</TffCardHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <TffBadge variant="core" dot>
            Loaded
          </TffBadge>
          <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
            Source: /data JSON
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: 4 }}>
              Total Records
            </p>
            <p
              className="mono"
              style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)" }}
            >
              {totalRecords}
            </p>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 4 }}>
              Supabase
            </p>
            <div style={{ marginTop: 2 }}>
              {supabaseReady ? (
                <TffBadge variant="core" dot>
                  Configured
                </TffBadge>
              ) : (
                <TffBadge variant="na">Not configured</TffBadge>
              )}
            </div>
          </div>

          <div>
            <p className="label" style={{ marginBottom: 4 }}>
              User Data
            </p>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
              Supabase-ready
            </p>
          </div>
        </div>
      </div>
    </TffCard>
  )
}

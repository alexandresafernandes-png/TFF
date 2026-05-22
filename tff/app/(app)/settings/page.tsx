import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"

function KVRow({
  label,
  value,
  last = false,
}: {
  label: string
  value: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: last ? "none" : "1px solid var(--border-soft)",
      }}
    >
      <span className="kv-label">{label}</span>
      <span style={{ fontSize: "var(--t-small)", color: "var(--text-2)" }}>
        {value}
      </span>
    </div>
  )
}

export default function SettingsPage() {
  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="SYSTEM · SETTINGS"
        title="Settings"
        subtitle="App configuration and operator preferences."
      />

      {/* ── 1. App Status ─────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>App Status</SectionHeader>
        <TffCard>
          <KVRow label="Phase" value={<TffBadge variant="core" dot>Phase 1</TffBadge>} />
          <KVRow label="App" value="TFF — Private Operator Command Center" />
          <KVRow label="Build" value="Phase 1 · Static data layer" />
          <KVRow
            label="Supabase"
            value={
              supabaseConfigured ? (
                <TffBadge variant="core" dot>Configured</TffBadge>
              ) : (
                <TffBadge variant="warn" dot>Not configured</TffBadge>
              )
            }
          />
          <KVRow label="Auth" value={<TffBadge variant="na">Disabled — Phase 1</TffBadge>} last />
        </TffCard>
      </div>

      {/* ── 2. Personal Profile ───────────────────────────────────────────── */}
      <div>
        <SectionHeader>Personal Profile</SectionHeader>
        <TffCard>
          <TffCardHeader>Operator Identity</TffCardHeader>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
            Profile data is tied to Supabase Auth. Once auth is active, name, email, and
            avatar will be pulled from your session automatically.
          </p>
          <div
            style={{
              padding: "12px 14px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>
              REQUIRES SUPABASE AUTH
            </p>
            <TffBadge variant="na">Phase 1.5</TffBadge>
          </div>
        </TffCard>
      </div>

      {/* ── 3. Preferences ────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Preferences</SectionHeader>
        <TffCard>
          <KVRow
            label="Theme"
            value={<TffBadge variant="default">Dark (fixed)</TffBadge>}
          />
          <KVRow
            label="Advanced Mode"
            value={<TffBadge variant="na">Hidden — Phase 1</TffBadge>}
          />
          <KVRow
            label="DHT Protocols (16–24)"
            value={<TffBadge variant="na">Locked</TffBadge>}
          />
          <KVRow
            label="User-configurable preferences"
            value={<TffBadge variant="na">Phase 1.5</TffBadge>}
            last
          />
        </TffCard>
        <p
          style={{
            fontSize: "var(--t-micro)",
            color: "var(--text-4)",
            marginTop: 8,
            paddingLeft: 2,
          }}
        >
          Preference persistence (localStorage / Supabase) ships in Phase 1.5.
        </p>
      </div>

      {/* ── 4. Data & Sync ────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Data &amp; Sync</SectionHeader>
        <TffCard>
          <TffCardHeader>Knowledge Base</TffCardHeader>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>
            All data is currently shipped as a static JSON package bundled at build time.
            No network requests are made for content.
          </p>
          <KVRow label="Source" value="Static /data package" />
          <KVRow label="Foods" value="Bundled" />
          <KVRow label="Supplements" value="Bundled" />
          <KVRow label="Protocols" value="Bundled" />
          <KVRow label="Live sync" value={<TffBadge variant="na">Phase 2</TffBadge>} last />
        </TffCard>

        <TffCard style={{ marginTop: 10 }}>
          <TffCardHeader>Supabase Sync</TffCardHeader>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
            Cloud persistence for checklist state, personal notes, protocol tracking, and
            user-specific data will sync through Supabase once auth is configured.
          </p>
          <div
            style={{
              padding: "12px 14px",
              background: "var(--card-2)",
              border: "1px solid var(--border-soft)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}>
              CLOUD SYNC · NOT ACTIVE
            </p>
            <TffBadge variant="na">Phase 2</TffBadge>
          </div>
        </TffCard>
      </div>
    </div>
  )
}

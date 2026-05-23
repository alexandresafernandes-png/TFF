import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { hasSupabaseConfig, missingSupabaseEnvNames } from "@/lib/supabase/status"

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
  const supabaseConfigured = hasSupabaseConfig

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
          <TffCardHeader>Supabase &amp; Cloud Sync</TffCardHeader>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 12, lineHeight: 1.5 }}>
            Cloud persistence for checklist state, personal notes, protocol tracking, and
            user-specific data. Requires Supabase project setup (Phase 1.5).
          </p>
          <KVRow label="Supabase project" value={
            supabaseConfigured
              ? <TffBadge variant="core" dot>Configured</TffBadge>
              : <TffBadge variant="warn" dot>Not configured</TffBadge>
          } />
          <KVRow label="Auth" value={<TffBadge variant="na">Not active — Phase 1.5</TffBadge>} />
          <KVRow label="Cloud sync" value={<TffBadge variant="na">Phase 2</TffBadge>} />
          <KVRow label="Local-first mode" value={<TffBadge variant="core" dot>Active</TffBadge>} last />
          {!supabaseConfigured && missingSupabaseEnvNames.length > 0 && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em", marginBottom: 6 }}>MISSING ENV VARS</p>
              {missingSupabaseEnvNames.map((name) => (
                <p key={name} className="mono" style={{ fontSize: 10, color: "var(--warn)", letterSpacing: "0.06em" }}>{name}</p>
              ))}
            </div>
          )}
        </TffCard>
      </div>

      {/* ── 5. Phase Roadmap ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Phase Roadmap</SectionHeader>
        <TffCard>
          <KVRow
            label="Phase 1 — Foundation"
            value={<TffBadge variant="core" dot>Active Now</TffBadge>}
          />
          <KVRow
            label="Phase 1.5 — Polish"
            value={<TffBadge variant="na">Upcoming</TffBadge>}
          />
          <KVRow
            label="Phase 2 — Personal Tracking"
            value={<TffBadge variant="na">Future</TffBadge>}
            last
          />
        </TffCard>
        <TffCard style={{ marginTop: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { phase: "Phase 1",   badge: "core" as const,    label: "Local-first app foundation", items: ["Static knowledge base (11 pages)", "TFF source-backed content", "localStorage tracking (checklist, shopping, routines)", "Search across all data files", "No auth, no server, no env vars"] },
              { phase: "Phase 1.5", badge: "default" as const, label: "Visual polish + infra setup",   items: ["Mobile / PWA improvements", "Supabase project setup", "Auth scaffolding (no user-facing login yet)", "Performance tuning", "CI/CD pipeline"] },
              { phase: "Phase 2",   badge: "na" as const,      label: "Personal tracking layer",       items: ["User-specific data (macros, bloodwork history)", "Active protocol tracking", "Routine streaks and scheduling", "Dashboard live stats", "Cross-device sync via Supabase"] },
            ].map((row) => (
              <div key={row.phase} style={{ paddingBottom: 10, borderBottom: "1px solid var(--border-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <TffBadge variant={row.badge}>{row.phase}</TffBadge>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--text-2)", fontWeight: 500 }}>{row.label}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {row.items.map((item) => (
                    <li key={item} style={{ fontSize: "var(--t-small)", color: "var(--text-4)", lineHeight: 1.6 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TffCard>
      </div>
    </div>
  )
}

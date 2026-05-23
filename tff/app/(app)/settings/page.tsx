import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { AuthSessionStatus } from "@/components/tff/AuthSessionStatus"
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
          <KVRow label="Phase" value={<TffBadge variant="core" dot>Phase 1.5</TffBadge>} />
          <KVRow label="App" value="TFF — Private Operator Command Center" />
          <KVRow label="Build" value="Phase 1.5 · Sync layer active" />
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
          <KVRow
            label="Auth"
            value={
              supabaseConfigured ? (
                <TffBadge variant="core" dot>Magic link — Active</TffBadge>
              ) : (
                <TffBadge variant="na">Disabled — no Supabase</TffBadge>
              )
            }
            last
          />
        </TffCard>
      </div>

      {/* ── 2. Authentication ─────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Authentication</SectionHeader>
        <TffCard>
          <KVRow
            label="Auth UI"
            value={
              supabaseConfigured ? (
                <TffBadge variant="core" dot>Ready</TffBadge>
              ) : (
                <TffBadge variant="warn">Not available</TffBadge>
              )
            }
          />
          <KVRow label="Route protection" value={<TffBadge variant="core" dot>Active</TffBadge>} />
          <KVRow label="Active session" value={<TffBadge variant="core" dot>Required</TffBadge>} />
          <KVRow label="Local-first fallback" value={<TffBadge variant="core" dot>Active (internal)</TffBadge>} />
          <KVRow
            label="Cloud sync"
            value={
              supabaseConfigured ? (
                <TffBadge variant="core" dot>Active — Phase 1.5</TffBadge>
              ) : (
                <TffBadge variant="na">Requires Supabase</TffBadge>
              )
            }
            last
          />
        </TffCard>
      </div>

      {/* ── 3. Account ────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Account</SectionHeader>
        <AuthSessionStatus />
      </div>

      {/* ── 4. Preferences ────────────────────────────────────────────────── */}
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
          User-configurable preferences ship in Phase 2.
        </p>
      </div>

      {/* ── 5. Data & Sync ────────────────────────────────────────────────── */}
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
            Cloud persistence for checklist, shopping, routines, protocol tracking, and personal
            notes. Sync is opt-in — local-first fallback is always active on every synced page.
          </p>
          <KVRow label="Supabase project" value={
            supabaseConfigured
              ? <TffBadge variant="core" dot>Configured</TffBadge>
              : <TffBadge variant="warn" dot>Not configured</TffBadge>
          } />
          <KVRow
            label="Auth"
            value={
              supabaseConfigured ? (
                <TffBadge variant="core" dot>Active — Phase 1.5</TffBadge>
              ) : (
                <TffBadge variant="na">Not configured</TffBadge>
              )
            }
          />
          <KVRow label="Checklist" value={supabaseConfigured ? <TffBadge variant="core" dot>Synced</TffBadge> : <TffBadge variant="na">Local only</TffBadge>} />
          <KVRow label="Shopping" value={supabaseConfigured ? <TffBadge variant="core" dot>Synced</TffBadge> : <TffBadge variant="na">Local only</TffBadge>} />
          <KVRow label="Routines" value={supabaseConfigured ? <TffBadge variant="core" dot>Synced</TffBadge> : <TffBadge variant="na">Local only</TffBadge>} />
          <KVRow label="Protocol tracking" value={supabaseConfigured ? <TffBadge variant="core" dot>Synced</TffBadge> : <TffBadge variant="na">Local only</TffBadge>} />
          <KVRow label="Personal notes" value={supabaseConfigured ? <TffBadge variant="core" dot>Synced</TffBadge> : <TffBadge variant="na">Local only</TffBadge>} />
          <KVRow label="Route protection" value={<TffBadge variant="core" dot>Active</TffBadge>} />
          <KVRow label="Local-first fallback" value={<TffBadge variant="core" dot>Always active</TffBadge>} last />
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

      {/* ── 6. Phase Roadmap ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Phase Roadmap</SectionHeader>
        <TffCard>
          <KVRow
            label="Phase 1 — Foundation"
            value={<TffBadge variant="core" dot>Complete</TffBadge>}
          />
          <KVRow
            label="Phase 1.5 — Sync Layer"
            value={<TffBadge variant="core" dot>Active Now</TffBadge>}
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
              { phase: "Phase 1",   badge: "core" as const,    label: "Local-first app foundation", items: ["Static knowledge base (11 pages)", "TFF source-backed content", "localStorage tracking (checklist, shopping, routines)", "Search across all data files", "No auth, no server, no env vars required"] },
              { phase: "Phase 1.5", badge: "core" as const,    label: "Sync layer + auth",            items: ["Supabase project setup and schema (9 tables)", "Magic link authentication", "Cloud sync for checklist, shopping, routines, protocols", "Personal notes on protocols and bloodwork markers", "Dashboard personal summary (live cloud data)", "localStorage-first with cloud fallback on all synced pages"] },
              { phase: "Phase 2",   badge: "na" as const,      label: "Personal tracking layer",       items: ["User-specific data (macros, bloodwork history entries)", "Routine streaks and scheduling", "Dashboard trend tracking and live charts", "Enhanced personal health tracking"] },
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

import Link from "next/link"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { EmptyState } from "@/components/tff/EmptyState"
import { StatCard } from "@/components/tff/StatCard"
import { QuickActionCard } from "@/components/tff/QuickActionCard"
import { DataHealthCard } from "@/components/tff/DataHealthCard"
import { getDataStats } from "@/lib/data/stats"
import { getChecklistItems } from "@/lib/data/loaders"

const QUICK_ACTIONS = [
  {
    label: "Knowledge Search",
    href: "/search",
    description: "Search foods, supplements, protocols, and claims.",
  },
  {
    label: "Daily Checklist",
    href: "/checklist",
    description: "Track your critical daily habits and non-negotiables.",
  },
  {
    label: "Protocol Library",
    href: "/protocols",
    description: "Browse and follow structured optimization protocols.",
  },
  {
    label: "Nutrition & Cooking",
    href: "/nutrition",
    description: "Approved foods, cooking guides, and prep methods.",
  },
  {
    label: "Bloodwork Reference",
    href: "/bloodwork",
    description: "Optimal ranges and markers to track and interpret.",
  },
  {
    label: "Shopping List",
    href: "/shopping",
    description: "Prioritized items to source for the protocol.",
  },
]

const CATEGORY_BADGE_VARIANT: Record<string, "core" | "warn" | "default"> = {
  sleep: "warn",
  morning_light: "core",
  nutrition: "default",
}

export default function DashboardPage() {
  const stats = getDataStats()
  const supabaseReady = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const medItems = getChecklistItems()
    .filter(
      (item) =>
        item.priority === "critical" &&
        ["sleep", "morning_light", "nutrition"].includes(item.category)
    )
    .slice(0, 6)

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 01 / DASHBOARD"
        title="TFF"
        subtitle="Phase 1 command center."
      />

      {/* ── 1. Today Overview ─────────────────────────────────────────────── */}
      <TffCard>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p className="label">TODAY</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: "var(--t-h2)",
                  fontWeight: 600,
                  color: "var(--text)",
                }}
              >
                Training Day
              </span>
              <TffBadge variant="na">Placeholder</TffBadge>
            </div>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-4)",
                maxWidth: 400,
              }}
            >
              Day type selector is a static placeholder — will be configurable in an upcoming step.
            </p>
          </div>
          <TffBadge variant="core" dot>
            Phase 1
          </TffBadge>
        </div>
      </TffCard>

      {/* ── 2. Knowledge Base Stats ───────────────────────────────────────── */}
      <div>
        <SectionHeader>Knowledge Base</SectionHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 10,
          }}
        >
          <StatCard label="Foods" count={stats.foods} />
          <StatCard label="Supplements" count={stats.supplements} />
          <StatCard label="Protocols" count={stats.protocols} />
          <StatCard label="Blood Markers" count={stats.bloodMarkers} />
          <StatCard label="Checklist Items" count={stats.checklistItems} />
          <StatCard label="Cooking Guides" count={stats.cookingGuides} />
          <StatCard label="Shopping Items" count={stats.shoppingItems} />
          <StatCard label="Claims" count={stats.claims} />
        </div>
      </div>

      {/* ── 3. Phase 1 Quick Actions ──────────────────────────────────────── */}
      <div>
        <SectionHeader>Phase 1 Quick Actions</SectionHeader>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.href}
              label={action.label}
              href={action.href}
              description={action.description}
            />
          ))}
        </div>
      </div>

      {/* ── 4. Current Focus + Minimum Effective Day ──────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Current Focus */}
        <TffCard>
          <TffCardHeader>Current Focus</TffCardHeader>
          <EmptyState
            heading="No active protocol selected yet."
            sub="Browse the protocol library and select one to track."
            action={
              <Link href="/protocols" className="btn btn-primary">
                Browse Protocols
              </Link>
            }
          />
        </TffCard>

        {/* Minimum Effective Day */}
        <TffCard>
          <TffCardHeader>Minimum Effective Day</TffCardHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {medItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom:
                    idx < medItems.length - 1
                      ? "1px solid var(--border-soft)"
                      : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-2)",
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {item.title}
                </span>
                <TffBadge
                  variant={CATEGORY_BADGE_VARIANT[item.category] ?? "default"}
                >
                  {item.category.replace("_", " ")}
                </TffBadge>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "var(--t-micro)",
              color: "var(--text-4)",
              marginTop: 12,
            }}
          >
            Critical priority · categories: sleep, morning light, nutrition
          </p>
        </TffCard>
      </div>

      {/* ── 5. Advanced Mode Notice ───────────────────────────────────────── */}
      <TffCard>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <TffCardHeader>Advanced Mode</TffCardHeader>
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-3)",
                maxWidth: 520,
                lineHeight: 1.5,
              }}
            >
              Advanced DHT protocols are hidden by default. Protocols 16–24
              (advanced DHT optimization) are available behind Advanced Mode,
              enabled in a future step. Standard Phase 1 protocols are fully
              accessible now.
            </p>
          </div>
          <TffBadge variant="na">Hidden</TffBadge>
        </div>
      </TffCard>

      {/* ── 6. Data Package Health ────────────────────────────────────────── */}
      <DataHealthCard
        totalRecords={stats.total}
        supabaseReady={supabaseReady}
      />
    </div>
  )
}

import { PageHeader } from "@/components/tff/PageHeader"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { StatCard } from "@/components/tff/StatCard"
import { QuickActionCard } from "@/components/tff/QuickActionCard"
import { DashboardCommandCenter } from "@/components/tff/DashboardCommandCenter"
import { getDataStats } from "@/lib/data/stats"

// Priority first, reference tools second
const QUICK_ACTIONS = [
  {
    label:       "Daily Progress",
    href:        "/progress",
    description: "Today's execution score — checklist, routines, and protocols.",
  },
  {
    label:       "Weekly Review",
    href:        "/weekly-review",
    description: "7-day summary of Daily Progress snapshots and consistency trends.",
  },
  {
    label:       "Macro & Fuel",
    href:        "/fuel",
    description: "Set macro targets and log daily food intake by meal.",
  },
  {
    label:       "Supplement Schedule",
    href:        "/supplement-schedule",
    description: "Personal supplement timing blocks and daily completion tracking.",
  },
  {
    label:       "Protocol Library",
    href:        "/protocols",
    description: "Browse and follow structured optimization protocols.",
  },
  {
    label:       "Bloodwork Tracking",
    href:        "/bloodwork-tracking",
    description: "Log lab results, track marker history, and compare draws over time.",
  },
  {
    label:       "Knowledge Search",
    href:        "/search",
    description: "Search foods, supplements, protocols, and claims.",
  },
  {
    label:       "Daily Checklist",
    href:        "/checklist",
    description: "Track your critical daily habits and non-negotiables.",
  },
  {
    label:       "Bloodwork Reference",
    href:        "/bloodwork",
    description: "Optimal ranges and markers to track and interpret.",
  },
  {
    label:       "Nutrition & Cooking",
    href:        "/nutrition",
    description: "Approved foods, cooking guides, and prep methods.",
  },
  {
    label:       "Supplements",
    href:        "/supplements",
    description: "Full supplement stack with timing, dose, and source refs.",
  },
  {
    label:       "Shopping List",
    href:        "/shopping",
    description: "Prioritized items to source for the protocol.",
  },
  {
    label:       "Routines",
    href:        "/routines",
    description: "Daily, training, sleep, and weekly routine systems.",
  },
  {
    label:       "Settings",
    href:        "/settings",
    description: "Account, sign-in, and app preferences.",
  },
]

export default function DashboardPage() {
  const stats = getDataStats()

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 01 / DASHBOARD"
        title="TFF Command Center"
        subtitle="Today's execution, weekly consistency, and active systems."
      />

      {/* ── Phase 2: Command Center (client — data from Supabase when signed in) */}
      <DashboardCommandCenter />

      {/* ── Knowledge Base ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Knowledge Base</SectionHeader>
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap:                 10,
          }}
        >
          <StatCard label="Foods"           count={stats.foods} />
          <StatCard label="Supplements"     count={stats.supplements} />
          <StatCard label="Protocols"       count={stats.protocols} />
          <StatCard label="Blood Markers"   count={stats.bloodMarkers} />
          <StatCard label="Checklist Items" count={stats.checklistItems} />
          <StatCard label="Cooking Guides"  count={stats.cookingGuides} />
          <StatCard label="Shopping Items"  count={stats.shoppingItems} />
          <StatCard label="Claims"          count={stats.claims} />
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Quick Actions</SectionHeader>
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap:                 10,
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
    </div>
  )
}

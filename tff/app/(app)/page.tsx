import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 01 / DASHBOARD"
        title="Dashboard"
        subtitle="Command center overview."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Dashboard content loads in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

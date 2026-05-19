import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function DailyChecklistPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 03 / CHECKLIST"
        title="Daily Checklist"
        subtitle="Today's protocol checklist."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Checklist functionality builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

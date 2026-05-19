import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function BloodworkPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 07 / BLOODWORK"
        title="Bloodwork"
        subtitle="Blood marker reference panels."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Bloodwork reference builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

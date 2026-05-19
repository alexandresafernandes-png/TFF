import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function SupplementsPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 06 / SUPPLEMENTS"
        title="Supplements"
        subtitle="Supplement database by tier."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Supplement list builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

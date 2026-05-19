import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function RoutinesPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 09 / ROUTINES"
        title="Routines"
        subtitle="Daily and training routines."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Routines content builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

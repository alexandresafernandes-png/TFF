import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function ShoppingListPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 08 / SHOPPING"
        title="Shopping List"
        subtitle="Items to source and track."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Shopping list builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

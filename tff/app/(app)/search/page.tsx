import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function KnowledgeSearchPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 02 / SEARCH"
        title="Knowledge Search"
        subtitle="Search all knowledge sources."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Search interface builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

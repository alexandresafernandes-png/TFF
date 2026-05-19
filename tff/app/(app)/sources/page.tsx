import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function SourcesAndReferencesPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 10 / SOURCES"
        title="Sources & References"
        subtitle="Source ebooks and references."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Sources content builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

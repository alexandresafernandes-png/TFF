import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function ProtocolLibraryPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 04 / PROTOCOLS"
        title="Protocol Library"
        subtitle="Protocols 1–15 reference."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Protocol list builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

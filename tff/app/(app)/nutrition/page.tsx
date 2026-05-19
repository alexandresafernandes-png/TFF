import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"

export default function NutritionAndCookingPage() {
  return (
    <div>
      <PageHeader
        crumb="INDEX · 05 / NUTRITION"
        title="Nutrition & Cooking"
        subtitle="Approved foods and prep guides."
      />

      <TffCard>
        <TffCardHeader>Step 1 Shell</TffCardHeader>
        <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
          Nutrition content builds in Step 2.
        </p>
      </TffCard>
    </div>
  )
}

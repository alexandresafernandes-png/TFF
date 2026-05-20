import { TffCard } from "./TffCard"
import { TffBadge } from "./TffBadge"
import type { SearchResult, ContentType } from "@/lib/data/search"

const TYPE_LABELS: Record<ContentType, string> = {
  food:         "Food",
  supplement:   "Supplement",
  protocol:     "Protocol",
  claim:        "Claim",
  blood_marker: "Marker",
  cooking:      "Cooking",
  shopping:     "Shopping",
}

interface SearchResultCardProps {
  result: SearchResult
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const { type, title, description, badge, badgeVariant, sourceRefs } = result
  const typeLabel = TYPE_LABELS[type]

  return (
    <TffCard>
      {/* Title + content type */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: badge ? 8 : 10,
        }}
      >
        <span
          style={{
            fontSize: "var(--t-h3)",
            fontWeight: 500,
            color: "var(--text)",
            lineHeight: 1.3,
            flex: 1,
          }}
        >
          {title}
        </span>
        <span
          className="label"
          style={{ flexShrink: 0, color: "var(--text-4)" }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Status / tier / priority badge */}
      {badge && (
        <div style={{ marginBottom: 10 }}>
          <TffBadge variant={badgeVariant ?? "default"}>
            {badge.replace(/_/g, " ")}
          </TffBadge>
        </div>
      )}

      {/* Description — 2-line clamp */}
      {description && (
        <p
          style={
            {
              fontSize: "var(--t-small)",
              color: "var(--text-3)",
              lineHeight: 1.5,
              marginBottom: 12,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties
          }
        >
          {description}
        </p>
      )}

      {/* Source refs + View button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        {sourceRefs && sourceRefs.length > 0 ? (
          <span
            className="mono"
            style={{
              fontSize: "var(--t-micro)",
              color: "var(--text-4)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sourceRefs.slice(0, 2).join(" · ")}
          </span>
        ) : (
          <span />
        )}
        <button
          className="btn btn-sm"
          disabled
          style={{ opacity: 0.35, cursor: "not-allowed", flexShrink: 0 }}
        >
          View →
        </button>
      </div>
    </TffCard>
  )
}

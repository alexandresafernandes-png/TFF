"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { EmptyState } from "@/components/tff/EmptyState"
import { SearchResultCard } from "@/components/tff/SearchResultCard"
import { searchKnowledgeBase } from "@/lib/data/search"
import { getDataStats } from "@/lib/data/stats"
import type { FilterType } from "@/lib/data/search"

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",          label: "All" },
  { key: "food",         label: "Foods" },
  { key: "supplement",   label: "Supplements" },
  { key: "protocol",     label: "Protocols" },
  { key: "blood_marker", label: "Blood Markers" },
  { key: "claim",        label: "Claims" },
  { key: "cooking",      label: "Cooking" },
  { key: "shopping",     label: "Shopping" },
]

const MAX_RESULTS = 30

const DB_COUNTS = [
  { label: "Foods",         key: "foods" },
  { label: "Supplements",   key: "supplements" },
  { label: "Protocols",     key: "protocols" },
  { label: "Blood Markers", key: "bloodMarkers" },
  { label: "Claims",        key: "claims" },
  { label: "Cooking",       key: "cookingGuides" },
  { label: "Shopping",      key: "shoppingItems" },
] as const

export default function KnowledgeSearchPage() {
  const [query, setQuery]   = useState("")
  const [filter, setFilter] = useState<FilterType>("all")

  // Stats computed once — used in the empty state
  const stats = useMemo(() => getDataStats(), [])

  // Search runs on every keystroke — data is tiny (332 entries)
  const allResults = useMemo(() => {
    if (!query.trim()) return null
    return searchKnowledgeBase(query.trim(), filter)
  }, [query, filter])

  const hasQuery = query.trim().length > 0
  const results  = allResults ?? []

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 02 / SEARCH"
        title="Knowledge Search"
        subtitle="Search foods, supplements, protocols, markers, claims and cooking rules."
      />

      {/* ── Search input ─────────────────────────────────────────────────── */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search food, supplement, protocol, marker…"
        style={{ width: "100%", padding: "12px 16px", fontSize: "var(--t-body)" }}
        autoComplete="off"
        spellCheck={false}
      />

      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: "1px solid var(--border)",
          overflowX: "auto",
          // Hide scrollbar while keeping scroll
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className="tab"
            data-on={filter === f.key ? "true" : "false"}
            onClick={() => setFilter(f.key)}
            style={{
              whiteSpace: "nowrap",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Results area ─────────────────────────────────────────────────── */}
      {!hasQuery ? (
        /* Empty query — show prompt + db counts */
        <div>
          <EmptyState
            heading="Start typing to search the TFF knowledge base."
            sub="Covers foods, supplements, protocols, blood markers, claims, cooking guides and shopping items."
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 28px",
              justifyContent: "center",
              marginTop: 4,
              paddingTop: 16,
              borderTop: "1px solid var(--border-soft)",
            }}
          >
            {DB_COUNTS.map(({ label, key }) => (
              <div key={key} style={{ textAlign: "center", minWidth: 64 }}>
                <p
                  className="mono"
                  style={{
                    fontSize: "var(--t-h3)",
                    fontWeight: 600,
                    color: "var(--text-2)",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {stats[key]}
                </p>
                <p className="label">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        /* Query with zero matches */
        <EmptyState
          heading="Not clearly stated in KB."
          sub={`No entry for "${query}" was found in the current /data package. Status: NOT_MENTIONED.`}
        />
      ) : (
        /* Results list */
        <div className="stack-md">
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-4)",
            }}
          >
            Showing {Math.min(MAX_RESULTS, results.length)} of {results.length}{" "}
            {results.length === 1 ? "match" : "matches"}
            {filter !== "all" && (
              <span style={{ marginLeft: 6 }}>
                · filtered: {FILTERS.find((f) => f.key === filter)?.label}
              </span>
            )}
          </p>

          {results.slice(0, MAX_RESULTS).map((result) => (
            <SearchResultCard key={result.id} result={result} />
          ))}

          {results.length > MAX_RESULTS && (
            <p
              style={{
                fontSize: "var(--t-small)",
                color: "var(--text-4)",
                textAlign: "center",
                paddingTop: 8,
              }}
            >
              Refine your search to see more specific results.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

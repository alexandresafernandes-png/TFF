"use client"

import { usePathname } from "next/navigation"

const ROUTE_META: Record<string, { crumb: string; title: string }> = {
  "/":           { crumb: "INDEX · 01 / DASHBOARD",  title: "Dashboard" },
  "/search":     { crumb: "INDEX · 02 / SEARCH",      title: "Knowledge Search" },
  "/checklist":  { crumb: "INDEX · 03 / CHECKLIST",   title: "Daily Checklist" },
  "/protocols":  { crumb: "INDEX · 04 / PROTOCOLS",   title: "Protocol Library" },
  "/nutrition":  { crumb: "INDEX · 05 / NUTRITION",   title: "Nutrition & Cooking" },
  "/supplements":{ crumb: "INDEX · 06 / SUPPLEMENTS", title: "Supplements" },
  "/bloodwork":  { crumb: "INDEX · 07 / BLOODWORK",   title: "Bloodwork" },
  "/shopping":   { crumb: "INDEX · 08 / SHOPPING",    title: "Shopping List" },
  "/routines":   { crumb: "INDEX · 09 / ROUTINES",    title: "Routines" },
  "/sources":    { crumb: "INDEX · 10 / SOURCES",     title: "Sources & References" },
  "/progress":       { crumb: "INDEX · 11 / PROGRESS", title: "Daily Progress" },
  "/weekly-review":  { crumb: "INDEX · 12 / WEEKLY",   title: "Weekly Review" },
}

function getRouteKey(pathname: string) {
  for (const key of Object.keys(ROUTE_META)) {
    if (key === "/") {
      if (pathname === "/") return key
    } else if (pathname.startsWith(key)) {
      return key
    }
  }
  return "/"
}

export function Topbar() {
  const pathname = usePathname()
  const routeKey = getRouteKey(pathname)
  const meta = ROUTE_META[routeKey]

  return (
    <header
      style={{
        height: 52,
        background: "var(--panel)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: crumb */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <span
          className="mono"
          style={{
            fontSize: "var(--t-micro)",
            color: "var(--text-4)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {meta?.crumb}
        </span>
      </div>

      {/* Right: advanced mode placeholder (desktop only) + date */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        {/* Advanced mode pill — visual placeholder, hidden on mobile */}
        <div
          className="tff-adv-mode"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 3,
            border: "1px solid var(--border-soft)",
            background: "transparent",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--text-4)",
            }}
          />
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}
          >
            ADV MODE: OFF
          </span>
        </div>

        {/* Date */}
        <span
          className="mono"
          style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }).toUpperCase()}
        </span>
      </div>
    </header>
  )
}

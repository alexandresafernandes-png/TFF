"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "Dashboard",         href: "/",           key: "1" },
  { label: "Knowledge Search",  href: "/search",      key: "2" },
  { label: "Daily Checklist",   href: "/checklist",   key: "3" },
  { label: "Daily Progress",    href: "/progress",        key: "P" },
  { label: "Weekly Review",     href: "/weekly-review",   key: "W" },
  { label: "Protocol Library",  href: "/protocols",        key: "4" },
  { label: "Nutrition & Cooking",href: "/nutrition",  key: "5" },
  { label: "Supplements",       href: "/supplements", key: "6" },
  { label: "Bloodwork",         href: "/bloodwork",   key: "7" },
  { label: "Shopping List",     href: "/shopping",    key: "8" },
  { label: "Routines",          href: "/routines",    key: "9" },
  { label: "Sources",           href: "/sources",     key: "0" },
] as const

export function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="scan"
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--panel)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: "0.12em",
            marginBottom: 6,
          }}
        >
          TFF
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--accent)",
              flexShrink: 0,
            }}
          />
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.1em" }}
          >
            OPERATOR · ONLINE
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item"
              data-active={active ? "true" : "false"}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <span className="nav-glyph">{item.label}</span>
              <span className="kbd" style={{ opacity: 0.5, fontSize: 9 }}>
                {item.key}
              </span>
            </Link>
          )
        })}

        {/* Separator */}
        <div
          style={{
            margin: "8px 16px",
            borderTop: "1px solid var(--border-soft)",
          }}
        />

        {/* Settings */}
        <Link
          href="/settings"
          className="nav-item"
          data-active={pathname.startsWith("/settings") ? "true" : "false"}
        >
          <span>Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <p
          className="mono"
          style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}
        >
          TFF · BUILT FOR ONE OPERATOR
          <br />
          NOT FOR DISTRIBUTION
        </p>
      </div>
    </aside>
  )
}

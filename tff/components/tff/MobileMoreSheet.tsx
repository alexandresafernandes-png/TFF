"use client"

import Link from "next/link"
import { useEffect } from "react"

const MORE_ITEMS = [
  { label: "Daily Progress",      href: "/progress" },
  { label: "Weekly Review",       href: "/weekly-review" },
  { label: "Nutrition & Cooking", href: "/nutrition" },
  { label: "Supplements",         href: "/supplements" },
  { label: "Bloodwork",           href: "/bloodwork" },
  { label: "Shopping List",       href: "/shopping" },
  { label: "Routines",            href: "/routines" },
  { label: "Sources",             href: "/sources" },
  { label: "Settings",            href: "/settings" },
]

interface MobileMoreSheetProps {
  open: boolean
  onClose: () => void
}

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  // Close on escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          zIndex: 40,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--panel)",
          borderTop: "1px solid var(--border)",
          borderRadius: "12px 12px 0 0",
          zIndex: 50,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              background: "var(--border)",
            }}
          />
        </div>

        {/* Header */}
        <div
          className="label"
          style={{ padding: "12px 20px 8px", color: "var(--text-4)" }}
        >
          More
        </div>

        {/* Items */}
        <nav style={{ padding: "4px 0 8px" }}>
          {MORE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "14px 20px",
                color: "var(--text-2)",
                textDecoration: "none",
                fontSize: 14,
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

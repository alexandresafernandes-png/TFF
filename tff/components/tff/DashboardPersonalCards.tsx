"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { fetchDashboardData, type DashboardData, type DashboardNote } from "@/lib/supabase/dashboard-sync"
import { hasSupabaseConfig } from "@/lib/supabase/status"

// ── Helpers ───────────────────────────────────────────────────────────────────

const AREA_LABEL: Record<string, string> = {
  protocol:  "Protocol",
  bloodwork: "Bloodwork",
  checklist: "Checklist",
  shopping:  "Shopping",
  routines:  "Routines",
  general:   "General",
}

const AREA_HREF: Record<string, string> = {
  protocol:  "/protocols",
  bloodwork: "/bloodwork",
  checklist: "/checklist",
  shopping:  "/shopping",
  routines:  "/routines",
}

function areaLabel(area: string): string {
  return AREA_LABEL[area] ?? area
}

function areaHref(area: string): string | null {
  return AREA_HREF[area] ?? null
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}

// ── Mini stat cell ────────────────────────────────────────────────────────────

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <span
        className="mono"
        style={{ fontSize: "var(--t-h2)", fontWeight: 700, color: "var(--accent)", lineHeight: 1, display: "block" }}
      >
        {value}
      </span>
      <span className="label" style={{ marginTop: 4, display: "block" }}>{label}</span>
    </div>
  )
}

// ── Note row ──────────────────────────────────────────────────────────────────

function NoteRow({ note, last }: { note: DashboardNote; last: boolean }) {
  const href = areaHref(note.area)

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "9px 0",
        borderBottom: last ? "none" : "1px solid var(--border-soft)",
        alignItems: "flex-start",
      }}
    >
      <TffBadge variant="na">{areaLabel(note.area)}</TffBadge>
      <p
        style={{
          fontSize: "var(--t-small)",
          color: "var(--text-3)",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {note.body}
      </p>
      <span
        className="mono"
        style={{ fontSize: 8, color: "var(--text-4)", flexShrink: 0, marginTop: 2 }}
      >
        {fmtDate(note.updated_at)}
      </span>
      {href && (
        <Link
          href={href}
          style={{ fontSize: 12, color: "var(--text-4)", textDecoration: "none", flexShrink: 0 }}
        >
          →
        </Link>
      )}
    </div>
  )
}

// ── Card: nav link helper ─────────────────────────────────────────────────────

function CardLink({ href }: { href: string }) {
  return (
    <Link href={href} style={{ fontSize: 12, color: "var(--text-4)", textDecoration: "none" }}>
      →
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPersonalCards() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }
    setSyncStatus("syncing")
    fetchDashboardData().then((result) => {
      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }
      setData(result.data)
      setSyncStatus("synced")
    })
  }, [])

  // No Supabase config — skip this section entirely (local-first mode)
  if (syncStatus === "local") return null

  // Still loading — render nothing to avoid layout shift
  if (syncStatus === "idle" || (syncStatus === "syncing" && !data)) return null

  // ── Not signed in ─────────────────────────────────────────────────────────

  if (syncStatus === "unauthenticated") {
    return (
      <div>
        <SectionHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Personal Summary
            <SyncBadge status={syncStatus} />
          </div>
        </SectionHeader>
        <TffCard>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <TffCardHeader>Local-first mode</TffCardHeader>
              <p
                style={{
                  fontSize: "var(--t-small)",
                  color: "var(--text-3)",
                  maxWidth: 440,
                  lineHeight: 1.55,
                }}
              >
                Sign in to sync checklist, shopping, routines, protocols, and notes across
                devices. Local data is safe and merges automatically on first sign-in.
              </p>
            </div>
            <Link href="/login" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Sign In
            </Link>
          </div>
        </TffCard>
      </div>
    )
  }

  // ── Sync error, no data ───────────────────────────────────────────────────

  if (syncStatus === "error" && !data) {
    return (
      <div>
        <SectionHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Personal Summary
            <SyncBadge status="error" />
          </div>
        </SectionHeader>
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
            Cloud data unavailable — local data is still intact.
          </p>
        </TffCard>
      </div>
    )
  }

  if (!data) return null

  // ── Personal data ─────────────────────────────────────────────────────────

  const { checklist, protocols, routines, shopping, recentNotes } = data

  const noProtocols =
    protocols.active === 0 && protocols.paused === 0 && protocols.completed === 0
  const noRoutines = routines.active === 0 && routines.done === 0
  const noShopping = shopping.retainerChecked === 0 && shopping.upgradeChecked === 0

  return (
    <div>
      <SectionHeader>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Personal Summary
          <SyncBadge status={syncStatus} />
        </div>
      </SectionHeader>

      {/* ── Data cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 10,
        }}
      >
        {/* Checklist Today */}
        <TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="label" style={{ margin: 0 }}>Today&rsquo;s Checklist</p>
              <CardLink href="/checklist" />
            </div>
            {checklist.completedToday === 0 ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No items completed yet today.
              </p>
            ) : (
              <StatCell value={checklist.completedToday} label="completed today" />
            )}
          </div>
        </TffCard>

        {/* Protocols */}
        <TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="label" style={{ margin: 0 }}>Protocols</p>
              <CardLink href="/protocols" />
            </div>
            {noProtocols ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No protocols tracked yet.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 20 }}>
                {protocols.active    > 0 && <StatCell value={protocols.active}    label="active"    />}
                {protocols.paused    > 0 && <StatCell value={protocols.paused}    label="paused"    />}
                {protocols.completed > 0 && <StatCell value={protocols.completed} label="completed" />}
              </div>
            )}
          </div>
        </TffCard>

        {/* Routines Today */}
        <TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="label" style={{ margin: 0 }}>Routines Today</p>
              <CardLink href="/routines" />
            </div>
            {noRoutines ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No routines logged today.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 20 }}>
                {routines.done   > 0 && <StatCell value={routines.done}   label="done"   />}
                {routines.active > 0 && <StatCell value={routines.active} label="active" />}
              </div>
            )}
          </div>
        </TffCard>

        {/* Shopping */}
        <TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="label" style={{ margin: 0 }}>Shopping</p>
              <CardLink href="/shopping" />
            </div>
            {noShopping ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                No items checked yet.
              </p>
            ) : (
              <div style={{ display: "flex", gap: 20 }}>
                {shopping.retainerChecked > 0 && (
                  <StatCell value={shopping.retainerChecked} label="retainer" />
                )}
                {shopping.upgradeChecked > 0 && (
                  <StatCell value={shopping.upgradeChecked} label="upgrade" />
                )}
              </div>
            )}
          </div>
        </TffCard>
      </div>

      {/* ── Recent Notes ── */}
      {recentNotes.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <TffCard>
            <p className="label" style={{ margin: "0 0 10px" }}>Recent Notes</p>
            {recentNotes.map((note, idx) => (
              <NoteRow key={note.id} note={note} last={idx === recentNotes.length - 1} />
            ))}
          </TffCard>
        </div>
      )}
    </div>
  )
}

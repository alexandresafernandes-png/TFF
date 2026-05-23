"use client"

import { TffBadge } from "@/components/tff/TffBadge"

export type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "error"
  | "local"
  | "unauthenticated"

export function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === "idle" || status === "local") return null
  if (status === "syncing") return <TffBadge variant="default">Syncing…</TffBadge>
  if (status === "synced") return <TffBadge variant="core" dot>Cloud sync</TffBadge>
  if (status === "error") return <TffBadge variant="warn">Sync error</TffBadge>
  if (status === "unauthenticated") return <TffBadge variant="na">Not signed in</TffBadge>
  return null
}

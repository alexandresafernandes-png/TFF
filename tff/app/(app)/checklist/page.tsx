"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import {
  fetchChecklistData,
  upsertCompletion,
  createCloudCustomItem,
  updateCloudCustomItem,
  archiveCloudCustomItem,
} from "@/lib/supabase/checklist-sync"

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "core" | "optional" | "advanced"
type Mode = "recommendations" | "custom"
type SyncStatus = "idle" | "syncing" | "synced" | "error" | "local" | "unauthenticated"

interface RecommendedItem {
  id: string
  title: string
  description: string
  group: string
  priority: Priority
}

interface CustomItem {
  id: string
  title: string
  description: string
  category: string
  priority: Priority
  createdAt: number
}

// ── Recommended checklist data ────────────────────────────────────────────────

const RECOMMENDED_GROUPS: { group: string; items: Omit<RecommendedItem, "group">[] }[] = [
  {
    group: "Morning Foundation",
    items: [
      { id: "rec_mf1", title: "Sunlight exposure", description: "Direct outdoor light within 30–60 min of waking.", priority: "core" },
      { id: "rec_mf2", title: "Hydrate after waking", description: "500ml+ water before coffee or food.", priority: "core" },
      { id: "rec_mf3", title: "Review today's focus", description: "Identify the single most important task for the day.", priority: "optional" },
    ],
  },
  {
    group: "Training / Movement",
    items: [
      { id: "rec_tr1", title: "Complete planned training", description: "Execute today's scheduled training session.", priority: "core" },
      { id: "rec_tr2", title: "Steps / walk target", description: "Hit daily step count or include a deliberate walk.", priority: "core" },
      { id: "rec_tr3", title: "Mobility or stretching", description: "At least 5–10 min of targeted mobility work.", priority: "optional" },
    ],
  },
  {
    group: "Nutrition & Hydration",
    items: [
      { id: "rec_nu1", title: "Hit protein target", description: "Reach daily protein goal from whole-food sources.", priority: "core" },
      { id: "rec_nu2", title: "Whole-food meals", description: "All meals from the approved TFF foods list.", priority: "core" },
      { id: "rec_nu3", title: "Hydration target", description: "Hit total daily water intake.", priority: "core" },
      { id: "rec_nu4", title: "Prepare next meal", description: "Prep ahead to avoid reactive food choices.", priority: "optional" },
    ],
  },
  {
    group: "Supplements",
    items: [
      { id: "rec_su1", title: "Morning supplements", description: "Take all scheduled morning protocol supplements.", priority: "core" },
      { id: "rec_su2", title: "Evening supplements", description: "Take all scheduled evening protocol supplements.", priority: "core" },
      { id: "rec_su3", title: "Check supplement timing", description: "Verify timing and co-factor requirements for the day.", priority: "optional" },
    ],
  },
  {
    group: "Light / Environment",
    items: [
      { id: "rec_le1", title: "Reduce artificial light", description: "Lower screen brightness and harsh lighting after sunset.", priority: "core" },
      { id: "rec_le2", title: "Outdoor exposure", description: "Fresh air and natural light during the day.", priority: "optional" },
    ],
  },
  {
    group: "Evening Routine",
    items: [
      { id: "rec_ev1", title: "No doom scrolling", description: "Avoid high-stimulation content after 8pm.", priority: "core" },
      { id: "rec_ev2", title: "Prepare for tomorrow", description: "Set out clothes, prep meals, review tomorrow's schedule.", priority: "optional" },
      { id: "rec_ev3", title: "Wind-down routine", description: "Active wind-down 60–90 min before target sleep time.", priority: "core" },
    ],
  },
  {
    group: "Sleep Preparation",
    items: [
      { id: "rec_sl1", title: "Sleep support supplements", description: "Magnesium glycinate, glycine, or protocol sleep stack.", priority: "core" },
      { id: "rec_sl2", title: "Screens off", description: "No screens at least 30 min before lights out.", priority: "core" },
      { id: "rec_sl3", title: "8–9h sleep window", description: "Target and protect your sleep window.", priority: "core" },
    ],
  },
]

const ALL_RECOMMENDED: RecommendedItem[] = RECOMMENDED_GROUPS.flatMap(({ group, items }) =>
  items.map((item) => ({ ...item, group }))
)

// ── localStorage keys ─────────────────────────────────────────────────────────

const LS_COMPLETIONS = "tff_checklist_completions"
const LS_CUSTOM = "tff_checklist_custom"
// Maps local c_xxx IDs → Supabase UUIDs so we can upsert without re-fetching.
const LS_CLOUD_IDS = "tff_checklist_cloud_ids"

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Morning",
  "Training",
  "Nutrition",
  "Supplements",
  "Environment",
  "Evening",
  "Sleep",
  "Other",
] as const

function priorityVariant(p: Priority): "core" | "warn" | "na" {
  if (p === "core") return "core"
  if (p === "advanced") return "warn"
  return "na"
}

function priorityLabel(p: Priority) {
  if (p === "core") return "Core"
  if (p === "advanced") return "Advanced"
  return "Optional"
}

function uid(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

/** Items with IDs starting with "rec_" are app recommendations; everything else is custom. */
function itemSource(id: string): "app" | "custom" {
  return id.startsWith("rec_") ? "app" : "custom"
}

// ── Checkmark SVG ─────────────────────────────────────────────────────────────

function Checkmark() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
      <path
        d="M1 3.5 3.5 6 9 1"
        stroke="var(--accent-ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── SyncBadge ─────────────────────────────────────────────────────────────────

function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === "idle" || status === "local") return null
  if (status === "syncing")
    return <TffBadge variant="default">Syncing…</TffBadge>
  if (status === "synced")
    return <TffBadge variant="core" dot>Cloud sync</TffBadge>
  if (status === "error")
    return <TffBadge variant="warn">Sync error</TffBadge>
  if (status === "unauthenticated")
    return <TffBadge variant="na">Not signed in</TffBadge>
  return null
}

// ── CheckRow ─────────────────────────────────────────────────────────────────

interface CheckRowProps {
  id: string
  title: string
  description: string
  priority: Priority
  checked: boolean
  onToggle: (id: string) => void
  onEdit?: () => void
  onDelete?: () => void
  last?: boolean
}

function CheckRow({
  id,
  title,
  description,
  priority,
  checked,
  onToggle,
  onEdit,
  onDelete,
  last = false,
}: CheckRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "11px 0",
        borderBottom: last ? "none" : "1px solid var(--border-soft)",
        opacity: checked ? 0.48 : 1,
        transition: "opacity 150ms",
      }}
    >
      {/* Tick */}
      <button
        className="tick"
        data-on={checked ? "true" : "false"}
        onClick={() => onToggle(id)}
        style={{ marginTop: 2, flexShrink: 0 }}
        aria-label={checked ? "Mark incomplete" : "Mark complete"}
      >
        {checked && <Checkmark />}
      </button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "var(--t-body)",
            fontWeight: 500,
            lineHeight: 1.3,
            textDecoration: checked ? "line-through" : "none",
            color: checked ? "var(--text-3)" : "var(--text)",
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontSize: "var(--t-small)",
              color: "var(--text-4)",
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Right side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <TffBadge variant={priorityVariant(priority)}>{priorityLabel(priority)}</TffBadge>
        {onEdit && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={onEdit}
            style={{ padding: "3px 8px", fontSize: 11 }}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={onDelete}
            style={{ padding: "3px 8px", fontSize: 16, lineHeight: 1, color: "var(--text-4)" }}
            aria-label="Delete item"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// ── ItemForm ──────────────────────────────────────────────────────────────────

interface ItemFormData {
  title: string
  description: string
  category: string
  priority: Priority
}

interface ItemFormProps {
  initial?: ItemFormData
  onSave: (data: ItemFormData) => void
  onCancel: () => void
  /** When true, omits the TffCard wrapper (used for inline editing inside a card). */
  compact?: boolean
}

function ItemForm({ initial, onSave, onCancel, compact = false }: ItemFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [category, setCategory] = useState(initial?.category ?? "Other")
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "core")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), description: description.trim(), category, priority })
  }

  const fields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Item title…"
        style={{ width: "100%" }}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description (optional)"
        style={{ width: "100%" }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: 1, minWidth: 120 }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          style={{ flex: 1, minWidth: 120 }}
        >
          <option value="core">Core</option>
          <option value="optional">Optional</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim()}>
          {initial ? "Save changes" : "Add item"}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )

  if (compact) {
    return <form onSubmit={handleSubmit}>{fields}</form>
  }

  return (
    <TffCard>
      <TffCardHeader>{initial ? "Edit Item" : "New Item"}</TffCardHeader>
      <form onSubmit={handleSubmit}>{fields}</form>
    </TffCard>
  )
}

// ── Progress stats ────────────────────────────────────────────────────────────

interface ProgressProps {
  total: number
  completed: number
  coreTotal: number
  coreCompleted: number
}

function ProgressSection({ total, completed, coreTotal, coreCompleted }: ProgressProps) {
  const remaining = total - completed
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const allDone = total > 0 && completed === total
  const allCoreDone = coreTotal > 0 && coreCompleted === coreTotal

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {/* Done */}
        <TffCard style={{ padding: "13px 14px" }}>
          <p className="label" style={{ marginBottom: 5 }}>
            Done
          </p>
          <p
            style={{
              fontSize: "var(--t-h2)",
              fontWeight: 600,
              color: allDone ? "var(--accent)" : "var(--text)",
            }}
          >
            {completed} / {total}
          </p>
        </TffCard>

        {/* Core */}
        <TffCard style={{ padding: "13px 14px" }}>
          <p className="label" style={{ marginBottom: 5 }}>
            Core
          </p>
          <p
            style={{
              fontSize: "var(--t-h2)",
              fontWeight: 600,
              color: allCoreDone ? "var(--accent)" : "var(--text)",
            }}
          >
            {coreCompleted} / {coreTotal}
          </p>
        </TffCard>

        {/* Remaining */}
        <TffCard style={{ padding: "13px 14px" }}>
          <p className="label" style={{ marginBottom: 5 }}>
            Left
          </p>
          <p
            style={{
              fontSize: "var(--t-h2)",
              fontWeight: 600,
              color: remaining === 0 && total > 0 ? "var(--accent)" : "var(--text)",
            }}
          >
            {remaining}
          </p>
        </TffCard>

        {/* Percent */}
        <TffCard style={{ padding: "13px 14px" }}>
          <p className="label" style={{ marginBottom: 5 }}>
            Progress
          </p>
          <p
            style={{
              fontSize: "var(--t-h2)",
              fontWeight: 600,
              color: pct === 100 ? "var(--accent)" : "var(--text)",
            }}
          >
            {pct}%
          </p>
        </TffCard>
      </div>

      {/* Bar */}
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DailyChecklistPage() {
  const [mode, setMode] = useState<Mode>("recommendations")

  // Prevent writing to localStorage before we've loaded from it
  const [loaded, setLoaded] = useState(false)

  // Record<itemId, boolean> — shared across both modes
  const [completions, setCompletions] = useState<Record<string, boolean>>({})

  // Custom checklist items
  const [customItems, setCustomItems] = useState<CustomItem[]>([])

  // Maps local c_xxx IDs → Supabase UUIDs for cloud mutations
  const [cloudIdMap, setCloudIdMap] = useState<Record<string, string>>({})

  // Cloud sync status — drives SyncBadge
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")

  // UI state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // ── Hydrate from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_COMPLETIONS)
      if (c) setCompletions(JSON.parse(c) as Record<string, boolean>)
      const ci = localStorage.getItem(LS_CUSTOM)
      if (ci) setCustomItems(JSON.parse(ci) as CustomItem[])
      const cm = localStorage.getItem(LS_CLOUD_IDS)
      if (cm) setCloudIdMap(JSON.parse(cm) as Record<string, string>)
    } catch {
      // Corrupted data — start fresh
    }
    setLoaded(true)
  }, [])

  // ── Persist completions (only after initial load) ────────────────────────────
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_COMPLETIONS, JSON.stringify(completions))
  }, [completions, loaded])

  // ── Persist custom items ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customItems))
  }, [customItems, loaded])

  // ── Persist cloud ID map ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_CLOUD_IDS, JSON.stringify(cloudIdMap))
  }, [cloudIdMap, loaded])

  // ── Initial Supabase sync (runs once after localStorage hydration) ───────────
  useEffect(() => {
    if (!loaded) return
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }

    async function doSync() {
      setSyncStatus("syncing")

      const result = await fetchChecklistData()

      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }

      const { completions: remoteCompletions, customItems: remoteCustom } = result.data

      // ── Merge completions ──────────────────────────────────────────────────
      // If remote is empty for today, upload any locally-completed items so
      // Supabase stays in sync after first login.
      if (remoteCompletions.length === 0) {
        setCompletions((prev) => {
          for (const [id, done] of Object.entries(prev)) {
            if (done) void upsertCompletion(id, itemSource(id), true)
          }
          return prev // no change to local state
        })
      } else {
        // Remote rows override local for items Supabase knows about.
        // Items that exist locally but have no remote row are left unchanged.
        setCompletions((prev) => {
          const merged = { ...prev }
          for (const row of remoteCompletions) {
            merged[row.checklist_item_id] = row.completed
          }
          return merged
        })
      }

      // ── Merge custom items ─────────────────────────────────────────────────
      if (remoteCustom.length > 0) {
        // Build lookup: client_id → remote item
        const byClientId: Record<string, (typeof remoteCustom)[0]> = {}
        for (const r of remoteCustom) {
          if (r.client_id) byClientId[r.client_id] = r
        }

        // Update cloudIdMap with any new mappings from remote
        setCloudIdMap((prev) => {
          const next = { ...prev }
          for (const r of remoteCustom) {
            if (r.client_id) next[r.client_id] = r.id
          }
          return next
        })

        setCustomItems((localItems) => {
          const localIds = new Set(localItems.map((l) => l.id))

          // Update existing local items with latest remote data
          const updated = localItems.map((local) => {
            const remote = byClientId[local.id]
            if (!remote) return local
            return {
              ...local,
              title: remote.title,
              description: remote.description ?? local.description,
              category: remote.category ?? local.category,
              priority: (remote.priority as Priority) ?? local.priority,
            }
          })

          // Append remote-only items (created on another device or before this device had the app)
          const fromRemote = remoteCustom
            .filter((r) => !r.client_id || !localIds.has(r.client_id))
            .map((r) => ({
              id: r.client_id ?? r.id, // prefer the original local ID; fall back to UUID
              title: r.title,
              description: r.description ?? "",
              category: r.category ?? "Other",
              priority: (r.priority as Priority) ?? "core",
              createdAt: new Date(r.created_at).getTime(),
            }))

          return [...updated, ...fromRemote]
        })
      }

      setSyncStatus("synced")
    }

    doSync()
  }, [loaded]) // hasSupabaseConfig is a build-time constant — no dep needed

  // ── Actions ──────────────────────────────────────────────────────────────────

  function toggleCompletion(id: string) {
    // Compute next value from current state, then sync to Supabase.
    setCompletions((prev) => {
      const next = !prev[id]
      void upsertCompletion(id, itemSource(id), next)
      return { ...prev, [id]: next }
    })
  }

  function resetToday() {
    const ids =
      mode === "recommendations"
        ? ALL_RECOMMENDED.map((i) => i.id)
        : customItems.map((i) => i.id)
    setCompletions((prev) => {
      const next = { ...prev }
      ids.forEach((id) => {
        next[id] = false
      })
      return next
    })
    // Sync resets to Supabase so they survive a page refresh
    ids.forEach((id) => void upsertCompletion(id, itemSource(id), false))
  }

  function addCustomItem(data: ItemFormData) {
    const newItem: CustomItem = { ...data, id: uid(), createdAt: Date.now() }
    setCustomItems((prev) => [...prev, newItem])
    setShowAddForm(false)
    // Create in cloud; store the returned UUID so subsequent edits/deletes work
    createCloudCustomItem({
      clientId: newItem.id,
      title: newItem.title,
      description: newItem.description,
      category: newItem.category,
      priority: newItem.priority,
      sortOrder: customItems.length,
    }).then((cloudId) => {
      if (cloudId) setCloudIdMap((prev) => ({ ...prev, [newItem.id]: cloudId }))
    })
  }

  function updateCustomItem(id: string, data: ItemFormData) {
    setCustomItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)))
    setEditingId(null)
    const cloudId = cloudIdMap[id]
    if (cloudId) void updateCloudCustomItem(cloudId, data)
  }

  function deleteCustomItem(id: string) {
    setCustomItems((prev) => prev.filter((i) => i.id !== id))
    setCompletions((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    const cloudId = cloudIdMap[id]
    if (cloudId) {
      void archiveCloudCustomItem(cloudId)
      setCloudIdMap((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  function clearCompleted() {
    const done = new Set(customItems.filter((i) => completions[i.id]).map((i) => i.id))
    // Archive cloud rows for cleared items
    done.forEach((id) => {
      const cloudId = cloudIdMap[id]
      if (cloudId) void archiveCloudCustomItem(cloudId)
    })
    setCustomItems((prev) => prev.filter((i) => !done.has(i.id)))
    setCompletions((prev) => {
      const next = { ...prev }
      done.forEach((id) => delete next[id])
      return next
    })
    setCloudIdMap((prev) => {
      const next = { ...prev }
      done.forEach((id) => delete next[id])
      return next
    })
  }

  function resetAllCustom() {
    if (!window.confirm("Remove all custom items? This cannot be undone.")) return
    // Archive all cloud-mapped custom items
    customItems.forEach((item) => {
      const cloudId = cloudIdMap[item.id]
      if (cloudId) void archiveCloudCustomItem(cloudId)
    })
    const ids = customItems.map((i) => i.id)
    setCustomItems([])
    setCloudIdMap({})
    setCompletions((prev) => {
      const next = { ...prev }
      ids.forEach((id) => delete next[id])
      return next
    })
  }

  // ── Progress ─────────────────────────────────────────────────────────────────

  const activeItems = mode === "recommendations" ? ALL_RECOMMENDED : customItems
  const totalCount = activeItems.length
  const completedCount = activeItems.filter((i) => completions[i.id]).length
  const coreItems = activeItems.filter((i) => i.priority === "core")
  const coreCompleted = coreItems.filter((i) => completions[i.id]).length

  const hasAnyCompleted = customItems.some((i) => completions[i.id])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 03 / CHECKLIST"
        title="Daily Checklist"
        subtitle="Today's protocol checklist."
      />

      {/* ── Mode tabs ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {(
          [
            ["recommendations", "App Recommendations"],
            ["custom", "Custom Checklist"],
          ] as [Mode, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            className="tab"
            data-on={mode === value ? "true" : "false"}
            onClick={() => setMode(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Progress ────────────────────────────────────────────────────────── */}
      <ProgressSection
        total={totalCount}
        completed={completedCount}
        coreTotal={coreItems.length}
        coreCompleted={coreCompleted}
      />

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button className="btn btn-sm btn-ghost" onClick={resetToday}>
          Reset Today
        </button>

        {mode === "custom" && (
          <>
            <button
              className="btn btn-sm btn-ghost"
              onClick={clearCompleted}
              disabled={!hasAnyCompleted}
            >
              Clear Completed
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={resetAllCustom}
              disabled={customItems.length === 0}
            >
              Reset All
            </button>
          </>
        )}

        {/* Sync status — unobtrusive, right of action buttons */}
        <SyncBadge status={syncStatus} />

        <div style={{ flex: 1 }} />

        {mode === "custom" && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              setShowAddForm((v) => !v)
              setEditingId(null)
            }}
          >
            {showAddForm ? "Cancel" : "+ Add Item"}
          </button>
        )}
      </div>

      {/* ── Recommendations mode ────────────────────────────────────────────── */}
      {mode === "recommendations" && (
        <div className="stack-md">
          {RECOMMENDED_GROUPS.map(({ group, items }) => (
            <div key={group}>
              <SectionHeader>{group}</SectionHeader>
              <TffCard style={{ padding: "0 22px" }}>
                {items.map((item, idx) => (
                  <CheckRow
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    checked={!!completions[item.id]}
                    onToggle={toggleCompletion}
                    last={idx === items.length - 1}
                  />
                ))}
              </TffCard>
            </div>
          ))}
        </div>
      )}

      {/* ── Custom mode ─────────────────────────────────────────────────────── */}
      {mode === "custom" && (
        <div className="stack-md">
          {/* Add form */}
          {showAddForm && (
            <ItemForm onSave={addCustomItem} onCancel={() => setShowAddForm(false)} />
          )}

          {/* Empty state */}
          {customItems.length === 0 && !showAddForm && (
            <TffCard>
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <p
                  style={{
                    fontSize: "var(--t-body)",
                    color: "var(--text-3)",
                    marginBottom: 6,
                  }}
                >
                  No custom items yet.
                </p>
                <p
                  style={{
                    fontSize: "var(--t-small)",
                    color: "var(--text-4)",
                    marginBottom: 20,
                  }}
                >
                  Add your own daily habits, tasks, or goals to track alongside the protocol.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                  + Add First Item
                </button>
              </div>
            </TffCard>
          )}

          {/* Items list */}
          {customItems.length > 0 && (
            <TffCard style={{ padding: "0 22px" }}>
              {customItems.map((item, idx) =>
                editingId === item.id ? (
                  // Inline edit form — no extra card wrapper
                  <div
                    key={item.id}
                    style={{
                      padding: "14px 0",
                      borderBottom:
                        idx < customItems.length - 1 ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    <ItemForm
                      initial={item}
                      onSave={(data) => updateCustomItem(item.id, data)}
                      onCancel={() => setEditingId(null)}
                      compact
                    />
                  </div>
                ) : (
                  <CheckRow
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    checked={!!completions[item.id]}
                    onToggle={toggleCompletion}
                    onEdit={() => {
                      setEditingId(item.id)
                      setShowAddForm(false)
                    }}
                    onDelete={() => deleteCustomItem(item.id)}
                    last={idx === customItems.length - 1}
                  />
                )
              )}
            </TffCard>
          )}

          {/* Storage note */}
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
            {syncStatus === "synced" || syncStatus === "syncing"
              ? "CLOUD SYNC ACTIVE · SUPABASE CONNECTED"
              : "STORED IN BROWSER · SIGN IN TO ENABLE CLOUD SYNC"}
          </p>
        </div>
      )}
    </div>
  )
}

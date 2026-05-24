"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import supplementsRaw from "@/data/supplements.json"
import {
  getTodayLocalDate,
  groupItemsByTimingBlock,
  calculateSupplementAdherence,
  fetchSupplementScheduleItems,
  createSupplementScheduleItem,
  setSupplementScheduleItemActive,
  fetchSupplementCompletionsForDate,
  upsertSupplementCompletion,
  TIMING_BLOCK_ORDER,
  TIMING_BLOCK_LABEL,
  type TimingBlock,
  type SupplementScheduleItem,
} from "@/lib/supabase/supplement-schedule-sync"

// ── Library data (existing TFF supplement names + dose, no invented content) ──

interface LibSupplement {
  id: string
  name: string
  dose: string
  timing: string
  tags: string[]
}

const LIB_SUPPLEMENTS = supplementsRaw as unknown as LibSupplement[]

function tagsToTimingBlock(tags: string[]): TimingBlock {
  if (tags.includes("time_pre_bed")) return "night"
  if (tags.includes("time_pre_workout") || tags.includes("time_intra_workout")) return "pre_workout"
  if (tags.includes("time_morning")) return "morning"
  if (tags.includes("time_with_meals")) return "midday"
  return "custom"
}

// ── Local-storage helpers ─────────────────────────────────────────────────────

const LS_ITEMS_KEY = "tff_sup_items"

function lsCompKey(date: string) {
  return `tff_sup_comp_${date}`
}

function loadLocalItems(): SupplementScheduleItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(LS_ITEMS_KEY) ?? "[]") as SupplementScheduleItem[]
  } catch {
    return []
  }
}

function saveLocalItems(items: SupplementScheduleItem[]) {
  try {
    localStorage.setItem(LS_ITEMS_KEY, JSON.stringify(items))
  } catch {
    // Silently ignore storage errors
  }
}

function loadLocalCompletions(date: string): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(lsCompKey(date)) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}

function saveLocalCompletions(date: string, ids: Set<string>) {
  try {
    localStorage.setItem(lsCompKey(date), JSON.stringify([...ids]))
  } catch {
    // Silently ignore
  }
}

function makeLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ── Add-form state type ───────────────────────────────────────────────────────

interface AddForm {
  name:         string
  dose_text:    string
  timing_block: TimingBlock
  instructions: string
  source:       string
}

const EMPTY_ADD_FORM: AddForm = {
  name:         "",
  dose_text:    "",
  timing_block: "morning",
  instructions: "",
  source:       "manual",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 14 / SUPPLEMENT SCHEDULE"
        title="Supplement Schedule"
        subtitle="Loading…"
      />
      {[0, 1, 2].map((i) => (
        <TffCard key={i}>
          <div style={{ height: 72, background: "var(--border-soft)", borderRadius: 4, opacity: 0.5 }} />
        </TffCard>
      ))}
    </div>
  )
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 8px",
          background: "var(--card-2)",
          border: "1px solid var(--border-soft)",
          borderRadius: 3,
          color: "var(--text)",
          fontSize: "var(--t-small)",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 }}>
      <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "6px 8px",
          background: "var(--card-2)",
          border: "1px solid var(--border-soft)",
          borderRadius: 3,
          color: "var(--text)",
          fontSize: "var(--t-small)",
          fontFamily: "inherit",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupplementSchedulePage() {
  const today = getTodayLocalDate()

  const [syncStatus, setSyncStatus]     = useState<SyncStatus>("syncing")
  const [isLocalMode, setIsLocalMode]   = useState(false)
  const [items, setItems]               = useState<SupplementScheduleItem[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const [showAddForm, setShowAddForm]   = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [showLibPicker, setShowLibPicker] = useState(false)
  const [libSearch, setLibSearch]       = useState("")
  const [addForm, setAddForm]           = useState<AddForm>(EMPTY_ADD_FORM)
  const [saving, setSaving]             = useState(false)

  // ── Load on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Always hydrate from localStorage immediately for instant render
    const localItems = loadLocalItems()
    const localComp  = loadLocalCompletions(today)
    setItems(localItems)
    setCompletedIds(localComp)

    Promise.allSettled([
      fetchSupplementScheduleItems(),
      fetchSupplementCompletionsForDate(today),
    ]).then(([itemsRes, compRes]) => {
      // Items
      if (itemsRes.status === "fulfilled" && itemsRes.value.ok) {
        const remoteItems = itemsRes.value.items
        setItems(remoteItems)
        saveLocalItems(remoteItems)
        setSyncStatus("synced")
        setIsLocalMode(false)
      } else if (itemsRes.status === "fulfilled" && !itemsRes.value.ok) {
        const reason = itemsRes.value.reason
        setIsLocalMode(reason === "unauthenticated")
        setSyncStatus(reason === "unauthenticated" ? "unauthenticated" : "error")
      } else {
        setSyncStatus("error")
      }

      // Completions
      if (compRes.status === "fulfilled" && compRes.value.ok) {
        const ids = new Set(
          compRes.value.completions
            .filter((c) => c.completed)
            .map((c) => c.item_id),
        )
        setCompletedIds(ids)
        saveLocalCompletions(today, ids)
      }
    })
  }, [today])

  // ── Toggle completion ─────────────────────────────────────────────────────

  const handleToggle = useCallback(
    (itemId: string) => {
      const next = new Set(completedIds)
      const nowCompleted = !next.has(itemId)
      if (nowCompleted) next.add(itemId)
      else next.delete(itemId)
      setCompletedIds(next)
      saveLocalCompletions(today, next)
      if (!isLocalMode) {
        void upsertSupplementCompletion(itemId, today, nowCompleted)
      }
    },
    [completedIds, today, isLocalMode],
  )

  // ── Set active/inactive ───────────────────────────────────────────────────

  const handleSetActive = useCallback(
    async (itemId: string, active: boolean) => {
      const nextItems = items.map((i) => (i.id === itemId ? { ...i, is_active: active } : i))
      setItems(nextItems)
      saveLocalItems(nextItems)
      if (!isLocalMode) {
        await setSupplementScheduleItemActive(itemId, active)
      }
    },
    [items, isLocalMode],
  )

  // ── Add item ──────────────────────────────────────────────────────────────

  const handleAddItem = useCallback(async () => {
    if (!addForm.name.trim()) return
    setSaving(true)

    if (isLocalMode) {
      const newItem: SupplementScheduleItem = {
        id:           makeLocalId(),
        name:         addForm.name.trim(),
        dose_text:    addForm.dose_text.trim() || null,
        timing_block: addForm.timing_block,
        instructions: addForm.instructions.trim() || null,
        is_active:    true,
        sort_order:   items.filter((i) => i.is_active).length,
        source:       addForm.source || "manual",
        created_at:   new Date().toISOString(),
      }
      const nextItems = [...items, newItem]
      setItems(nextItems)
      saveLocalItems(nextItems)
    } else {
      const result = await createSupplementScheduleItem({
        name:         addForm.name.trim(),
        dose_text:    addForm.dose_text.trim() || null,
        timing_block: addForm.timing_block,
        instructions: addForm.instructions.trim() || null,
        is_active:    true,
        sort_order:   items.filter((i) => i.is_active).length,
        source:       addForm.source || "manual",
      })
      if (result.ok) {
        const nextItems = [...items, result.item]
        setItems(nextItems)
        saveLocalItems(nextItems)
      }
    }

    setAddForm(EMPTY_ADD_FORM)
    setShowAddForm(false)
    setShowLibPicker(false)
    setSaving(false)
  }, [addForm, items, isLocalMode])

  // ── Pre-fill from library ─────────────────────────────────────────────────

  const handlePickLib = useCallback((sup: LibSupplement) => {
    setAddForm({
      name:         sup.name,
      dose_text:    sup.dose,
      timing_block: tagsToTimingBlock(sup.tags),
      instructions: "",
      source:       "tff_library",
    })
    setShowLibPicker(false)
    setShowAddForm(true)
    setLibSearch("")
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────

  const grouped   = groupItemsByTimingBlock(items)
  const adherence = calculateSupplementAdherence(items, completedIds)
  const inactiveItems = items.filter((i) => !i.is_active)

  const timingOptions = TIMING_BLOCK_ORDER.map((b) => ({
    value: b,
    label: TIMING_BLOCK_LABEL[b],
  }))

  const filteredLib = libSearch.trim()
    ? LIB_SUPPLEMENTS.filter((s) =>
        s.name.toLowerCase().includes(libSearch.toLowerCase()),
      )
    : LIB_SUPPLEMENTS

  if (syncStatus === "syncing") return <Skeleton />

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 14 / SUPPLEMENT SCHEDULE"
        title="Supplement Schedule"
        subtitle="Manual supplement timing and daily completion tracking."
      />

      {/* ── A. Today Summary ──────────────────────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <span className="label">Today — {today}</span>
          <SyncBadge status={syncStatus} />
        </div>

        {adherence.active === 0 ? (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
            No active supplement items yet. Add items below to start tracking.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Adherence % */}
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>ADHERENCE</p>
              <p style={{
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
                color: adherence.adherencePct >= 80 ? "var(--accent)" : adherence.adherencePct >= 50 ? "var(--warn)" : "var(--danger)",
              }}>
                {adherence.adherencePct}%
              </p>
            </div>

            {/* Completed */}
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>COMPLETED</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", margin: 0, lineHeight: 1 }}>
                {adherence.completed}
              </p>
            </div>

            {/* Remaining */}
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>REMAINING</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>
                {adherence.active - adherence.completed}
              </p>
            </div>

            {/* Active total */}
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>ACTIVE ITEMS</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>
                {adherence.active}
              </p>
            </div>
          </div>
        )}

        {isLocalMode && (
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 12, letterSpacing: "0.08em" }}>
            LOCAL MODE — items persist in browser storage only. Sign in to sync across devices.
          </p>
        )}
      </TffCard>

      {/* ── B. Timing Blocks ──────────────────────────────────────────────── */}
      {TIMING_BLOCK_ORDER.map((block) => {
        const blockItems = grouped.get(block) ?? []
        if (blockItems.length === 0) return null
        return (
          <div key={block}>
            <SectionHeader>{TIMING_BLOCK_LABEL[block]}</SectionHeader>
            <TffCard>
              {blockItems.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i < blockItems.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item.id)}
                    style={{
                      flexShrink: 0,
                      width: 20,
                      height: 20,
                      marginTop: 1,
                      border: completedIds.has(item.id) ? "none" : "1px solid var(--border)",
                      borderRadius: 3,
                      background: completedIds.has(item.id) ? "var(--accent)" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                    aria-label={completedIds.has(item.id) ? "Mark incomplete" : "Mark complete"}
                  >
                    {completedIds.has(item.id) ? "✓" : ""}
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "var(--t-small)",
                          fontWeight: 600,
                          color: completedIds.has(item.id) ? "var(--text-4)" : "var(--text)",
                          textDecoration: completedIds.has(item.id) ? "line-through" : "none",
                        }}
                      >
                        {item.name}
                      </span>
                      {item.dose_text && (
                        <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                          {item.dose_text}
                        </span>
                      )}
                      {item.source === "tff_library" && (
                        <TffBadge variant="default">TFF data</TffBadge>
                      )}
                    </div>
                    {item.instructions && (
                      <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", margin: "3px 0 0", lineHeight: 1.4 }}>
                        {item.instructions}
                      </p>
                    )}
                  </div>

                  {/* Deactivate */}
                  <button
                    onClick={() => void handleSetActive(item.id, false)}
                    title="Deactivate"
                    style={{
                      flexShrink: 0,
                      padding: "3px 8px",
                      background: "transparent",
                      border: "1px solid var(--border-soft)",
                      borderRadius: 3,
                      color: "var(--text-4)",
                      fontSize: "var(--t-micro)",
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </TffCard>
          </div>
        )
      })}

      {/* Empty state when no active items */}
      {adherence.active === 0 && (
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textAlign: "center", padding: "24px 0" }}>
            No active supplement items. Use &quot;+ Add Item&quot; below to build your schedule.
          </p>
        </TffCard>
      )}

      {/* ── C. Add Item ───────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showAddForm || showLibPicker ? 10 : 0 }}>
          <span className="label">Add to Schedule</span>
          <div style={{ display: "flex", gap: 8 }}>
            {!showLibPicker && (
              <button
                onClick={() => { setShowLibPicker(true); setShowAddForm(false) }}
                style={{
                  padding: "5px 12px",
                  background: "var(--card-2)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 3,
                  color: "var(--text-3)",
                  fontSize: "var(--t-small)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                From Library
              </button>
            )}
            <button
              onClick={() => { setShowAddForm((v) => !v); setShowLibPicker(false) }}
              style={{
                padding: "5px 12px",
                background: showAddForm ? "var(--border-soft)" : "var(--accent)",
                border: "none",
                borderRadius: 3,
                color: showAddForm ? "var(--text-3)" : "#000",
                fontSize: "var(--t-small)",
                fontFamily: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {showAddForm ? "Cancel" : "+ Add Item"}
            </button>
          </div>
        </div>

        {/* Library picker */}
        {showLibPicker && (
          <TffCard style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <TffCardHeader>Add from TFF Supplement Library</TffCardHeader>
              <button
                onClick={() => setShowLibPicker(false)}
                style={{ padding: "3px 10px", background: "transparent", border: "1px solid var(--border-soft)", borderRadius: 3, color: "var(--text-4)", fontSize: "var(--t-micro)", fontFamily: "inherit", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
            <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginBottom: 10 }}>
              Name and dose are sourced from TFF reference data. No content is invented. You can edit before saving.
            </p>
            <input
              type="text"
              placeholder="Search library…"
              value={libSearch}
              onChange={(e) => setLibSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 3,
                color: "var(--text)",
                fontSize: "var(--t-small)",
                fontFamily: "inherit",
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {filteredLib.map((sup, i) => (
                <div
                  key={sup.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < filteredLib.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)", margin: "0 0 2px" }}>
                      {sup.name}
                    </p>
                    <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", margin: 0 }}>
                      {sup.dose.slice(0, 80)}{sup.dose.length > 80 ? "…" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePickLib(sup)}
                    style={{
                      flexShrink: 0,
                      padding: "4px 10px",
                      background: "var(--accent)",
                      border: "none",
                      borderRadius: 3,
                      color: "#000",
                      fontSize: "var(--t-micro)",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              ))}
              {filteredLib.length === 0 && (
                <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", padding: "12px 0" }}>
                  No matches for &quot;{libSearch}&quot;
                </p>
              )}
            </div>
          </TffCard>
        )}

        {/* Manual add form */}
        {showAddForm && (
          <TffCard>
            <TffCardHeader>
              {addForm.source === "tff_library" ? "Add from Library — Review & Save" : "Add Supplement Item"}
            </TffCardHeader>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextInput
                label="NAME *"
                value={addForm.name}
                onChange={(v) => setAddForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. Magnesium Glycinate"
              />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <TextInput
                  label="DOSE (optional)"
                  value={addForm.dose_text}
                  onChange={(v) => setAddForm((f) => ({ ...f, dose_text: v }))}
                  placeholder="e.g. 400mg"
                />
                <SelectInput
                  label="TIMING BLOCK"
                  value={addForm.timing_block}
                  options={timingOptions}
                  onChange={(v) => setAddForm((f) => ({ ...f, timing_block: v as TimingBlock }))}
                />
              </div>

              <TextInput
                label="INSTRUCTIONS (optional)"
                value={addForm.instructions}
                onChange={(v) => setAddForm((f) => ({ ...f, instructions: v }))}
                placeholder="e.g. Take with food, avoid with zinc"
              />

              {addForm.source === "tff_library" && (
                <p className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.08em" }}>
                  SOURCE: TFF LIBRARY — dose and name from TFF reference data
                </p>
              )}

              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
                MANUAL ENTRY — all dose/timing text is user-entered or from TFF source data only
              </p>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => void handleAddItem()}
                  disabled={!addForm.name.trim() || saving}
                  style={{
                    padding: "7px 16px",
                    background: addForm.name.trim() && !saving ? "var(--accent)" : "var(--border-soft)",
                    border: "none",
                    borderRadius: 3,
                    color: addForm.name.trim() && !saving ? "#000" : "var(--text-4)",
                    fontSize: "var(--t-small)",
                    fontFamily: "inherit",
                    fontWeight: 600,
                    cursor: addForm.name.trim() && !saving ? "pointer" : "default",
                  }}
                >
                  {saving ? "Saving…" : "Save Item"}
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setAddForm(EMPTY_ADD_FORM) }}
                  style={{ padding: "7px 14px", background: "transparent", border: "1px solid var(--border-soft)", borderRadius: 3, color: "var(--text-4)", fontSize: "var(--t-small)", fontFamily: "inherit", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </TffCard>
        )}
      </div>

      {/* ── D. Inactive Items ─────────────────────────────────────────────── */}
      {inactiveItems.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showInactive ? 10 : 0 }}>
            <span className="label" style={{ color: "var(--text-4)" }}>
              Inactive ({inactiveItems.length})
            </span>
            <button
              onClick={() => setShowInactive((v) => !v)}
              style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border-soft)", borderRadius: 3, color: "var(--text-4)", fontSize: "var(--t-micro)", fontFamily: "inherit", cursor: "pointer" }}
            >
              {showInactive ? "Hide" : "Show"}
            </button>
          </div>
          {showInactive && (
            <TffCard>
              {inactiveItems.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i < inactiveItems.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
                      {item.name}
                    </span>
                    {item.dose_text && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 8 }}>
                        {item.dose_text}
                      </span>
                    )}
                    <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 8 }}>
                      · {TIMING_BLOCK_LABEL[item.timing_block]}
                    </span>
                  </div>
                  <button
                    onClick={() => void handleSetActive(item.id, true)}
                    style={{ flexShrink: 0, padding: "3px 10px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 3, color: "var(--text-3)", fontSize: "var(--t-micro)", fontFamily: "inherit", cursor: "pointer" }}
                  >
                    Reactivate
                  </button>
                </div>
              ))}
            </TffCard>
          )}
        </div>
      )}

      {/* ── E. Future Integration Placeholder ────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <TffCardHeader>Future Phase — Progress Integration</TffCardHeader>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              Supplement adherence is not yet connected to the Daily Progress score or Weekly Review.
              A future phase will wire adherence into the scoring system and expose it on the Weekly Review breakdown.
            </p>
          </div>
          <TffBadge variant="na">TODO</TffBadge>
        </div>
      </TffCard>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard, TffCardHeader } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import markersRaw from "@/data/blood_markers.json"
import {
  getTodayLocalDate,
  normalizeMarkerKey,
  fetchBloodworkTests,
  fetchBloodworkTestWithResults,
  createBloodworkTest,
  updateBloodworkTest,
  deleteBloodworkTest,
  upsertBloodworkResult,
  deleteBloodworkResult,
  getMarkerHistory,
  type BloodworkTest,
  type BloodworkResult,
  type BloodworkFlag,
  type BloodworkMarkerInput,
  type MarkerHistoryEntry,
} from "@/lib/supabase/bloodwork-tracking-sync"

// ── Library data ──────────────────────────────────────────────────────────────

interface LibMarker {
  id:    string
  name:  string
  panel: string
  units: string
}

const LIB_MARKERS = markersRaw as unknown as LibMarker[]

// ── Constants ─────────────────────────────────────────────────────────────────

type View = "tests" | "detail" | "history"

export const FLAG_OPTIONS: { value: BloodworkFlag; label: string }[] = [
  { value: "unknown",       label: "Unknown" },
  { value: "normal",        label: "Normal" },
  { value: "low",           label: "Low" },
  { value: "high",          label: "High" },
  { value: "manual_review", label: "Manual Review" },
]

const FLAG_VARIANT: Record<BloodworkFlag, "core" | "warn" | "depends" | "na" | "default"> = {
  normal:        "core",
  low:           "warn",
  high:          "warn",
  manual_review: "depends",
  unknown:       "na",
}

// ── Form types ────────────────────────────────────────────────────────────────

interface TestForm {
  test_date: string
  lab_name:  string
  notes:     string
}

interface ResultForm {
  marker_key:           string
  marker_name:          string
  value:                string
  unit:                 string
  reference_range_text: string
  flag:                 BloodworkFlag
  notes:                string
}

const EMPTY_TEST_FORM = (): TestForm => ({
  test_date: getTodayLocalDate(),
  lab_name:  "",
  notes:     "",
})

const EMPTY_RESULT_FORM = (): ResultForm => ({
  marker_key:           "",
  marker_name:          "",
  value:                "",
  unit:                 "",
  reference_range_text: "",
  flag:                 "unknown",
  notes:                "",
})

// ── Sub-components ────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 15 / BW TRACKING"
        title="Bloodwork Tracking"
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

function FlagBadge({ flag }: { flag: BloodworkFlag }) {
  const label = FLAG_OPTIONS.find((o) => o.value === flag)?.label ?? "Unknown"
  return <TffBadge variant={FLAG_VARIANT[flag]}>{label}</TffBadge>
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label:       string
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  type?:       string
  required?:   boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 }}>
      <label className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
        {label}{required ? " *" : ""}
      </label>
      <input
        type={type}
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label:   string
  value:   string
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

function Btn({
  onClick,
  disabled,
  variant = "primary",
  children,
}: {
  onClick:   () => void
  disabled?: boolean
  variant?:  "primary" | "secondary" | "ghost" | "danger"
  children:  React.ReactNode
}) {
  const bg =
    disabled           ? "var(--border-soft)" :
    variant === "primary"   ? "var(--accent)"     :
    variant === "danger"    ? "var(--danger)"     :
    variant === "secondary" ? "var(--card-2)"     :
    "transparent"

  const color =
    disabled           ? "var(--text-4)" :
    variant === "primary"   ? "#000"          :
    variant === "danger"    ? "#fff"          :
    "var(--text-3)"

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 14px",
        background: bg,
        border: variant === "ghost" || variant === "secondary" ? "1px solid var(--border-soft)" : "none",
        borderRadius: 3,
        color,
        fontSize: "var(--t-small)",
        fontFamily: "inherit",
        fontWeight: variant === "primary" ? 600 : 400,
        cursor: disabled ? "default" : "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BloodworkTrackingPage() {
  const today = getTodayLocalDate()

  const [syncStatus, setSyncStatus]     = useState<SyncStatus>("syncing")
  const [view, setView]                 = useState<View>("tests")
  const [tests, setTests]               = useState<BloodworkTest[]>([])

  // Detail view
  const [selectedTest, setSelectedTest]       = useState<BloodworkTest | null>(null)
  const [selectedResults, setSelectedResults] = useState<BloodworkResult[]>([])
  const [detailLoading, setDetailLoading]     = useState(false)

  // History view
  const [historyMarkerKey,  setHistoryMarkerKey]  = useState<string>("")
  const [historyMarkerName, setHistoryMarkerName] = useState<string>("")
  const [historyEntries,    setHistoryEntries]     = useState<MarkerHistoryEntry[]>([])
  const [historyLoading,    setHistoryLoading]     = useState(false)

  // Add test form
  const [showAddTest, setShowAddTest]   = useState(false)
  const [testForm, setTestForm]         = useState<TestForm>(EMPTY_TEST_FORM)
  const [testSaving, setTestSaving]     = useState(false)

  // Edit test
  const [editingTest, setEditingTest]   = useState(false)
  const [testEditForm, setTestEditForm] = useState<TestForm>(EMPTY_TEST_FORM)

  // Add result form
  const [showAddResult, setShowAddResult] = useState(false)
  const [resultForm, setResultForm]       = useState<ResultForm>(EMPTY_RESULT_FORM)
  const [resultSaving, setResultSaving]   = useState(false)
  const [showMarkerLib, setShowMarkerLib] = useState(false)
  const [libSearch, setLibSearch]         = useState("")

  // History marker selector
  const [histSearchInput, setHistSearchInput] = useState("")

  // ── Load tests ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchBloodworkTests().then((res) => {
      if (res.ok) {
        setTests(res.tests)
        setSyncStatus("synced")
      } else {
        setSyncStatus(res.reason === "unauthenticated" ? "unauthenticated" : "error")
      }
    })
  }, [])

  // ── Navigate to detail ─────────────────────────────────────────────────────

  const openDetail = useCallback(async (test: BloodworkTest) => {
    setDetailLoading(true)
    setView("detail")
    setSelectedTest(test)
    setSelectedResults([])
    setShowAddResult(false)
    setEditingTest(false)
    setTestEditForm({ test_date: test.test_date, lab_name: test.lab_name ?? "", notes: test.notes ?? "" })

    const res = await fetchBloodworkTestWithResults(test.id)
    if (res.ok) {
      setSelectedTest(res.detail.test)
      setSelectedResults(res.detail.results)
    }
    setDetailLoading(false)
  }, [])

  // ── Navigate to history ────────────────────────────────────────────────────

  const openHistory = useCallback(async (markerKey: string, markerName: string) => {
    setHistoryMarkerKey(markerKey)
    setHistoryMarkerName(markerName)
    setHistoryEntries([])
    setHistoryLoading(true)
    setView("history")

    const res = await getMarkerHistory(markerKey)
    if (res.ok) setHistoryEntries(res.entries)
    setHistoryLoading(false)
  }, [])

  // ── Add test ───────────────────────────────────────────────────────────────

  const handleAddTest = useCallback(async () => {
    if (!testForm.test_date) return
    setTestSaving(true)
    const res = await createBloodworkTest({
      test_date: testForm.test_date,
      lab_name:  testForm.lab_name.trim() || null,
      notes:     testForm.notes.trim() || null,
    })
    if (res.ok) {
      setTests((prev) => [res.test, ...prev])
      setTestForm(EMPTY_TEST_FORM())
      setShowAddTest(false)
    }
    setTestSaving(false)
  }, [testForm])

  // ── Delete test ────────────────────────────────────────────────────────────

  const handleDeleteTest = useCallback(async (testId: string) => {
    const res = await deleteBloodworkTest(testId)
    if (res.ok) {
      setTests((prev) => prev.filter((t) => t.id !== testId))
      if (view === "detail" && selectedTest?.id === testId) {
        setView("tests")
        setSelectedTest(null)
        setSelectedResults([])
      }
    }
  }, [view, selectedTest])

  // ── Save test edits ────────────────────────────────────────────────────────

  const handleSaveTestEdit = useCallback(async () => {
    if (!selectedTest) return
    const res = await updateBloodworkTest(selectedTest.id, {
      test_date: testEditForm.test_date,
      lab_name:  testEditForm.lab_name.trim() || null,
      notes:     testEditForm.notes.trim() || null,
    })
    if (res.ok) {
      const updated: BloodworkTest = {
        ...selectedTest,
        test_date: testEditForm.test_date,
        lab_name:  testEditForm.lab_name.trim() || null,
        notes:     testEditForm.notes.trim() || null,
      }
      setSelectedTest(updated)
      setTests((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setEditingTest(false)
    }
  }, [selectedTest, testEditForm])

  // ── Add result ─────────────────────────────────────────────────────────────

  const handleAddResult = useCallback(async () => {
    if (!selectedTest || !resultForm.marker_name.trim()) return
    setResultSaving(true)

    const key = resultForm.marker_key || normalizeMarkerKey(resultForm.marker_name)
    const input: BloodworkMarkerInput = {
      marker_key:           key,
      marker_name:          resultForm.marker_name.trim(),
      value:                resultForm.value !== "" ? Number(resultForm.value) : null,
      unit:                 resultForm.unit.trim() || null,
      reference_range_text: resultForm.reference_range_text.trim() || null,
      flag:                 resultForm.flag,
      notes:                resultForm.notes.trim() || null,
    }

    const res = await upsertBloodworkResult(selectedTest.id, input)
    if (res.ok) {
      setSelectedResults((prev) => {
        const idx = prev.findIndex((r) => r.marker_key === key)
        return idx >= 0
          ? prev.map((r, i) => (i === idx ? res.result : r))
          : [...prev, res.result].sort((a, b) => a.marker_name.localeCompare(b.marker_name))
      })
      setSelectedTest((t) => t ? { ...t, result_count: selectedResults.length + 1 } : t)
      setTests((prev) =>
        prev.map((t) =>
          t.id === selectedTest.id
            ? { ...t, result_count: t.result_count + 1 }
            : t,
        ),
      )
      setResultForm(EMPTY_RESULT_FORM())
      setShowAddResult(false)
      setShowMarkerLib(false)
    }
    setResultSaving(false)
  }, [selectedTest, resultForm, selectedResults.length])

  // ── Delete result ──────────────────────────────────────────────────────────

  const handleDeleteResult = useCallback(async (resultId: string) => {
    const res = await deleteBloodworkResult(resultId)
    if (res.ok) {
      setSelectedResults((prev) => prev.filter((r) => r.id !== resultId))
      setTests((prev) =>
        prev.map((t) =>
          t.id === selectedTest?.id
            ? { ...t, result_count: Math.max(0, t.result_count - 1) }
            : t,
        ),
      )
    }
  }, [selectedTest])

  // ── Library pick ───────────────────────────────────────────────────────────

  const handlePickMarker = useCallback((m: LibMarker) => {
    setResultForm((f) => ({
      ...f,
      marker_key:  m.id,
      marker_name: m.name,
      unit:        m.units,
    }))
    setShowMarkerLib(false)
    setLibSearch("")
    setShowAddResult(true)
  }, [])

  // ── History search ─────────────────────────────────────────────────────────

  const handleHistorySearch = useCallback(async () => {
    const key = normalizeMarkerKey(histSearchInput.trim())
    if (!key) return
    const name = LIB_MARKERS.find((m) => m.id === key)?.name ?? histSearchInput.trim()
    await openHistory(key, name)
    setHistSearchInput("")
  }, [histSearchInput, openHistory])

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalResults = tests.reduce((s, t) => s + t.result_count, 0)
  const mostRecent   = tests.length > 0 ? tests[0].test_date : null

  // Unique marker keys across all result data (for objective summary)
  // We don't have this without fetching all results — just show counts
  const filteredLib = libSearch.trim()
    ? LIB_MARKERS.filter((m) => m.name.toLowerCase().includes(libSearch.toLowerCase()))
    : LIB_MARKERS

  // ── Render: loading ────────────────────────────────────────────────────────

  if (syncStatus === "syncing") return <Skeleton />

  // ── Render: unauthenticated ────────────────────────────────────────────────

  if (syncStatus === "unauthenticated") {
    return (
      <div className="stack-lg">
        <PageHeader
          crumb="INDEX · 15 / BW TRACKING"
          title="Bloodwork Tracking"
          subtitle="Manual blood marker history and lab result tracking."
        />
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 10 }}>
            Bloodwork tracking requires an authenticated session to store lab results securely.
          </p>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
            SIGN IN TO ACCESS BLOODWORK TRACKING
          </p>
        </TffCard>
      </div>
    )
  }

  // ── Render: error ──────────────────────────────────────────────────────────

  if (syncStatus === "error") {
    return (
      <div className="stack-lg">
        <PageHeader
          crumb="INDEX · 15 / BW TRACKING"
          title="Bloodwork Tracking"
          subtitle="Manual blood marker history and lab result tracking."
        />
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 10 }}>
            Could not load bloodwork data. Check your connection and try refreshing.
          </p>
          <TffBadge variant="warn">Sync error</TffBadge>
        </TffCard>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: HISTORY
  // ══════════════════════════════════════════════════════════════════════════

  if (view === "history") {
    return (
      <div className="stack-lg">
        <PageHeader
          crumb="INDEX · 15 / BW TRACKING"
          title="Bloodwork Tracking"
          subtitle="Marker history"
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Btn variant="ghost" onClick={() => setView("tests")}>← Back to Tests</Btn>
          <SyncBadge status={syncStatus} />
        </div>

        <TffCard>
          <TffCardHeader>{historyMarkerName || historyMarkerKey}</TffCardHeader>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em", marginBottom: 16 }}>
            MARKER KEY: {historyMarkerKey} · CHRONOLOGICAL HISTORY
          </p>

          {historyLoading ? (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>Loading history…</p>
          ) : historyEntries.length === 0 ? (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
              No results logged for this marker yet. Add results from the test detail view.
            </p>
          ) : (
            <div>
              {/* Column header */}
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 100px", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                {["Date", "Value / Unit", "Flag", "Reference"].map((h) => (
                  <span key={h} className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>
              {historyEntries.map((entry, i) => (
                <div
                  key={`${entry.test_id}-${i}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 80px 100px",
                    gap: 8,
                    padding: "10px 0",
                    borderBottom: i < historyEntries.length - 1 ? "1px solid var(--border-soft)" : "none",
                    alignItems: "start",
                  }}
                >
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                    {entry.test_date}
                  </span>
                  <div>
                    <span style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}>
                      {entry.value !== null ? String(entry.value) : "—"}
                    </span>
                    {entry.unit && (
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 4 }}>
                        {entry.unit}
                      </span>
                    )}
                    {entry.lab_name && (
                      <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", margin: "2px 0 0" }}>
                        {entry.lab_name}
                      </p>
                    )}
                    {entry.notes && (
                      <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", margin: "2px 0 0" }}>
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <FlagBadge flag={entry.flag} />
                  <span style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", lineHeight: 1.4 }}>
                    {entry.reference_range_text ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TffCard>

        <TffCard>
          <TffCardHeader>Future Phase 2.5</TffCardHeader>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0 }}>
            Marker trend graphs and analytics are reserved for Phase 2.5. No chart libraries are added yet.
          </p>
        </TffCard>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: DETAIL
  // ══════════════════════════════════════════════════════════════════════════

  if (view === "detail" && selectedTest) {
    return (
      <div className="stack-lg">
        <PageHeader
          crumb="INDEX · 15 / BW TRACKING"
          title="Bloodwork Tracking"
          subtitle="Test detail"
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Btn variant="ghost" onClick={() => { setView("tests"); setShowAddResult(false) }}>
            ← Back to Tests
          </Btn>
          <SyncBadge status={syncStatus} />
        </div>

        {/* Test header */}
        <TffCard>
          {editingTest ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TffCardHeader>Edit Test</TffCardHeader>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <FieldInput label="DATE" type="date" value={testEditForm.test_date} onChange={(v) => setTestEditForm((f) => ({ ...f, test_date: v }))} required />
                <FieldInput label="LAB NAME" value={testEditForm.lab_name} onChange={(v) => setTestEditForm((f) => ({ ...f, lab_name: v }))} placeholder="e.g. LabCorp" />
              </div>
              <FieldInput label="NOTES" value={testEditForm.notes} onChange={(v) => setTestEditForm((f) => ({ ...f, notes: v }))} placeholder="Optional notes" />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="primary" onClick={() => void handleSaveTestEdit()}>Save</Btn>
                <Btn variant="ghost" onClick={() => setEditingTest(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>
                  BLOODWORK TEST
                </p>
                <p style={{ fontSize: "var(--t-h2)", fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>
                  {selectedTest.test_date}
                </p>
                {selectedTest.lab_name && (
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 4px" }}>
                    {selectedTest.lab_name}
                  </p>
                )}
                {selectedTest.notes && (
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0 }}>
                    {selectedTest.notes}
                  </p>
                )}
                <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 6 }}>
                  {selectedResults.length} MARKER{selectedResults.length !== 1 ? "S" : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={() => setEditingTest(true)}>Edit</Btn>
                <Btn variant="danger" onClick={() => void handleDeleteTest(selectedTest.id)}>Delete Test</Btn>
              </div>
            </div>
          )}
        </TffCard>

        {/* Results */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <span className="label">Markers</span>
            <div style={{ display: "flex", gap: 8 }}>
              {!showMarkerLib && (
                <Btn variant="secondary" onClick={() => { setShowMarkerLib(true); setShowAddResult(false) }}>
                  From Library
                </Btn>
              )}
              <Btn
                variant={showAddResult ? "ghost" : "primary"}
                onClick={() => { setShowAddResult((v) => !v); setShowMarkerLib(false) }}
              >
                {showAddResult ? "Cancel" : "+ Add Marker"}
              </Btn>
            </div>
          </div>

          {/* Marker library picker */}
          {showMarkerLib && (
            <TffCard style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <TffCardHeader>Select from TFF Marker Library</TffCardHeader>
                <Btn variant="ghost" onClick={() => setShowMarkerLib(false)}>Close</Btn>
              </div>
              <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginBottom: 10 }}>
                Pre-fills name and unit from TFF reference data. Reference range is not imported — enter from your lab report.
              </p>
              <input
                type="text"
                placeholder="Search markers…"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
                style={{
                  width: "100%", padding: "6px 10px",
                  background: "var(--card-2)", border: "1px solid var(--border-soft)",
                  borderRadius: 3, color: "var(--text)", fontSize: "var(--t-small)",
                  fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box",
                }}
              />
              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {filteredLib.map((m, i) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 12, padding: "8px 0",
                      borderBottom: i < filteredLib.length - 1 ? "1px solid var(--border-soft)" : "none",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "var(--t-small)", fontWeight: 500, color: "var(--text)", margin: "0 0 2px" }}>
                        {m.name}
                      </p>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {m.units} · {m.panel}
                      </span>
                    </div>
                    <Btn variant="primary" onClick={() => handlePickMarker(m)}>Select</Btn>
                  </div>
                ))}
                {filteredLib.length === 0 && (
                  <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", padding: "8px 0" }}>
                    No matches for &quot;{libSearch}&quot;
                  </p>
                )}
              </div>
            </TffCard>
          )}

          {/* Add result form */}
          {showAddResult && (
            <TffCard style={{ marginBottom: 10 }}>
              <TffCardHeader>Log Marker Result</TffCardHeader>
              <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", marginBottom: 12 }}>
                All values are manually entered from your lab report. No ranges are inferred or generated.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <FieldInput
                    label="MARKER NAME" required
                    value={resultForm.marker_name}
                    onChange={(v) => setResultForm((f) => ({
                      ...f,
                      marker_name: v,
                      marker_key: f.marker_key || normalizeMarkerKey(v),
                    }))}
                    placeholder="e.g. Total Testosterone"
                  />
                  <FieldInput
                    label="VALUE"
                    type="number"
                    value={resultForm.value}
                    onChange={(v) => setResultForm((f) => ({ ...f, value: v }))}
                    placeholder="e.g. 650"
                  />
                  <FieldInput
                    label="UNIT"
                    value={resultForm.unit}
                    onChange={(v) => setResultForm((f) => ({ ...f, unit: v }))}
                    placeholder="e.g. ng/dL"
                  />
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <FieldInput
                    label="REFERENCE RANGE (from lab report)"
                    value={resultForm.reference_range_text}
                    onChange={(v) => setResultForm((f) => ({ ...f, reference_range_text: v }))}
                    placeholder="e.g. 300–900 ng/dL"
                  />
                  <SelectField
                    label="FLAG"
                    value={resultForm.flag}
                    options={FLAG_OPTIONS}
                    onChange={(v) => setResultForm((f) => ({ ...f, flag: v as BloodworkFlag }))}
                  />
                </div>
                <FieldInput
                  label="NOTES (optional)"
                  value={resultForm.notes}
                  onChange={(v) => setResultForm((f) => ({ ...f, notes: v }))}
                  placeholder="Optional notes"
                />
                <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
                  MANUAL ENTRY ONLY — no ranges or flags are auto-generated
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="primary"
                    disabled={!resultForm.marker_name.trim() || resultSaving}
                    onClick={() => void handleAddResult()}
                  >
                    {resultSaving ? "Saving…" : "Save Marker"}
                  </Btn>
                  <Btn variant="ghost" onClick={() => { setShowAddResult(false); setResultForm(EMPTY_RESULT_FORM()) }}>
                    Cancel
                  </Btn>
                </div>
              </div>
            </TffCard>
          )}

          {/* Results table */}
          {detailLoading ? (
            <TffCard>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>Loading markers…</p>
            </TffCard>
          ) : selectedResults.length === 0 ? (
            <TffCard>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textAlign: "center", padding: "20px 0" }}>
                No markers logged for this test yet. Use &quot;+ Add Marker&quot; to record results.
              </p>
            </TffCard>
          ) : (
            <TffCard>
              {selectedResults.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: i < selectedResults.length - 1 ? "1px solid var(--border-soft)" : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}>
                        {r.marker_name}
                      </span>
                      <FlagBadge flag={r.flag} />
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {r.value !== null && (
                        <span style={{ fontSize: "var(--t-small)", color: "var(--text-2)" }}>
                          {r.value}
                          {r.unit && (
                            <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginLeft: 3 }}>
                              {r.unit}
                            </span>
                          )}
                        </span>
                      )}
                      {r.reference_range_text && (
                        <span style={{ fontSize: "var(--t-micro)", color: "var(--text-4)" }}>
                          ref: {r.reference_range_text}
                        </span>
                      )}
                    </div>
                    {r.notes && (
                      <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", margin: "3px 0 0" }}>
                        {r.notes}
                      </p>
                    )}
                    <button
                      onClick={() => void openHistory(r.marker_key, r.marker_name)}
                      style={{
                        marginTop: 4,
                        background: "none", border: "none", padding: 0,
                        color: "var(--accent)", fontSize: "var(--t-micro)",
                        fontFamily: "inherit", cursor: "pointer", textDecoration: "underline",
                      }}
                    >
                      View history
                    </button>
                  </div>
                  <Btn variant="ghost" onClick={() => void handleDeleteResult(r.id)}>Remove</Btn>
                </div>
              ))}
            </TffCard>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: TESTS (main)
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="stack-lg">
      <PageHeader
        crumb="INDEX · 15 / BW TRACKING"
        title="Bloodwork Tracking"
        subtitle="Manual blood marker history and lab result tracking."
      />

      {/* ── A. Summary ────────────────────────────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <span className="label">Objective Summary</span>
          <SyncBadge status={syncStatus} />
        </div>

        {tests.length === 0 ? (
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>
            No bloodwork tests logged yet. Use &quot;+ Add Test&quot; below to record your first panel.
          </p>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>TESTS LOGGED</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>{tests.length}</p>
            </div>
            <div style={{ flex: 1, minWidth: 100, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>TOTAL RESULTS</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1 }}>{totalResults}</p>
            </div>
            <div style={{ flex: 2, minWidth: 140, padding: "12px 14px", background: "var(--card-2)", border: "1px solid var(--border-soft)", borderRadius: 4 }}>
              <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>MOST RECENT TEST</p>
              <p style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", margin: 0 }}>{mostRecent ?? "—"}</p>
            </div>
          </div>
        )}

        <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 12, letterSpacing: "0.08em" }}>
          OBJECTIVE DATA ONLY — no diagnosis, no recommendations, no auto-classification of results
        </p>
      </TffCard>

      {/* ── B. Add Test ───────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: showAddTest ? 10 : 0 }}>
          <span className="label">Add Test</span>
          <Btn
            variant={showAddTest ? "ghost" : "primary"}
            onClick={() => setShowAddTest((v) => !v)}
          >
            {showAddTest ? "Cancel" : "+ Add Test"}
          </Btn>
        </div>

        {showAddTest && (
          <TffCard>
            <TffCardHeader>New Bloodwork Test</TffCardHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <FieldInput
                  label="TEST DATE" required type="date"
                  value={testForm.test_date}
                  onChange={(v) => setTestForm((f) => ({ ...f, test_date: v }))}
                />
                <FieldInput
                  label="LAB NAME (optional)"
                  value={testForm.lab_name}
                  onChange={(v) => setTestForm((f) => ({ ...f, lab_name: v }))}
                  placeholder="e.g. LabCorp, NHS, private"
                />
              </div>
              <FieldInput
                label="NOTES (optional)"
                value={testForm.notes}
                onChange={(v) => setTestForm((f) => ({ ...f, notes: v }))}
                placeholder="e.g. Fasted 12h, morning draw"
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="primary"
                  disabled={!testForm.test_date || testSaving}
                  onClick={() => void handleAddTest()}
                >
                  {testSaving ? "Creating…" : "Create Test"}
                </Btn>
                <Btn variant="ghost" onClick={() => { setShowAddTest(false); setTestForm(EMPTY_TEST_FORM()) }}>
                  Cancel
                </Btn>
              </div>
            </div>
          </TffCard>
        )}
      </div>

      {/* ── C. Recent Tests ───────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Recent Tests</SectionHeader>
        {tests.length === 0 ? (
          <TffCard>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textAlign: "center", padding: "24px 0" }}>
              No tests logged yet.
            </p>
          </TffCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tests.map((test) => (
              <TffCard key={test.id}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "var(--t-small)", fontWeight: 600, color: "var(--text)" }}>
                        {test.test_date}
                      </span>
                      {test.lab_name && (
                        <span style={{ fontSize: "var(--t-small)", color: "var(--text-3)" }}>
                          {test.lab_name}
                        </span>
                      )}
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {test.result_count} marker{test.result_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {test.notes && (
                      <p style={{ fontSize: "var(--t-micro)", color: "var(--text-4)", margin: "3px 0 0" }}>
                        {test.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Btn variant="primary" onClick={() => void openDetail(test)}>View</Btn>
                    <Btn variant="danger" onClick={() => void handleDeleteTest(test.id)}>Delete</Btn>
                  </div>
                </div>
              </TffCard>
            ))}
          </div>
        )}
      </div>

      {/* ── D. Marker History ─────────────────────────────────────────────── */}
      <div>
        <SectionHeader>Marker History</SectionHeader>
        <TffCard>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginBottom: 12 }}>
            View the history of a specific marker across all tests.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              list="marker-datalist"
              placeholder="Type or select a marker name…"
              value={histSearchInput}
              onChange={(e) => setHistSearchInput(e.target.value)}
              style={{
                flex: 1, minWidth: 200,
                padding: "6px 10px",
                background: "var(--card-2)", border: "1px solid var(--border-soft)",
                borderRadius: 3, color: "var(--text)", fontSize: "var(--t-small)",
                fontFamily: "inherit",
              }}
            />
            <datalist id="marker-datalist">
              {LIB_MARKERS.map((m) => (
                <option key={m.id} value={m.name} />
              ))}
            </datalist>
            <Btn
              variant="primary"
              disabled={!histSearchInput.trim()}
              onClick={() => void handleHistorySearch()}
            >
              View History
            </Btn>
          </div>
          <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", marginTop: 8, letterSpacing: "0.08em" }}>
            NO CHART — PHASE 2.5 WILL ADD MARKER TREND GRAPHS
          </p>
        </TffCard>
      </div>

      {/* ── E. Future Phase Placeholder ───────────────────────────────────── */}
      <TffCard>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <TffCardHeader>Future Phase 2.5 — Marker Graphs</TffCardHeader>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              Trend visualization, marker graphs, and protocol linkage are reserved for Phase 2.5.
              No chart libraries are added yet. Data logged now will be available for graphing when that phase ships.
            </p>
          </div>
          <TffBadge variant="na">TODO</TffBadge>
        </div>
      </TffCard>
    </div>
  )
}

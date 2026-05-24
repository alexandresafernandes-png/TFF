import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type BloodworkFlag = "low" | "normal" | "high" | "manual_review" | "unknown"

export interface BloodworkTest {
  id:           string
  test_date:    string   // YYYY-MM-DD
  lab_name:     string | null
  notes:        string | null
  result_count: number   // computed client-side
  created_at:   string
}

export interface BloodworkResult {
  id:                   string
  test_id:              string
  marker_key:           string
  marker_name:          string
  value:                number | null
  unit:                 string | null
  reference_range_text: string | null
  flag:                 BloodworkFlag
  notes:                string | null
}

export interface BloodworkMarkerInput {
  marker_key:           string
  marker_name:          string
  value:                number | null
  unit:                 string | null
  reference_range_text: string | null
  flag:                 BloodworkFlag
  notes:                string | null
}

export interface BloodworkTestDetail {
  test:    BloodworkTest
  results: BloodworkResult[]
}

export interface MarkerHistoryEntry {
  test_id:              string
  test_date:            string
  lab_name:             string | null
  value:                number | null
  unit:                 string | null
  reference_range_text: string | null
  flag:                 BloodworkFlag
  notes:                string | null
}

// ── Result types ──────────────────────────────────────────────────────────────

type TestsResult =
  | { ok: true;  tests: BloodworkTest[] }
  | { ok: false; reason: "unauthenticated" | "error" }

type TestDetailResult =
  | { ok: true;  detail: BloodworkTestDetail }
  | { ok: false; reason: "unauthenticated" | "not_found" | "error" }

type TestResult =
  | { ok: true;  test: BloodworkTest }
  | { ok: false; reason: "unauthenticated" | "error" }

type ResultItemResult =
  | { ok: true;  result: BloodworkResult }
  | { ok: false; reason: "unauthenticated" | "error" }

type MarkerHistoryResult =
  | { ok: true;  entries: MarkerHistoryEntry[] }
  | { ok: false; reason: "unauthenticated" | "error" }

type VoidResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error" }

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function getTodayLocalDate(): string {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-")
}

export function normalizeMarkerKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60)
}

// ── Row normalisers ───────────────────────────────────────────────────────────

function rowToTest(row: Record<string, unknown>, count = 0): BloodworkTest {
  return {
    id:           String(row.id ?? ""),
    test_date:    String(row.test_date ?? ""),
    lab_name:     row.lab_name != null ? String(row.lab_name) : null,
    notes:        row.notes != null ? String(row.notes) : null,
    result_count: count,
    created_at:   String(row.created_at ?? ""),
  }
}

function rowToResult(row: Record<string, unknown>): BloodworkResult {
  return {
    id:                   String(row.id ?? ""),
    test_id:              String(row.test_id ?? ""),
    marker_key:           String(row.marker_key ?? ""),
    marker_name:          String(row.marker_name ?? ""),
    value:                row.value != null ? Number(row.value) : null,
    unit:                 row.unit != null ? String(row.unit) : null,
    reference_range_text: row.reference_range_text != null ? String(row.reference_range_text) : null,
    flag:                 (row.flag as BloodworkFlag) ?? "unknown",
    notes:                row.notes != null ? String(row.notes) : null,
  }
}

// ── Fetch all tests ───────────────────────────────────────────────────────────

export async function fetchBloodworkTests(): Promise<TestsResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const uid = session.user.id

    const [testsRes, countsRes] = await Promise.allSettled([
      supabase
        .from("bloodwork_tests")
        .select("id, test_date, lab_name, notes, created_at")
        .eq("user_id", uid)
        .order("test_date", { ascending: false }),
      supabase
        .from("bloodwork_results")
        .select("test_id")
        .eq("user_id", uid),
    ])

    if (testsRes.status !== "fulfilled" || testsRes.value.error) {
      return { ok: false, reason: "error" }
    }

    const testRows = (testsRes.value.data as unknown as Record<string, unknown>[]) ?? []

    // Build count map client-side
    const countMap = new Map<string, number>()
    if (countsRes.status === "fulfilled" && !countsRes.value.error) {
      const countRows = (countsRes.value.data as unknown as Record<string, unknown>[]) ?? []
      for (const r of countRows) {
        const tid = String(r.test_id ?? "")
        countMap.set(tid, (countMap.get(tid) ?? 0) + 1)
      }
    }

    return {
      ok:    true,
      tests: testRows.map((r) => rowToTest(r, countMap.get(String(r.id ?? "")) ?? 0)),
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Fetch one test + results ──────────────────────────────────────────────────

export async function fetchBloodworkTestWithResults(testId: string): Promise<TestDetailResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const [testRes, resultsRes] = await Promise.allSettled([
      supabase
        .from("bloodwork_tests")
        .select("id, test_date, lab_name, notes, created_at")
        .eq("id", testId)
        .eq("user_id", session.user.id)
        .maybeSingle(),
      supabase
        .from("bloodwork_results")
        .select("id, test_id, marker_key, marker_name, value, unit, reference_range_text, flag, notes")
        .eq("test_id", testId)
        .eq("user_id", session.user.id)
        .order("marker_name", { ascending: true }),
    ])

    if (testRes.status !== "fulfilled" || testRes.value.error) return { ok: false, reason: "error" }
    if (!testRes.value.data) return { ok: false, reason: "not_found" }

    const resultRows =
      resultsRes.status === "fulfilled" && !resultsRes.value.error
        ? (resultsRes.value.data as unknown as Record<string, unknown>[]) ?? []
        : []

    const testRow = testRes.value.data as unknown as Record<string, unknown>
    const results = resultRows.map(rowToResult)

    return {
      ok: true,
      detail: {
        test:    rowToTest(testRow, results.length),
        results,
      },
    }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Create test ───────────────────────────────────────────────────────────────

export async function createBloodworkTest(data: {
  test_date: string
  lab_name:  string | null
  notes:     string | null
}): Promise<TestResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data: row, error } = await supabase
      .from("bloodwork_tests")
      .insert({ user_id: session.user.id, ...data })
      .select("id, test_date, lab_name, notes, created_at")
      .single()

    if (error) return { ok: false, reason: "error" }
    return { ok: true, test: rowToTest(row as unknown as Record<string, unknown>, 0) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Create test with results (batch) ─────────────────────────────────────────

type TestWithResultsResult =
  | { ok: true;  test: BloodworkTest; results: BloodworkResult[] }
  | { ok: false; reason: "unauthenticated" | "error" }

export async function createBloodworkTestWithResults(
  testData: { test_date: string; lab_name: string | null; notes: string | null },
  markers:  BloodworkMarkerInput[],
): Promise<TestWithResultsResult> {
  const testRes = await createBloodworkTest(testData)
  if (!testRes.ok) return testRes

  const results: BloodworkResult[] = []
  for (const m of markers) {
    const r = await upsertBloodworkResult(testRes.test.id, m)
    if (r.ok) results.push(r.result)
  }

  return { ok: true, test: { ...testRes.test, result_count: results.length }, results }
}

// ── Update test ───────────────────────────────────────────────────────────────

export async function updateBloodworkTest(
  id: string,
  updates: { test_date?: string; lab_name?: string | null; notes?: string | null },
): Promise<VoidResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase
      .from("bloodwork_tests")
      .update(updates)
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Delete test (cascades to results) ────────────────────────────────────────

export async function deleteBloodworkTest(id: string): Promise<VoidResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase
      .from("bloodwork_tests")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Upsert result ─────────────────────────────────────────────────────────────

export async function upsertBloodworkResult(
  testId: string,
  input: BloodworkMarkerInput,
): Promise<ResultItemResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { data: row, error } = await supabase
      .from("bloodwork_results")
      .upsert(
        {
          user_id:              session.user.id,
          test_id:              testId,
          marker_key:           input.marker_key,
          marker_name:          input.marker_name,
          value:                input.value,
          unit:                 input.unit,
          reference_range_text: input.reference_range_text,
          flag:                 input.flag,
          notes:                input.notes,
        },
        { onConflict: "test_id,marker_key" },
      )
      .select("id, test_id, marker_key, marker_name, value, unit, reference_range_text, flag, notes")
      .single()

    if (error) return { ok: false, reason: "error" }
    return { ok: true, result: rowToResult(row as unknown as Record<string, unknown>) }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Delete result ─────────────────────────────────────────────────────────────

export async function deleteBloodworkResult(id: string): Promise<VoidResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    const { error } = await supabase
      .from("bloodwork_results")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id)

    if (error) return { ok: false, reason: "error" }
    return { ok: true }
  } catch {
    return { ok: false, reason: "error" }
  }
}

// ── Marker history ────────────────────────────────────────────────────────────

export async function getMarkerHistory(markerKey: string): Promise<MarkerHistoryResult> {
  if (!hasSupabaseConfig) return { ok: false, reason: "unauthenticated" }
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { ok: false, reason: "unauthenticated" }

    // Join with bloodwork_tests to get test_date + lab_name via client-side merge
    const [resultsRes, testsRes] = await Promise.allSettled([
      supabase
        .from("bloodwork_results")
        .select("test_id, value, unit, reference_range_text, flag, notes")
        .eq("user_id", session.user.id)
        .eq("marker_key", markerKey),
      supabase
        .from("bloodwork_tests")
        .select("id, test_date, lab_name")
        .eq("user_id", session.user.id),
    ])

    if (resultsRes.status !== "fulfilled" || resultsRes.value.error) {
      return { ok: false, reason: "error" }
    }

    const resultRows = (resultsRes.value.data as unknown as Record<string, unknown>[]) ?? []
    const testRows =
      testsRes.status === "fulfilled" && !testsRes.value.error
        ? (testsRes.value.data as unknown as Record<string, unknown>[]) ?? []
        : []

    const testMap = new Map(testRows.map((t) => [String(t.id ?? ""), t]))

    const entries: MarkerHistoryEntry[] = resultRows
      .map((r) => {
        const t = testMap.get(String(r.test_id ?? ""))
        return {
          test_id:              String(r.test_id ?? ""),
          test_date:            t ? String(t.test_date ?? "") : "",
          lab_name:             t && t.lab_name != null ? String(t.lab_name) : null,
          value:                r.value != null ? Number(r.value) : null,
          unit:                 r.unit != null ? String(r.unit) : null,
          reference_range_text: r.reference_range_text != null ? String(r.reference_range_text) : null,
          flag:                 (r.flag as BloodworkFlag) ?? "unknown",
          notes:                r.notes != null ? String(r.notes) : null,
        }
      })
      .filter((e) => e.test_date)
      .sort((a, b) => a.test_date.localeCompare(b.test_date))

    return { ok: true, entries }
  } catch {
    return { ok: false, reason: "error" }
  }
}

"use client"

import { useState, useEffect } from "react"
import { TffBadge } from "@/components/tff/TffBadge"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import {
  fetchUserNotes,
  createUserNote,
  updateUserNote,
  archiveUserNote,
} from "@/lib/supabase/notes-sync"

// ── Types ─────────────────────────────────────────────────────────────────────

interface LocalNote {
  id: string          // "note_<timestamp>_<random>"
  cloudId?: string    // Supabase UUID, set after successful cloud create
  body: string
  created_at: string  // ISO string
  updated_at: string  // ISO string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lsKey(area: string, entityId?: string) {
  return `tff_notes_${area}_${entityId ?? "general"}`
}

function newLocalId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UserNotesPanel({
  area,
  entityId,
}: {
  area: string
  entityId?: string
}) {
  const [notes, setNotes] = useState<LocalNote[]>([])
  const [loaded, setLoaded] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")

  // Add-form state
  const [addOpen, setAddOpen] = useState(false)
  const [addBody, setAddBody] = useState("")

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState("")

  const key = lsKey(area, entityId)

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setNotes(JSON.parse(raw) as LocalNote[])
    } catch (_e) { /* ignore */ }
    setLoaded(true)
  }, [key])

  // ── Persist ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(key, JSON.stringify(notes)) } catch (_e) { /* ignore */ }
  }, [notes, loaded, key])

  // ── Initial cloud sync ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!loaded) return
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }
    setSyncStatus("syncing")

    fetchUserNotes(area, entityId).then((result) => {
      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }

      const remoteNotes = result.data

      setNotes((prev) => {
        const localCloudIds = new Set(prev.map((n) => n.cloudId).filter(Boolean))
        let updated = [...prev]

        // Download remote notes not already in local
        for (const r of remoteNotes) {
          if (!localCloudIds.has(r.id)) {
            updated = [
              ...updated,
              {
                id: newLocalId(),
                cloudId: r.id,
                body: r.body,
                created_at: r.created_at,
                updated_at: r.updated_at,
              },
            ]
          }
        }

        return updated.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      })

      // Upload local-only notes in background (using snapshot of current local notes)
      // We read directly from localStorage here to avoid stale closure issues
      try {
        const raw = localStorage.getItem(key)
        const localSnapshot: LocalNote[] = raw ? (JSON.parse(raw) as LocalNote[]) : []
        for (const note of localSnapshot) {
          if (!note.cloudId) {
            createUserNote({ area, entityId, body: note.body }).then((cloudId) => {
              if (cloudId) {
                setNotes((prev) =>
                  prev.map((n) => (n.id === note.id ? { ...n, cloudId } : n))
                )
              }
            })
          }
        }
      } catch (_e) { /* ignore */ }

      setSyncStatus("synced")
    })
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add ─────────────────────────────────────────────────────────────────────

  function handleAdd() {
    const body = addBody.trim()
    if (!body) return
    const now = new Date().toISOString()
    const newNote: LocalNote = { id: newLocalId(), body, created_at: now, updated_at: now }
    setNotes((prev) => [...prev, newNote])
    setAddBody("")
    setAddOpen(false)

    createUserNote({ area, entityId, body }).then((cloudId) => {
      if (cloudId) {
        setNotes((prev) =>
          prev.map((n) => (n.id === newNote.id ? { ...n, cloudId } : n))
        )
      }
    })
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────

  function startEdit(note: LocalNote) {
    setEditingId(note.id)
    setEditBody(note.body)
  }

  function handleEditSave(note: LocalNote) {
    const body = editBody.trim()
    if (!body) return
    const updated = { ...note, body, updated_at: new Date().toISOString() }
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
    setEditingId(null)
    if (note.cloudId) void updateUserNote(note.cloudId, { body })
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  function handleDelete(note: LocalNote) {
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
    if (note.cloudId) void archiveUserNote(note.cloudId)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (!loaded) return null

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: notes.length > 0 || addOpen ? 10 : 0,
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p className="label" style={{ margin: 0 }}>Notes</p>
          <SyncBadge status={syncStatus} />
        </div>
        {!addOpen && (
          <button
            onClick={() => setAddOpen(true)}
            className="mono"
            style={{
              padding: "3px 10px",
              fontSize: 9,
              letterSpacing: "0.08em",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text-4)",
              cursor: "pointer",
            }}
          >
            + ADD
          </button>
        )}
      </div>

      {/* Note list */}
      {notes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: addOpen ? 10 : 0 }}>
          {notes.map((note) =>
            editingId === note.id ? (
              // Inline edit form
              <div
                key={note.id}
                style={{
                  padding: "10px 12px",
                  background: "var(--panel-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                }}
              >
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEditSave(note)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "var(--t-small)",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 3,
                    color: "var(--text)",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    marginBottom: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleEditSave(note)}
                    disabled={!editBody.trim()}
                    className="mono"
                    style={{
                      padding: "4px 12px",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      background: editBody.trim() ? "var(--accent)" : "var(--panel-2)",
                      border: "1px solid",
                      borderColor: editBody.trim() ? "var(--accent)" : "var(--border)",
                      borderRadius: 3,
                      color: editBody.trim() ? "var(--bg)" : "var(--text-4)",
                      cursor: editBody.trim() ? "pointer" : "default",
                    }}
                  >
                    SAVE
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="mono"
                    style={{
                      padding: "4px 10px",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 3,
                      color: "var(--text-4)",
                      cursor: "pointer",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              // Note display
              <div
                key={note.id}
                style={{
                  padding: "10px 12px",
                  background: "var(--panel-2)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 4,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--text-2)",
                      margin: "0 0 4px",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {note.body}
                  </p>
                  <span
                    className="mono"
                    style={{ fontSize: 8, color: "var(--text-4)", letterSpacing: "0.06em" }}
                  >
                    {fmtDate(note.updated_at !== note.created_at ? note.updated_at : note.created_at)}
                    {note.cloudId && (
                      <TffBadge variant="na" style={{ marginLeft: 6, fontSize: 7 }}>
                        synced
                      </TffBadge>
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => startEdit(note)}
                    className="mono"
                    style={{
                      padding: "2px 7px",
                      fontSize: 8,
                      letterSpacing: "0.06em",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 2,
                      color: "var(--text-4)",
                      cursor: "pointer",
                    }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(note)}
                    aria-label="Delete note"
                    style={{
                      padding: "2px 6px",
                      fontSize: 12,
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 2,
                      color: "var(--text-4)",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Add form */}
      {addOpen && (
        <div
          style={{
            padding: "10px 12px",
            background: "var(--panel-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
          }}
        >
          <textarea
            value={addBody}
            onChange={(e) => setAddBody(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Write a note…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd()
              if (e.key === "Escape") { setAddOpen(false); setAddBody("") }
            }}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: "var(--t-small)",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text)",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleAdd}
              disabled={!addBody.trim()}
              className="mono"
              style={{
                padding: "4px 12px",
                fontSize: 9,
                letterSpacing: "0.08em",
                background: addBody.trim() ? "var(--accent)" : "var(--panel-2)",
                border: "1px solid",
                borderColor: addBody.trim() ? "var(--accent)" : "var(--border)",
                borderRadius: 3,
                color: addBody.trim() ? "var(--bg)" : "var(--text-4)",
                cursor: addBody.trim() ? "pointer" : "default",
              }}
            >
              ADD NOTE
            </button>
            <button
              onClick={() => { setAddOpen(false); setAddBody("") }}
              className="mono"
              style={{
                padding: "4px 10px",
                fontSize: 9,
                letterSpacing: "0.08em",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text-4)",
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Empty state — only shown when loaded and nothing yet */}
      {notes.length === 0 && !addOpen && (
        <p
          className="mono"
          style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em", margin: 0 }}
        >
          No notes yet.
        </p>
      )}
    </div>
  )
}

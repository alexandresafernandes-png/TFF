"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import { createClient } from "@/lib/supabase/client"

type FormState = "idle" | "loading" | "sent" | "error" | "signed_in"
type LoginMode = "password" | "magic"

const URL_ERRORS: Record<string, string> = {
  auth_callback_failed:    "Sign-in link was invalid or expired. Please request a new one.",
  supabase_not_configured: "Supabase is not configured. Set environment variables to enable login.",
  missing_auth_code:       "No authentication code was received. Please request a new magic link.",
  session_not_persisted:   "Sign-in succeeded but the session could not be saved. Please try again.",
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginMode, setLoginMode] = useState<LoginMode>("password")
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)

  // Show URL ?error= param on mount (e.g. after a failed auth callback)
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error")
    if (err && URL_ERRORS[err]) {
      setFormState("error")
      setErrorMsg(URL_ERRORS[err])
    }
  }, [])

  // Check if user is already signed in — non-blocking, fail silent
  useEffect(() => {
    if (!hasSupabaseConfig) return
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user?.email) {
          setSessionEmail(session.user.email)
          setFormState("signed_in")
        }
      })
      .catch(() => {})
  }, [])

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!hasSupabaseConfig || !email.trim() || !password) return
    setFormState("loading")
    setErrorMsg("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        setFormState("error")
        setErrorMsg(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message,
        )
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setFormState("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!hasSupabaseConfig || !email.trim()) return
    setFormState("loading")
    setErrorMsg("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) {
        setFormState("error")
        setErrorMsg(error.message)
      } else {
        setFormState("sent")
      }
    } catch (err) {
      setFormState("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  function switchMode(mode: LoginMode) {
    setLoginMode(mode)
    setFormState("idle")
    setErrorMsg("")
    setPassword("")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 360,
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Product mark */}
        <div style={{ marginBottom: 32 }}>
          <p
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--text-4)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Operator Access
          </p>
          <h1
            style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "0.06em" }}
          >
            TFF
          </h1>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", marginTop: 6 }}>
            Private command center.
          </p>
        </div>

        {/* ── State A: Supabase not configured ── */}
        {!hasSupabaseConfig && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(232,177,74,0.06)",
                border: "1px solid rgba(232,177,74,0.24)",
                borderRadius: 4,
              }}
            >
              <p
                className="mono"
                style={{ fontSize: 10, color: "var(--warn)", letterSpacing: "0.1em", marginBottom: 8 }}
              >
                SUPABASE NOT CONFIGURED
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", lineHeight: 1.6 }}>
                TFF is running in local-first mode. To enable login, set{" "}
                <code
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    color: "var(--text-2)",
                  }}
                >
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 11,
                    color: "var(--text-2)",
                  }}
                >
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>
                .
              </p>
            </div>

            {/* Dimmed placeholder form */}
            <div style={{ opacity: 0.32, pointerEvents: "none" }}>
              <div style={{ marginBottom: 12 }}>
                <label className="kv-label" style={{ display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="operator@tff.private"
                  style={{ width: "100%" }}
                  disabled
                  readOnly
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="kv-label" style={{ display: "block", marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{ width: "100%" }}
                  disabled
                  readOnly
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled
              >
                Sign in
              </button>
            </div>

            <div
              style={{
                padding: "10px 14px",
                background: "var(--card-2)",
                border: "1px solid var(--border-soft)",
                borderRadius: 4,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <p
                className="mono"
                style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}
              >
                LOCAL-FIRST MODE · PHASE 1
              </p>
              <p
                className="mono"
                style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em" }}
              >
                App is fully accessible without login.
              </p>
            </div>
          </div>
        )}

        {/* ── State B: Already signed in ── */}
        {hasSupabaseConfig && formState === "signed_in" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "20px 16px",
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-line)",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                }}
              >
                ALREADY SIGNED IN
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", lineHeight: 1.6 }}>
                Signed in as{" "}
                <strong style={{ color: "var(--text)" }}>{sessionEmail}</strong>.
              </p>
            </div>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Back to dashboard
            </Link>
          </div>
        )}

        {/* ── State C: Magic link sent ── */}
        {hasSupabaseConfig && formState === "sent" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "20px 16px",
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-line)",
                borderRadius: 4,
                textAlign: "center",
              }}
            >
              <p
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  letterSpacing: "0.12em",
                  marginBottom: 10,
                }}
              >
                MAGIC LINK SENT
              </p>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", lineHeight: 1.6 }}>
                Check your inbox at{" "}
                <strong style={{ color: "var(--text)" }}>{email}</strong> and click the
                link to sign in.
              </p>
            </div>
            <button
              className="btn"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => switchMode("password")}
            >
              Back to sign in
            </button>
          </div>
        )}

        {/* ── State D: Active forms ── */}
        {hasSupabaseConfig && formState !== "sent" && formState !== "signed_in" && (
          <>
            {/* ── Password form (primary) ── */}
            {loginMode === "password" && (
              <form
                onSubmit={handlePasswordSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label className="kv-label" style={{ display: "block", marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@tff.private"
                    style={{ width: "100%" }}
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={formState === "loading"}
                  />
                </div>

                <div>
                  <label className="kv-label" style={{ display: "block", marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: "100%" }}
                    required
                    autoComplete="current-password"
                    disabled={formState === "loading"}
                  />
                </div>

                {formState === "error" && (
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--danger)",
                      padding: "8px 12px",
                      background: "var(--danger-soft)",
                      border: "1px solid rgba(200,69,69,0.3)",
                      borderRadius: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  disabled={formState === "loading" || !email.trim() || !password}
                >
                  {formState === "loading" ? "Signing in…" : "Sign in"}
                </button>

                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => switchMode("magic")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: "var(--t-small)",
                      color: "var(--text-4)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Send magic link instead
                  </button>
                </div>
              </form>
            )}

            {/* ── Magic link form (secondary) ── */}
            {loginMode === "magic" && (
              <form
                onSubmit={handleMagicLinkSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label className="kv-label" style={{ display: "block", marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@tff.private"
                    style={{ width: "100%" }}
                    required
                    autoFocus
                    autoComplete="email"
                    disabled={formState === "loading"}
                  />
                </div>

                {formState === "error" && (
                  <p
                    style={{
                      fontSize: "var(--t-small)",
                      color: "var(--danger)",
                      padding: "8px 12px",
                      background: "var(--danger-soft)",
                      border: "1px solid rgba(200,69,69,0.3)",
                      borderRadius: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  disabled={formState === "loading" || !email.trim()}
                >
                  {formState === "loading" ? "Sending…" : "Send magic link"}
                </button>

                <div
                  style={{
                    marginTop: 4,
                    padding: "10px 14px",
                    background: "var(--card-2)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <p
                    className="mono"
                    style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}
                  >
                    MAGIC LINK AUTH
                  </p>
                  <p
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-4)", letterSpacing: "0.08em" }}
                  >
                    A sign-in link will be sent to your email.
                  </p>
                </div>

                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => switchMode("password")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: "var(--t-small)",
                      color: "var(--text-4)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    ← Back to password sign in
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Back to app — always visible */}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <Link
            href="/"
            style={{ fontSize: "var(--t-small)", color: "var(--text-4)", textDecoration: "none" }}
          >
            ← Back to app
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { MobileNav } from "./MobileNav"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      {/* Desktop sidebar — hidden on mobile */}
      <div
        style={{
          display: "none",
        }}
        className="tff-sidebar"
      >
        <Sidebar />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: "32px",
            overflowY: "auto",
            /* Mobile: add bottom padding for nav bar */
            paddingBottom: "calc(32px + env(safe-area-inset-bottom))",
          }}
          className="tff-main"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="tff-mobile-nav">
        <MobileNav />
      </div>

      <style>{`
        /* Desktop: show sidebar, hide mobile nav */
        @media (min-width: 768px) {
          .tff-sidebar { display: flex !important; }
          .tff-mobile-nav { display: none !important; }
          .tff-main { padding-bottom: 32px !important; }
        }
        /* Mobile: hide sidebar, show mobile nav */
        @media (max-width: 767px) {
          .tff-sidebar { display: none !important; }
          .tff-mobile-nav { display: block !important; }
        }
      `}</style>
    </div>
  )
}

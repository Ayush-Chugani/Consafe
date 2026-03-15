'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileSidebar } from './MobileSidebar'
import { useUiStore } from '@/store/uiStore'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { sidebarOpen } = useUiStore()

  const sidebarWidth = sidebarOpen ? 240 : 72

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Permanent top cyan 2px accent bar */}
      <div
        className="page-load-topbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'var(--cyan)',
          boxShadow: '0 0 12px var(--cyan-glow)',
          zIndex: 9999,
        }}
      />

      {/* Desktop sidebar — fixed, hidden on mobile */}
      <aside
        className="anim-sidebar hidden lg:block"
        style={{
          position: 'fixed',
          top: 2,
          left: 0,
          width: sidebarWidth,
          height: 'calc(100vh - 2px)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          zIndex: 100,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </aside>

      {/* Desktop sidebar spacer so content doesn't sit under the fixed sidebar */}
      <div
        className="hidden lg:block shrink-0"
        style={{ width: sidebarWidth, transition: 'width 0.3s ease' }}
      />

      {/* Mobile slide-over sidebar */}
      <MobileSidebar />

      {/* Main content column */}
      <div
        className="page-load-content flex flex-col flex-1 min-w-0"
        style={{ paddingTop: 2 }}
      >
        {/* Top bar */}
        <div className="anim-header shrink-0">
          <TopBar />
        </div>

        {/* Scrollable page content */}
        <main
          className="anim-content flex-1 overflow-y-auto"
          style={{
            padding: '28px',
            background: 'var(--bg-base)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

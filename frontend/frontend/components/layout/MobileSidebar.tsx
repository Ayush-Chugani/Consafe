'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useUiStore } from '@/store/uiStore'

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebar } = useUiStore()

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileSidebar(false)
    }
    if (mobileSidebarOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileSidebarOpen, setMobileSidebar])

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileSidebarOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setMobileSidebar(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 200,
          opacity: mobileSidebarOpen ? 1 : 0,
          pointerEvents: mobileSidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 260,
          height: '100vh',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          zIndex: 201,
          transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '8px 8px 0',
          }}
        >
          <button
            onClick={() => setMobileSidebar(false)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* Reuse Sidebar with forceExpanded */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Sidebar forceExpanded />
        </div>
      </div>
    </>
  )
}

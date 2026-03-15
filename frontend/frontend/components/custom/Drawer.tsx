'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  width?: number | string
  children: React.ReactNode
  /** Don't close on outside click */
  noBackdropClose?: boolean
}

interface DrawerHeaderProps {
  title: string
  subtitle?: string
  onClose?: () => void
}

interface DrawerBodyProps {
  children: React.ReactNode
  padding?: number | string
}

/* ─── Drawer ─────────────────────────────────────────────────── */
export function Drawer({ open, onClose, title, subtitle, width = 480, children, noBackdropClose }: DrawerProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={noBackdropClose ? undefined : onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 300,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: typeof width === 'number' ? `${width}px` : width,
          height: '100vh',
          maxWidth: '100vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 301,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {(title || subtitle) && (
          <DrawerHeader title={title ?? ''} subtitle={subtitle} onClose={onClose} />
        )}
        {children}
      </div>
    </>
  )
}

/* ─── DrawerHeader ──────────────────────────────────────────── */
export function DrawerHeader({ title, subtitle, onClose }: DrawerHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '22px 24px 18px',
        borderBottom: '1px solid var(--border)',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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
          aria-label="Close drawer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/* ─── DrawerBody ────────────────────────────────────────────── */
export function DrawerBody({ children, padding = '20px 24px' }: DrawerBodyProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding,
      }}
    >
      {children}
    </div>
  )
}

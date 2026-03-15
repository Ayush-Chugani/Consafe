'use client'

import React, { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  maxWidth?: number | string
  children: React.ReactNode
  /** Don't close on outside click */
  noBackdropClose?: boolean
}

interface ModalHeaderProps {
  title: string
  subtitle?: string
  onClose?: () => void
}

interface ModalBodyProps {
  children: React.ReactNode
  padding?: number | string
}

interface ModalFooterProps {
  children: React.ReactNode
}

/* ─── Overlay ───────────────────────────────────────────────── */
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.72)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  zIndex: 400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  animation: 'fadeIn 0.18s ease',
}

/* ─── Modal ─────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, subtitle, maxWidth = 560, children, noBackdropClose }: ModalProps) {
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

  if (!open) return null

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={overlayStyle}
          onClick={noBackdropClose ? undefined : onClose}
        >
          <Dialog.Content
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              width: '100%',
              maxWidth,
              maxHeight: 'calc(100vh - 48px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              animation: 'fadeUp 0.22s ease',
            }}
          >
            {(title || subtitle) && (
              <ModalHeader title={title ?? ''} subtitle={subtitle} onClose={onClose} />
            )}
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/* ─── ModalHeader ───────────────────────────────────────────── */
export function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '24px 28px 20px',
        borderBottom: '1px solid var(--border)',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <div>
        <Dialog.Title asChild>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </Dialog.Title>
        {subtitle && (
          <Dialog.Description asChild>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {subtitle}
            </p>
          </Dialog.Description>
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
          aria-label="Close modal"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/* ─── ModalBody ─────────────────────────────────────────────── */
export function ModalBody({ children, padding = '20px 28px' }: ModalBodyProps) {
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

/* ─── ModalFooter ───────────────────────────────────────────── */
export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        padding: '16px 28px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}

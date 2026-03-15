'use client'

import React, { useEffect } from 'react'
import { X, Clock, ShieldAlert } from 'lucide-react'
import type { Worker, AttendanceRecord } from '@/api/types'

interface Props {
  date: string | null
  worker: Worker | null
  open: boolean
  onClose: () => void
  attendanceRecord?: AttendanceRecord | null
}

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function DayDetailDrawer({ date, worker, open, onClose, attendanceRecord }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 900,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 380,
          maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 901,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 4,
              }}
            >
              {worker?.name ?? 'Worker'}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: 'var(--cyan)',
              }}
            >
              {formattedDate}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              color: 'var(--text-secondary)', flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Clock In section */}
          <section>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--green)',
                letterSpacing: '0.08em',
                marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Clock size={12} /> CLOCK IN
            </div>
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 20,
                  color: 'var(--text-primary)',
                  marginBottom: 10,
                }}
              >
                {formatTs(attendanceRecord?.clockInTime ?? null)}
              </div>
              {attendanceRecord?.clockInProofUrl ? (
                <img
                  src={attendanceRecord.clockInProofUrl}
                  alt="Clock-in proof"
                  style={{
                    width: '100%', borderRadius: 6,
                    border: '1px solid var(--border)',
                    objectFit: 'cover', maxHeight: 140,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px dashed var(--border)', borderRadius: 6,
                    color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11,
                  }}
                >
                  NO PROOF FRAME
                </div>
              )}
              {attendanceRecord?.clockInConfidence != null && (
                <div
                  style={{
                    marginTop: 8, fontFamily: "'DM Mono', monospace",
                    fontSize: 11, color: 'var(--green)',
                  }}
                >
                  Confidence: {(attendanceRecord.clockInConfidence * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </section>

          {/* Clock Out section */}
          <section>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--cyan)',
                letterSpacing: '0.08em',
                marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Clock size={12} /> CLOCK OUT
            </div>
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 20,
                  color: 'var(--text-primary)',
                  marginBottom: 10,
                }}
              >
                {formatTs(attendanceRecord?.clockOutTime ?? null)}
              </div>
              {attendanceRecord?.clockOutProofUrl ? (
                <img
                  src={attendanceRecord.clockOutProofUrl}
                  alt="Clock-out proof"
                  style={{
                    width: '100%', borderRadius: 6,
                    border: '1px solid var(--border)',
                    objectFit: 'cover', maxHeight: 140,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px dashed var(--border)', borderRadius: 6,
                    color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11,
                  }}
                >
                  NO PROOF FRAME
                </div>
              )}
            </div>
          </section>

          {/* PPE Events (placeholder) */}
          <section>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--amber)',
                letterSpacing: '0.08em',
                marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <ShieldAlert size={12} /> PPE EVENTS
            </div>
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 14,
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              No PPE violations recorded this day.
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </>
  )
}

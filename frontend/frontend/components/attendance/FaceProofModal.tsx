'use client'

import React, { useEffect } from 'react'
import { X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AttendanceRecord } from '@/api/types'

interface WorkerInfo {
  id: string
  name: string
  workerCode: string
  department: string
  referencePhotoUrl: string | null
}

interface Props {
  record: (AttendanceRecord & { worker?: WorkerInfo }) | null
  open: boolean
  onClose: () => void
}

function formatTs(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function FaceProofModal({ record, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open || !record) return null

  const worker = record.worker

  const metaRows = [
    { label: 'TIMESTAMP',     value: formatTs(record.clockInTime) },
    { label: 'CLOCK OUT',     value: formatTs(record.clockOutTime) },
    { label: 'CAMERA IN',     value: record.clockInCameraId ?? '—' },
    { label: 'CAMERA OUT',    value: record.clockOutCameraId ?? '—' },
    { label: 'LOCATION',      value: worker?.department ?? '—' },
    { label: 'CONFIDENCE',    value: record.clockInConfidence != null ? `${(record.clockInConfidence * 100).toFixed(2)}%` : '—' },
    { label: 'STATUS',        value: record.status.toUpperCase() },
    { label: 'RECORD ID',     value: record.id.slice(0, 16) + '…' },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw', maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          zIndex: 1001,
          animation: 'fadeUp 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {worker?.name ?? 'Unknown Worker'}
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              {worker?.workerCode ?? '—'} · FACE PROOF RECORD
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Photo comparison */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            padding: '20px 20px 0',
          }}
        >
          {/* Reference photo */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              REFERENCE PHOTO
            </div>
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                aspectRatio: '1',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {worker?.referencePhotoUrl ? (
                <img
                  src={worker.referencePhotoUrl}
                  alt="Reference"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                  NO PHOTO
                </span>
              )}
            </div>
          </div>

          {/* Detected frame */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}
            >
              DETECTED FRAME
            </div>
            <div
              style={{
                border: '1px solid var(--cyan-border, rgba(0,212,255,0.35))',
                borderRadius: 8,
                overflow: 'hidden',
                aspectRatio: '1',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {record.clockInProofUrl ? (
                <img
                  src={record.clockInProofUrl}
                  alt="Detection"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                  NO FRAME
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 1,
            margin: '20px 20px 0',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {metaRows.map((row) => (
            <div
              key={row.label}
              style={{
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRight: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  marginBottom: 4,
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            marginTop: 16,
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 6,
              color: 'var(--red)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={12} />
            REPORT FALSE DETECTION
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              style={{
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              style={{
                padding: '8px 12px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

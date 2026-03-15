'use client'

import React, { useEffect, useCallback } from 'react'
import { X, Download, Copy, Flag, FileText } from 'lucide-react'
import type { ViolationFrame, Worker } from '@/api/types'

interface Props {
  frame: ViolationFrame | null
  worker: Worker | null
  open: boolean
  onClose: () => void
}

export default function ProofImageModal({ frame, worker, open, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open || !frame) return null

  const missingList  = frame.missingItems ? frame.missingItems.split(',').filter(Boolean) : []
  const detectedList = ['helmet', 'vest', 'gloves', 'goggles', 'mask'].filter(
    (i) => !missingList.map((m) => m.toLowerCase().trim()).some((m) => m.includes(i))
  )

  const copyEvidence = () => {
    navigator.clipboard.writeText(frame.id).catch(() => {})
  }

  const downloadFrame = () => {
    const a = document.createElement('a')
    a.href = frame.frameJpegUrl
    a.download = `violation_${frame.id}.jpg`
    a.click()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.80)',
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
          width: '92vw', maxWidth: 800,
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
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 15, fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 3,
              }}
            >
              VIOLATION EVIDENCE FRAME
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, color: 'var(--text-muted)',
              }}
            >
              {frame.id}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Image */}
        <div style={{ padding: '16px 20px 0' }}>
          <img
            src={frame.frameJpegUrl}
            alt="Violation frame"
            style={{
              width: '100%', maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              display: 'block',
            }}
          />
        </div>

        {/* Metadata + items */}
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left: metadata */}
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.08em' }}>
              METADATA
            </div>
            {[
              { label: 'RECORD ID',  value: frame.id.slice(0, 16) + '…' },
              { label: 'TIMESTAMP',  value: new Date(frame.frameTimestamp * 1000).toISOString() },
              { label: 'FRAME #',    value: frame.frameIndex.toLocaleString() },
              { label: 'CAMERA',     value: frame.cameraId ?? '—' },
              { label: 'WORKER',     value: worker?.name ?? frame.workerId ?? '—' },
              { label: 'CONFIDENCE', value: frame.confidenceScore != null ? `${(frame.confidenceScore * 100).toFixed(1)}%` : '—' },
              { label: 'JOB REF',   value: frame.jobId.slice(0, 8) + '…' },
            ].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 11, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Right: detected / missing */}
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--red)', marginBottom: 8, letterSpacing: '0.08em' }}>
                MISSING PPE
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {missingList.length > 0 ? missingList.map((item) => (
                  <span key={item} style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--red-dim)', border: '1px solid var(--red)33',
                    fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--red)',
                  }}>
                    {item.trim()}
                  </span>
                )) : (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--green)' }}>None</span>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--green)', marginBottom: 8, letterSpacing: '0.08em' }}>
                DETECTED PPE
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {detectedList.map((item) => (
                  <span key={item} style={{
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--green-dim)', border: '1px solid var(--green)33',
                    fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'var(--green)',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: '12px 20px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 10, flexWrap: 'wrap',
          }}
        >
          <button
            onClick={downloadFrame}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'var(--cyan-dim)',
              border: '1px solid var(--cyan)',
              borderRadius: 6,
              color: 'var(--cyan)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer',
            }}
          >
            <Download size={13} /> DOWNLOAD FRAME
          </button>
          <button
            onClick={copyEvidence}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer',
            }}
          >
            <Copy size={13} /> COPY EVIDENCE ID
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'var(--amber-dim)',
              border: '1px solid var(--amber)',
              borderRadius: 6,
              color: 'var(--amber)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer',
            }}
          >
            <Flag size={13} /> FLAG FOR REVIEW
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--violet)',
              fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: 'pointer',
            }}
          >
            <FileText size={13} /> EXPORT AS PDF
          </button>
        </div>
      </div>
    </>
  )
}
